import dayjs from "dayjs"
import { calculateRoleMonthlyHeadcount } from "./calculationEngine"
import { aggregateHeadcountMatrix } from "./matrixAggregator"
import { loadProjectScopeData } from "./scopeLoader"
import type {
  HeadcountCalculationParams,
  HeadcountReportResult,
  MonthlyHeadcountCell,
  MonthPeriod,
} from "./types"

// Sinh danh sách các tháng
export function generateMonthPeriods(
  fromMonthStr: string,
  durationMonths = 6,
): MonthPeriod[] {
  let startYear = new Date().getFullYear()
  let startMonthNum = 1

  if (fromMonthStr && fromMonthStr.includes("/")) {
    const parts = fromMonthStr.split("/")
    if (parts.length === 2) {
      startMonthNum = parseInt(parts[0], 10) || 1
      startYear = parseInt(parts[1], 10) || startYear
    }
  }

  const result: MonthPeriod[] = []
  for (let i = 0; i < durationMonths; i++) {
    const current = dayjs(new Date(startYear, startMonthNum - 1 + i, 1))
    const monthNum = current.month() + 1
    const yearNum = current.year()
    const monthPadded = monthNum < 10 ? `0${monthNum}` : `${monthNum}`

    result.push({
      monthIndex: i + 1,
      monthLabel: `T${monthPadded}/${yearNum}`,
      year: yearNum,
      month: monthNum,
      startDateStr: current.startOf("month").format("YYYY-MM-DD"),
      endDateStr: current.endOf("month").format("YYYY-MM-DD"),
    })
  }

  return result
}

// Hàm chính sinh Báo cáo định biên nhân sự
export async function generateHeadcountReport(
  params: HeadcountCalculationParams,
): Promise<HeadcountReportResult> {
  const durationMonths = params.durationMonths || 6
  const months: MonthPeriod[] = generateMonthPeriods(
    params.fromMonth,
    durationMonths,
  )

  const { scopeName, projects, roles, standards } =
    await loadProjectScopeData(params)

  if (projects.length === 0) {
    return {
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      scopeName,
      fromMonth: months[0]?.monthLabel || params.fromMonth,
      toMonth: months[months.length - 1]?.monthLabel || "",
      monthsLabel: months.map((m) => m.monthLabel),
      rows: [],
      summary: {
        totalStandard: 0,
        totalActual: 0,
        totalSurplus: 0,
        totalShortage: 0,
        fulfillmentRate: 0,
      },
    }
  }

  const projectRoleMonthlyMap = new Map<string, MonthlyHeadcountCell[]>()

  for (const project of projects) {
    for (const role of roles) {
      const key = `${project.id}_${role.id}`
      const monthlyCells: MonthlyHeadcountCell[] = []

      for (const month of months) {
        const standardHeadcount = calculateRoleMonthlyHeadcount(
          project,
          role.id,
          month,
          standards,
        )

        const actualHeadcount = 0
        const surplus = 0
        const shortage = standardHeadcount

        monthlyCells.push({
          monthIndex: month.monthIndex,
          monthLabel: month.monthLabel,
          standardHeadcount,
          actualHeadcount,
          surplus,
          shortage,
        })
      }

      projectRoleMonthlyMap.set(key, monthlyCells)
    }
  }

  return aggregateHeadcountMatrix(
    params,
    scopeName,
    months,
    projects,
    roles,
    projectRoleMonthlyMap,
  )
}
