import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import {
  db,
  headcountStandards,
  headcountCriteria,
  headcountMonthlyFactors,
  roles,
  milestones,
} from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type {
  ConditionOperator,
  HeadcountCriteriaInput,
  HeadcountMonthlyFactorInput,
  HeadcountStandardResponse,
  HeadcountStandardUpdatePayload,
} from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

function formatStandard(standard: any): HeadcountStandardResponse {
  const roleObj = standard.role
    ? {
        id: standard.role.id,
        code: standard.role.code,
        shortCode: standard.role.shortCode,
        name: standard.role.name,
        level: standard.role.level,
        parentRoleId: standard.role.parentRoleId,
        departmentId: standard.role.departmentId,
        departmentName: standard.role.department?.name || null,
        departmentCode: standard.role.department?.code || null,
        planningMethod: standard.role.planningMethod,
        leadTimeMonths: standard.role.leadTimeMonths,
        description: standard.role.description,
        createdAt: standard.role.createdAt,
      }
    : ({} as any)

  const milestoneObj = standard.milestone
    ? {
        id: standard.milestone.id,
        code: standard.milestone.code,
        name: standard.milestone.name,
        description: standard.milestone.description,
        isActive: standard.milestone.isActive,
        createdAt: standard.milestone.createdAt,
      }
    : ({} as any)

  const criteriaList = (standard.headcountCriteria || []).map((c: any) => ({
    id: c.id,
    standardId: c.standardId,
    propertyId: c.propertyId,
    conditionOperator: c.conditionOperator as ConditionOperator,
    minValue: c.minValue !== null ? Number(c.minValue) : null,
    maxValue: c.maxValue !== null ? Number(c.maxValue) : null,
    valueText: c.valueText || null,
    note: c.note || null,
    property: c.property
      ? {
          id: c.property.id,
          code: c.property.code,
          name: c.property.name,
          dataType: c.property.dataType,
          unit: c.property.unit,
          options: c.property.options,
          description: c.property.description,
          isActive: c.property.isActive,
          createdAt: c.property.createdAt,
          updatedAt: c.property.updatedAt,
        }
      : ({} as any),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))

  const durationMonths = standard.durationMonths
    ? Number(standard.durationMonths)
    : 12
  const rawFactors = Array.isArray(standard.monthlyFactors)
    ? standard.monthlyFactors.map((f: any) => Number(f))
    : []
  const monthlyFactorsList =
    rawFactors.length > 0 ? rawFactors : Array(durationMonths).fill(1.0)

  return {
    id: standard.id,
    roleId: standard.roleId,
    role: roleObj,
    milestoneId: standard.milestoneId,
    milestone: milestoneObj,
    headcount: Number(standard.headcount),
    headcountMin:
      standard.headcountMin !== null ? Number(standard.headcountMin) : null,
    headcountMax:
      standard.headcountMax !== null ? Number(standard.headcountMax) : null,
    note: standard.note ?? null,
    durationMonths,
    monthlyFactors: monthlyFactorsList,
    criteriaCount: criteriaList.length,
    criteria: criteriaList,
    createdAt: standard.createdAt,
    updatedAt: standard.updatedAt,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const standard = await db.query.headcountStandards.findFirst({
      where: eq(headcountStandards.id, id),
      with: {
        role: {
          with: {
            department: true,
          },
        },
        milestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
      },
    })

    if (!standard) {
      return apiError("Không tìm thấy định biên chuẩn", 404, 404)
    }

    return apiSuccess(
      formatStandard(standard),
      "Lấy chi tiết định biên chuẩn thành công",
    )
  } catch (error: any) {
    console.error("GET /api/standards/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi tải định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionToken)
    if (!user) {
      return apiError("Unauthorized", 401, 401)
    }

    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const [existing] = await db
      .select({
        id: headcountStandards.id,
        durationMonths: headcountStandards.durationMonths,
      })
      .from(headcountStandards)
      .where(eq(headcountStandards.id, id))
      .limit(1)

    if (!existing) {
      return apiError("Không tìm thấy định biên chuẩn để cập nhật", 404, 404)
    }

    const body: HeadcountStandardUpdatePayload = await req.json()

    // Validate role if updating roleId
    if (body.roleId) {
      const [existingRole] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.id, body.roleId))
        .limit(1)
      if (!existingRole) {
        return apiError("Chức danh không tồn tại trong hệ thống", 400, 400)
      }
    }

    // Validate milestone if updating milestoneId
    if (body.milestoneId) {
      const [existingMilestone] = await db
        .select({ id: milestones.id })
        .from(milestones)
        .where(eq(milestones.id, body.milestoneId))
        .limit(1)
      if (!existingMilestone) {
        return apiError("Mốc kiểm soát không tồn tại trong hệ thống", 400, 400)
      }
    }

    const currentDuration =
      body.durationMonths !== undefined
        ? Number(body.durationMonths)
        : existing.durationMonths
          ? Number(existing.durationMonths)
          : 12

    if (body.durationMonths !== undefined) {
      if (currentDuration < 6 || currentDuration > 60) {
        return apiError(
          `Thời lượng chu kỳ phân bổ phải từ 6 đến 60 tháng (nhận ${currentDuration} tháng)`,
          400,
          400,
        )
      }
    }

    let normalizedFactors: number[] | undefined = undefined
    if (body.monthlyFactors !== undefined) {
      const raw = body.monthlyFactors
      let factorsList: number[] = []
      if (Array.isArray(raw)) {
        if (raw.length > 0 && typeof raw[0] === "number") {
          factorsList = raw.map(Number)
        } else if (
          raw.length > 0 &&
          typeof raw[0] === "object" &&
          raw[0] !== null
        ) {
          factorsList = raw.map((f: any) => Number(f.factor ?? 1.0))
        }
      }

      if (factorsList.length < currentDuration) {
        while (factorsList.length < currentDuration) {
          factorsList.push(1.0)
        }
      } else if (factorsList.length > currentDuration) {
        factorsList = factorsList.slice(0, currentDuration)
      }

      for (let i = 0; i < factorsList.length; i++) {
        const f = factorsList[i]
        if (isNaN(f) || f < 0 || f > 10) {
          return apiError(
            `Hệ số phân bổ của tháng T${i + 1} phải nằm trong khoảng từ 0.0 đến 10.0`,
            400,
            400,
          )
        }
      }
      normalizedFactors = factorsList
    }

    await db.transaction(async (tx) => {
      // 1. Build standard update values
      const updateValues: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      }

      if (body.roleId !== undefined) updateValues.roleId = body.roleId
      if (body.milestoneId !== undefined)
        updateValues.milestoneId = body.milestoneId
      if (body.headcount !== undefined)
        updateValues.headcount = String(body.headcount)
      if (body.headcountMin !== undefined)
        updateValues.headcountMin =
          body.headcountMin !== null ? String(body.headcountMin) : null
      if (body.headcountMax !== undefined)
        updateValues.headcountMax =
          body.headcountMax !== null ? String(body.headcountMax) : null
      if (body.note !== undefined) updateValues.note = body.note?.trim() || null
      if (body.durationMonths !== undefined)
        updateValues.durationMonths = currentDuration
      if (normalizedFactors !== undefined)
        updateValues.monthlyFactors = normalizedFactors

      await tx
        .update(headcountStandards)
        .set(updateValues)
        .where(eq(headcountStandards.id, id))

      // 2. Sync criteria if provided
      if (body.criteria !== undefined) {
        await tx
          .delete(headcountCriteria)
          .where(eq(headcountCriteria.standardId, id))

        if (body.criteria && body.criteria.length > 0) {
          const criteriaToInsert = body.criteria.map(
            (c: HeadcountCriteriaInput) => ({
              standardId: id,
              propertyId: c.propertyId,
              conditionOperator: c.conditionOperator,
              minValue:
                c.minValue !== undefined && c.minValue !== null
                  ? String(c.minValue)
                  : null,
              maxValue:
                c.maxValue !== undefined && c.maxValue !== null
                  ? String(c.maxValue)
                  : null,
              valueText: c.valueText?.trim() || null,
              note: c.note?.trim() || null,
            }),
          )
          await tx.insert(headcountCriteria).values(criteriaToInsert)
        }
      }
    })

    // Fetch updated standard with relations
    const updatedRecord = await db.query.headcountStandards.findFirst({
      where: eq(headcountStandards.id, id),
      with: {
        role: {
          with: {
            department: true,
          },
        },
        milestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
      },
    })

    return apiSuccess(
      formatStandard(updatedRecord),
      "Cập nhật định biên chuẩn thành công",
    )
  } catch (error: any) {
    console.error("PATCH /api/standards/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi cập nhật định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionToken)
    if (!user) {
      return apiError("Unauthorized", 401, 401)
    }

    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const [existing] = await db
      .select({ id: headcountStandards.id })
      .from(headcountStandards)
      .where(eq(headcountStandards.id, id))
      .limit(1)

    if (!existing) {
      return apiError("Không tìm thấy định biên chuẩn để xóa", 404, 404)
    }

    await db.delete(headcountStandards).where(eq(headcountStandards.id, id))

    return apiSuccess(null, "Xóa định biên chuẩn thành công")
  } catch (error: any) {
    console.error("DELETE /api/standards/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi xóa định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}
