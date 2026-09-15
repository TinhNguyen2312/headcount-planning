import { NextRequest } from "next/server"
import { eq, inArray } from "drizzle-orm"
import {
  db,
  headcountStandards,
  propertyValues,
  properties,
  roles,
  projects,
} from "@/db"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type {
  CriteriaMatchEvaluation,
  EvaluateStandardPayload,
  HeadcountStandardResponse,
  StandardMatchResult,
} from "@/types"

function isStandardApplicable(
  standardProjectType: string | null | undefined,
  projectTypes: string[],
): boolean {
  if (!standardProjectType || standardProjectType === "ALL") return true
  if (standardProjectType === "LOW_RISE")
    return projectTypes.includes("LOW_RISE")
  if (standardProjectType === "HIGH_RISE")
    return projectTypes.includes("HIGH_RISE")
  if (standardProjectType === "MIXED")
    return (
      projectTypes.includes("LOW_RISE") && projectTypes.includes("HIGH_RISE")
    )
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body: EvaluateStandardPayload = await req.json()
    const { projectId, roleId, roleIds } = body

    if (!projectId) {
      return apiError("Vui lòng cung cấp projectId", 400, 400)
    }

    // 0. Fetch project info (especially projectTypes)
    const [project] = await db
      .select({ id: projects.id, projectTypes: projects.projectTypes })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project) {
      return apiError("Dự án không tồn tại trong hệ thống", 404, 404)
    }

    const projectTypes: string[] = Array.isArray(project.projectTypes)
      ? project.projectTypes
      : ["HIGH_RISE"]

    // 1. Fetch project property values
    const pValues = await db
      .select({
        propertyId: propertyValues.propertyId,
        projectType: propertyValues.projectType,
        propertyCode: properties.code,
        propertyName: properties.name,
        dataType: properties.dataType,
        scope: properties.scope,
        valueNumber: propertyValues.valueNumber,
        valueText: propertyValues.valueText,
      })
      .from(propertyValues)
      .innerJoin(properties, eq(propertyValues.propertyId, properties.id))
      .where(eq(propertyValues.projectId, projectId))

    const projectPropMap = new Map<
      number,
      {
        propertyCode: string
        propertyName: string
        dataType: string
        valueNumber: number | null
        valueText: string | null
        valuesByType: Record<
          string,
          { valueNumber: number | null; valueText: string | null }
        >
      }
    >()

    for (const pv of pValues) {
      const numVal = pv.valueNumber !== null ? Number(pv.valueNumber) : null
      const pType = pv.projectType || "COMMON"
      const existing = projectPropMap.get(pv.propertyId)

      if (!existing) {
        projectPropMap.set(pv.propertyId, {
          propertyCode: pv.propertyCode,
          propertyName: pv.propertyName,
          dataType: pv.dataType,
          valueNumber: numVal,
          valueText: pv.valueText,
          valuesByType: {
            [pType]: { valueNumber: numVal, valueText: pv.valueText },
          },
        })
      } else {
        if (existing.dataType === "NUMBER") {
          existing.valueNumber = (existing.valueNumber || 0) + (numVal || 0)
        } else if (!existing.valueText && pv.valueText) {
          existing.valueText = pv.valueText
        }
        existing.valuesByType[pType] = {
          valueNumber: numVal,
          valueText: pv.valueText,
        }
      }
    }

    // 2. Fetch target candidate standards
    const targetRoleIds: number[] = []
    if (roleId) {
      targetRoleIds.push(roleId)
    } else if (roleIds && roleIds.length > 0) {
      targetRoleIds.push(...roleIds)
    }

    const whereCondition =
      targetRoleIds.length > 0
        ? inArray(headcountStandards.roleId, targetRoleIds)
        : undefined

    const candidateStandards = await db.query.headcountStandards.findMany({
      where: whereCondition,
      with: {
        role: {
          with: {
            department: true,
          },
        },
        fromMilestone: true,
        toMilestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
      },
    })

    // Group standards by roleId
    const standardsByRole = new Map<number, typeof candidateStandards>()
    for (const std of candidateStandards) {
      const list = standardsByRole.get(std.roleId) || []
      list.push(std)
      standardsByRole.set(std.roleId, list)
    }

    // 3. Evaluate each role's candidate standards
    const results: StandardMatchResult[] = []

    for (const [rId, standards] of standardsByRole.entries()) {
      const roleName = standards[0]?.role?.name || `Role ${rId}`
      let matchedStandard: HeadcountStandardResponse | null = null
      let matchedCriteriaDetails: CriteriaMatchEvaluation[] = []
      let isMatch = false

      for (const std of standards) {
        // Filter out standards not applicable to the project's development types
        if (!isStandardApplicable(std.projectType, projectTypes)) {
          continue
        }

        const criteriaList = std.headcountCriteria || []
        const currentEvaluations: CriteriaMatchEvaluation[] = []
        let allCriteriaSatisfied = true

        for (const crit of criteriaList) {
          const projectProp = projectPropMap.get(crit.propertyId)
          const propCode =
            crit.property?.code || projectProp?.propertyCode || ""
          const propName =
            crit.property?.name || projectProp?.propertyName || ""

          let satisfied = false
          let projectVal: number | string | null = null

          const minVal = crit.minValue !== null ? Number(crit.minValue) : null
          const maxVal = crit.maxValue !== null ? Number(crit.maxValue) : null

          if (projectProp) {
            if (projectProp.dataType === "NUMBER") {
              const num = projectProp.valueNumber
              projectVal = num
              if (num !== null) {
                switch (crit.conditionOperator) {
                  case "=":
                    satisfied =
                      minVal !== null && Math.abs(num - minVal) < 0.0001
                    break
                  case "<":
                    satisfied = maxVal !== null && num < maxVal
                    break
                  case "<=":
                    satisfied = maxVal !== null && num <= maxVal
                    break
                  case ">":
                    satisfied = minVal !== null && num > minVal
                    break
                  case ">=":
                    satisfied = minVal !== null && num >= minVal
                    break
                  case "BETWEEN":
                    satisfied =
                      (minVal === null || num >= minVal) &&
                      (maxVal === null || num <= maxVal)
                    break
                }
              }
            } else {
              // String / Select / Boolean
              const text = projectProp.valueText
              projectVal = text
              if (text !== null && text !== undefined) {
                if (crit.conditionOperator === "=") {
                  const targetVal =
                    crit.valueText ?? (minVal !== null ? String(minVal) : "")
                  satisfied =
                    targetVal.trim().toLowerCase() ===
                      text.trim().toLowerCase() ||
                    Boolean(crit.note && crit.note.includes(text))
                }
              }
            }
          }

          currentEvaluations.push({
            propertyId: crit.propertyId,
            propertyCode: propCode,
            propertyName: propName,
            conditionOperator: crit.conditionOperator as any,
            expectedMin: minVal,
            expectedMax: maxVal,
            expectedText: crit.valueText || null,
            projectValue: projectVal,
            satisfied,
          })

          if (!satisfied) {
            allCriteriaSatisfied = false
          }
        }

        // If standard has no criteria, or all its criteria are satisfied
        if (allCriteriaSatisfied) {
          isMatch = true
          matchedCriteriaDetails = currentEvaluations
          matchedStandard = {
            id: std.id,
            roleId: std.roleId,
            role: {
              id: std.role.id,
              code: std.role.code,
              shortCode: std.role.shortCode,
              name: std.role.name,
              level: std.role.level,
              parentRoleId: std.role.parentRoleId,
              departmentId: std.role.departmentId,
              departmentName: std.role.department?.name || null,
              departmentCode: std.role.department?.code || null,
              planningMethod: std.role.planningMethod as any,
              description: std.role.description,
              createdAt: std.role.createdAt,
            },
            fromMilestoneId: std.fromMilestoneId,
            toMilestoneId: std.toMilestoneId,
            fromMilestone: std.fromMilestone
              ? {
                  id: std.fromMilestone.id,
                  code: std.fromMilestone.code,
                  name: std.fromMilestone.name,
                  description: std.fromMilestone.description,
                  isActive: std.fromMilestone.isActive,
                  createdAt: std.fromMilestone.createdAt,
                }
              : ({} as any),
            toMilestone: std.toMilestone
              ? {
                  id: std.toMilestone.id,
                  code: std.toMilestone.code,
                  name: std.toMilestone.name,
                  description: std.toMilestone.description,
                  isActive: std.toMilestone.isActive,
                  createdAt: std.toMilestone.createdAt,
                }
              : null,
            headcount: Number(std.headcount),
            headcountMin:
              std.headcountMin !== null ? Number(std.headcountMin) : null,
            headcountMax:
              std.headcountMax !== null ? Number(std.headcountMax) : null,
            note: std.note,
            fromLeadTimeMonths: std.fromLeadTimeMonths ?? 0,
            toLeadTimeMonths: std.toLeadTimeMonths ?? 0,
            criteriaCount: criteriaList.length,
            criteria: criteriaList.map((c: any) => ({
              id: c.id,
              standardId: c.standardId,
              propertyId: c.propertyId,
              conditionOperator: c.conditionOperator,
              minValue: c.minValue !== null ? Number(c.minValue) : null,
              maxValue: c.maxValue !== null ? Number(c.maxValue) : null,
              valueText: c.valueText || null,
              note: c.note,
              property: c.property,
            })),
            durationMonths: std.durationMonths
              ? Number(std.durationMonths)
              : 12,
            monthlyFactors: Array.isArray(std.monthlyFactors)
              ? std.monthlyFactors.map(Number)
              : Array(
                  std.durationMonths ? Number(std.durationMonths) : 12,
                ).fill(1.0),
            projectType: (std.projectType || "ALL") as any,
            createdAt: std.createdAt,
            updatedAt: std.updatedAt,
          }
          break // Found best match
        }
      }

      results.push({
        roleId: rId,
        roleName,
        standard: matchedStandard,
        matchedCriteria: matchedCriteriaDetails,
        isMatch,
      })
    }

    return apiSuccess(results, "Đánh giá định biên chuẩn thành công")
  } catch (error: any) {
    console.error("POST /api/standards/evaluate error:", error)
    return apiError(
      "Lỗi hệ thống khi đánh giá định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}
