import type {
  DepartmentResponse,
  ProjectResponse,
  RegionResponse,
  RoleResponse,
} from "@/types"
import type { LoadedProject, LoadedRole } from "./scopeLoader"
import type {
  HeadcountCalculationParams,
  HeadcountReportResult,
  MatrixRowItem,
  MonthPeriod,
  MonthlyHeadcountCell,
} from "./types"

export function aggregateHeadcountMatrix(
  params: HeadcountCalculationParams,
  scopeName: string,
  months: MonthPeriod[],
  projects: LoadedProject[],
  roles: LoadedRole[],
  projectRoleMonthlyMap: Map<string, MonthlyHeadcountCell[]>,
): HeadcountReportResult {
  const monthsLabel = months.map((m) => m.monthLabel)
  const fromMonth = months[0]?.monthLabel || ""
  const toMonth = months[months.length - 1]?.monthLabel || ""

  const outputRows: MatrixRowItem[] = []

  for (const role of roles) {
    const projectRowsForRole: MatrixRowItem[] = []

    const departmentResponse: DepartmentResponse | null = role.department
      ? {
          id: role.department.id,
          code: role.department.code,
          name: role.department.name,
          type: role.department.type,
          level: role.department.level,
          parentId: role.department.parentId,
          status: role.department.status,
          startDate: role.department.startDate,
          endDate: role.department.endDate,
          path: role.department.path,
          description: role.department.description,
          metadata: role.department.metadata,
          createdAt: role.department.createdAt,
          updatedAt: role.department.updatedAt,
        }
      : null

    const roleResponse: RoleResponse & {
      department?: DepartmentResponse | null
    } = {
      id: role.id,
      code: role.code,
      shortCode: role.shortCode,
      name: role.name,
      level: role.level,
      parentRoleId: role.parentRoleId,
      departmentId: role.departmentId,
      departmentName: role.department?.name || null,
      departmentCode: role.department?.code || null,
      planningMethod: (role.planningMethod as any) || "BY_PROJECT",
      description: role.description,
      createdAt: role.createdAt,
      department: departmentResponse,
    }

    for (const project of projects) {
      const key = `${project.id}_${role.id}`
      const monthlyCells = projectRoleMonthlyMap.get(key) || []

      const regionResponse: RegionResponse | null = project.region
        ? {
            id: project.region.id,
            sectorId: project.region.sectorId,
            code: project.region.code,
            name: project.region.name,
            description: project.region.description,
            createdAt: project.region.createdAt,
          }
        : null

      const projectResponse: Omit<ProjectResponse, "region"> & {
        region?: RegionResponse | null
      } = {
        id: project.id,
        name: project.name,
        address: project.address,
        generalInfo: project.generalInfo,
        status: project.status as any,
        startDate: project.startDate,
        endDate: project.endDate,
        thumbnail: project.thumbnail || "",
        projectType: (project.projectType as any) || "HIGH_RISE",
        projectTypes: [(project.projectType as any) || "HIGH_RISE"],
        createdAt: project.createdAt,
        region: regionResponse,
      }

      projectRowsForRole.push({
        id: `row_${project.id}_${role.id}`,
        isSubTotal: false,
        project: projectResponse,
        region: regionResponse,
        role: roleResponse,
        months: monthlyCells,
      })
    }

    outputRows.push(...projectRowsForRole)

    // Tạo dòng SubTotal cho role này (tổng hợp từ các dự án)
    const subTotalMonths: MonthlyHeadcountCell[] = months.map((m, mIdx) => {
      let totalStd = 0
      let totalAct = 0

      for (const row of projectRowsForRole) {
        totalStd += row.months[mIdx]?.standardHeadcount || 0
        totalAct += row.months[mIdx]?.actualHeadcount || 0
      }

      totalStd = Math.round(totalStd * 100) / 100
      totalAct = Math.round(totalAct * 100) / 100

      const netShortage = Math.max(
        0,
        Math.round((totalStd - totalAct) * 100) / 100,
      )
      const netSurplus = Math.max(
        0,
        Math.round((totalAct - totalStd) * 100) / 100,
      )

      return {
        monthIndex: m.monthIndex,
        monthLabel: m.monthLabel,
        standardHeadcount: totalStd,
        actualHeadcount: totalAct,
        surplus: netSurplus,
        shortage: netShortage,
      }
    })

    const sampleRow = projectRowsForRole[0]
    outputRows.push({
      id: `subtotal_${role.id}`,
      isSubTotal: true,
      project: null,
      region: sampleRow?.region || null,
      role: roleResponse,
      months: subTotalMonths,
    })
  }

  // Grand Total summary
  let totalStandard = 0
  let totalActual = 0
  let totalSurplus = 0
  let totalShortage = 0

  for (const row of outputRows) {
    if (row.isSubTotal) continue
    for (const m of row.months) {
      totalStandard += m.standardHeadcount
      totalActual += m.actualHeadcount
      totalSurplus += m.surplus
      totalShortage += m.shortage
    }
  }

  totalStandard = Math.round(totalStandard * 100) / 100
  totalActual = Math.round(totalActual * 100) / 100
  totalSurplus = Math.round(totalSurplus * 100) / 100
  totalShortage = Math.round(totalShortage * 100) / 100

  const fulfillmentRate =
    totalStandard > 0
      ? Math.min(100, Math.round((totalActual / totalStandard) * 1000) / 10)
      : 100

  return {
    scopeType: params.scopeType,
    scopeId: params.scopeId,
    scopeName,
    fromMonth,
    toMonth,
    monthsLabel,
    rows: outputRows,
    summary: {
      totalStandard,
      totalActual,
      totalSurplus,
      totalShortage,
      fulfillmentRate,
    },
  }
}
