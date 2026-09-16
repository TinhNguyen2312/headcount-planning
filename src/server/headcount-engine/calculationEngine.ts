import dayjs from "dayjs"
import type {
  LoadedCriterion,
  LoadedPhase,
  LoadedProject,
  LoadedPropertyValue,
  LoadedStandard,
} from "./scopeLoader"
import type { MonthPeriod } from "./types"

// 1. So khớp toán tử cho Criteria
export function matchesCriterion(
  criterion: LoadedCriterion,
  projectValues: LoadedPropertyValue[] | undefined,
): boolean {
  if (!projectValues || projectValues.length === 0) return false

  const isNumberType =
    criterion.property?.dataType === "NUMBER" ||
    projectValues.some((pv) => pv.valueNumber !== null)

  const min = criterion.minValue !== null ? Number(criterion.minValue) : null
  const max = criterion.maxValue !== null ? Number(criterion.maxValue) : null
  const op = criterion.conditionOperator.trim().toUpperCase()

  for (const pv of projectValues) {
    if (isNumberType) {
      const actual = pv.valueNumber !== null ? Number(pv.valueNumber) : null
      if (actual === null) continue

      let matched = false
      if (op === "=") matched = min !== null && Math.abs(actual - min) < 0.0001
      else if (op === "<") matched = max !== null && actual < max
      else if (op === "<=") matched = max !== null && actual <= max
      else if (op === ">") matched = min !== null && actual > min
      else if (op === ">=") matched = min !== null && actual >= min
      else
        matched =
          (min === null || actual >= min) && (max === null || actual <= max) // BETWEEN

      if (matched) return true
    } else {
      if (pv.valueText === null) continue
      if (op === "=") {
        const target = (
          criterion.valueText ?? (min !== null ? String(min) : "")
        )
          .trim()
          .toLowerCase()
        if (pv.valueText.trim().toLowerCase() === target) return true
      }
    }
  }

  return false
}

// 2. Tìm Phase & Milestone của dự án trong tháng T
export function resolvePhaseMilestone(
  project: LoadedProject,
  month: MonthPeriod,
): { hasActivePhase: boolean; phase?: LoadedPhase; monthNoInPhase: number } {
  const activePlan = project.plans?.[0]
  const phases = activePlan?.phases || []
  if (phases.length === 0) return { hasActivePhase: false, monthNoInPhase: 0 }

  const monthStart = dayjs(month.startDateStr, "YYYY-MM-DD")
  const monthEnd = dayjs(month.endDateStr, "YYYY-MM-DD")

  const matchingPhase = phases.find((phase) => {
    const phaseStart = dayjs(phase.startDate, "YYYY-MM-DD")
    const phaseEnd = dayjs(phase.endDate, "YYYY-MM-DD")
    return (
      (phaseStart.isBefore(monthEnd) || phaseStart.isSame(monthEnd)) &&
      (phaseEnd.isAfter(monthStart) || phaseEnd.isSame(monthStart))
    )
  })

  if (!matchingPhase) return { hasActivePhase: false, monthNoInPhase: 0 }

  const phaseStart = dayjs(matchingPhase.startDate, "YYYY-MM-DD")
  const monthDiff = monthStart.diff(phaseStart, "month")
  return {
    hasActivePhase: true,
    phase: matchingPhase,
    monthNoInPhase: Math.max(1, monthDiff + 1),
  }
}

// 3. Tra cứu hệ số phân bổ tháng (factor)
export function calculateMonthlyFactor(
  standard: LoadedStandard,
  durationMonths: number,
  monthNoInPhase: number,
): number {
  const factorList = standard.headcountMonthlyFactors || []
  const matchedFactor = factorList.find(
    (f) => f.durationMonths === durationMonths && f.monthNo === monthNoInPhase,
  )
  if (matchedFactor) return Number(matchedFactor.factor)

  const factorsArray = standard.monthlyFactors
  if (
    Array.isArray(factorsArray) &&
    factorsArray.length > 0 &&
    monthNoInPhase <= factorsArray.length
  ) {
    const val = Number(factorsArray[monthNoInPhase - 1])
    if (!isNaN(val)) return val
  }

  return 1.0 // fallback chuẩn BRD
}

// 4. Đánh giá standard phù hợp với quy mô dự án (Logic AND criteria & OR lấy max)
export function evaluateStandard(
  project: LoadedProject,
  roleId: number,
  milestoneId: number,
  allStandards: LoadedStandard[],
): {
  isMatch: boolean
  standard?: LoadedStandard | null
  baseHeadcount: number
} {
  const projectTypes = (
    Array.isArray(project.projectTypes) ? project.projectTypes : ["HIGH_RISE"]
  ) as string[]

  const candidateStandards = allStandards.filter((std) => {
    if (std.roleId !== roleId) return false
    if (std.projectType !== "ALL" && !projectTypes.includes(std.projectType)) {
      return false
    }
    const matchFrom = std.fromMilestoneId <= milestoneId
    const matchTo = !std.toMilestoneId || milestoneId <= std.toMilestoneId
    return matchFrom && matchTo
  })

  if (candidateStandards.length === 0)
    return { isMatch: false, baseHeadcount: 0 }

  // Gom nhóm property values theo propertyId
  const propValuesMap = new Map<number, LoadedPropertyValue[]>()
  for (const pv of project.propertyValues) {
    const list = propValuesMap.get(pv.propertyId) || []
    list.push(pv)
    propValuesMap.set(pv.propertyId, list)
  }

  const matchedStandards: LoadedStandard[] = []
  for (const std of candidateStandards) {
    const criteriaList = std.headcountCriteria || []
    if (criteriaList.length === 0) {
      matchedStandards.push(std)
      continue
    }

    const allPassed = criteriaList.every((crit) => {
      const propValues = propValuesMap.get(crit.propertyId)
      return matchesCriterion(crit, propValues)
    })

    if (allPassed) matchedStandards.push(std)
  }

  if (matchedStandards.length === 0) return { isMatch: false, baseHeadcount: 0 }

  // Logic OR: chọn standard định biên lớn nhất
  matchedStandards.sort((a, b) => Number(b.headcount) - Number(a.headcount))
  const bestStandard = matchedStandards[0]

  return {
    isMatch: true,
    standard: bestStandard,
    baseHeadcount: Number(bestStandard.headcount),
  }
}

// 5. Tính định biên 1 role của dự án trong 1 tháng
export function calculateRoleMonthlyHeadcount(
  project: LoadedProject,
  roleId: number,
  month: MonthPeriod,
  standards: LoadedStandard[],
): number {
  const phaseRes = resolvePhaseMilestone(project, month)
  if (!phaseRes.hasActivePhase || !phaseRes.phase) return 0

  const { phase, monthNoInPhase } = phaseRes
  const evalRes = evaluateStandard(
    project,
    roleId,
    phase.milestoneId,
    standards,
  )
  if (!evalRes.isMatch || !evalRes.standard) return 0

  const factor = calculateMonthlyFactor(
    evalRes.standard,
    phase.durationMonths,
    monthNoInPhase,
  )

  const standardHeadcount = evalRes.baseHeadcount * factor
  return Math.round(standardHeadcount * 100) / 100
}
