import dayjs from "dayjs"
import { and, eq, inArray, or, type SQL, sql } from "drizzle-orm"
import {
  db,
  headcountProjects,
  headcountStandards,
  plans,
  projects,
  regions,
  roles,
  sectors,
} from "@/db"
import type { PlanningMethod } from "@/types"
import { isPhaseInDateRange } from "./calculationEngine"
import type { HeadcountCalculationParams } from "./types"

export type LoadedProject = Awaited<ReturnType<typeof queryProjects>>[number]
export type LoadedRole = Awaited<ReturnType<typeof queryRoles>>[number]
export type LoadedStandard = Awaited<ReturnType<typeof queryStandards>>[number]
export type LoadedPhase = LoadedProject["plans"][number]["phases"][number]
export type LoadedPropertyValue = LoadedProject["propertyValues"][number]
export type LoadedCriterion = LoadedStandard["headcountCriteria"][number]

function buildIdOrCodeCondition(
  idColumn: any,
  codeColumn: any,
  identifier: string | number,
): SQL {
  const numId =
    typeof identifier === "number" ? identifier : parseInt(identifier, 10)
  return !isNaN(numId)
    ? or(eq(idColumn, numId), eq(codeColumn, String(identifier)))!
    : eq(codeColumn, String(identifier))
}

export async function resolveScope(
  scopeType: PlanningMethod,
  scopeId: string | number,
): Promise<{ scopeName: string; projectIds: number[] }> {
  switch (scopeType) {
    case "BY_PROJECT": {
      const [proj] = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(buildIdOrCodeCondition(projects.id, projects.code, scopeId))
      return {
        scopeName: proj ? proj.name : "Dự án không tồn tại",
        projectIds: proj ? [proj.id] : [],
      }
    }

    case "BY_REGION": {
      const [reg] = await db
        .select({ id: regions.id, name: regions.name })
        .from(regions)
        .where(buildIdOrCodeCondition(regions.id, regions.code, scopeId))
      if (!reg) return { scopeName: "Vùng không tồn tại", projectIds: [] }

      const projs = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.regionId, reg.id))
      return { scopeName: reg.name, projectIds: projs.map((p) => p.id) }
    }

    case "BY_SECTOR": {
      const [sec] = await db
        .select({ id: sectors.id, name: sectors.name })
        .from(sectors)
        .where(buildIdOrCodeCondition(sectors.id, sectors.code, scopeId))
      if (!sec) return { scopeName: "Khu vực không tồn tại", projectIds: [] }

      const regRows = await db
        .select({ id: regions.id })
        .from(regions)
        .where(eq(regions.sectorId, sec.id))
      const regionIds = regRows.map((r) => r.id)
      if (regionIds.length === 0) return { scopeName: sec.name, projectIds: [] }

      const projs = await db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.regionId, regionIds))
      return { scopeName: sec.name, projectIds: projs.map((p) => p.id) }
    }

    default:
      return { scopeName: "Phạm vi không hợp lệ", projectIds: [] }
  }
}

export async function queryProjects(projectIds: number[]) {
  if (projectIds.length === 0) return []
  return db.query.projects.findMany({
    where: inArray(projects.id, projectIds),
    with: {
      region: true,
      plans: {
        where: eq(plans.status, "ACTIVE"),
        with: {
          phases: {
            with: {
              milestone: true,
            },
          },
        },
      },
      propertyValues: {
        with: {
          property: true,
        },
      },
    },
  })
}

export async function queryRoles(scopeType: PlanningMethod) {
  return db.query.roles.findMany({
    where: eq(roles.planningMethod, scopeType),
    with: {
      department: true,
    },
  })
}

export async function queryStandards(
  roleIds: number[],
  projectTypes?: string[],
  milestoneIds?: number[],
) {
  if (roleIds.length === 0) return []

  const conditions: SQL[] = [inArray(headcountStandards.roleId, roleIds)]

  if (projectTypes && projectTypes.length > 0) {
    const applicableTypes = new Set<string>(["ALL"])
    for (const pt of projectTypes) {
      applicableTypes.add(pt)
      if (pt === "MIXED") {
        applicableTypes.add("LOW_RISE")
        applicableTypes.add("HIGH_RISE")
      }
    }
    conditions.push(
      inArray(headcountStandards.projectType, Array.from(applicableTypes)),
    )
  }

  if (milestoneIds && milestoneIds.length > 0) {
    const orMilestoneConditions = milestoneIds.map((mId) =>
      and(
        sql`${headcountStandards.fromMilestoneId} <= ${mId}`,
        or(
          sql`${headcountStandards.toMilestoneId} IS NULL`,
          sql`${headcountStandards.toMilestoneId} >= ${mId}`,
        ),
      ),
    )
    conditions.push(or(...orMilestoneConditions)!)
  }

  return db.query.headcountStandards.findMany({
    where: and(...conditions),
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
      headcountMonthlyFactors: true,
    },
  })
}

export async function loadProjectScopeData(
  params: HeadcountCalculationParams,
): Promise<{
  scopeName: string
  projects: LoadedProject[]
  roles: LoadedRole[]
  standards: LoadedStandard[]
}> {
  const { scopeType, scopeId } = params

  const { scopeName, projectIds } = await resolveScope(scopeType, scopeId)

  if (projectIds.length === 0) {
    return { scopeName, projects: [], roles: [], standards: [] }
  }

  const activeHeadcountProjects = await db
    .select({ projectId: headcountProjects.projectId })
    .from(headcountProjects)
    .where(
      and(
        inArray(headcountProjects.projectId, projectIds),
        eq(headcountProjects.isActive, true),
      ),
    )

  const activeProjectIds = activeHeadcountProjects.map((hp) => hp.projectId)
  if (activeProjectIds.length === 0) {
    return { scopeName, projects: [], roles: [], standards: [] }
  }

  const [projects, roles] = await Promise.all([
    queryProjects(activeProjectIds),
    queryRoles(scopeType),
  ])

  const targetRoleIds = roles.map((r) => r.id)
  const targetProjectTypes = Array.from(
    new Set(projects.map((p) => p.projectType)),
  )

  const durationMonths = params.durationMonths || 6
  let rangeStart = ""
  let rangeEnd = ""

  if (params.fromMonth && params.fromMonth.includes("/")) {
    const [mStr, yStr] = params.fromMonth.split("/")
    const startMonth = parseInt(mStr, 10) - 1
    const startYear = parseInt(yStr, 10) || new Date().getFullYear()

    rangeStart = dayjs(new Date(startYear, startMonth, 1)).format("YYYY-MM-DD")
    rangeEnd = dayjs(
      new Date(startYear, startMonth + durationMonths, 0),
    ).format("YYYY-MM-DD")
  }

  const milestoneIdSet = new Set<number>()
  for (const proj of projects) {
    const activePlan = proj.plans?.[0]
    const phases = activePlan?.phases || []
    for (const phase of phases) {
      if (
        !rangeStart ||
        !rangeEnd ||
        isPhaseInDateRange(phase, rangeStart, rangeEnd)
      ) {
        milestoneIdSet.add(phase.milestoneId)
      }
    }
  }

  const milestoneIds =
    milestoneIdSet.size > 0 ? Array.from(milestoneIdSet) : undefined

  const standards = await queryStandards(
    targetRoleIds,
    targetProjectTypes,
    milestoneIds,
  )

  return {
    scopeName,
    projects,
    roles,
    standards,
  }
}
