import dayjs from "dayjs"
import type {
  LoadedCriterion,
  LoadedPhase,
  LoadedProject,
  LoadedPropertyValue,
  LoadedStandard,
} from "./scopeLoader"
import type { MonthPeriod } from "./types"

export type ProjectTypeScope = "ALL" | "LOW_RISE" | "HIGH_RISE" | "MIXED"

export function isStandardApplicable(
  standardProjectType: string | null | undefined,
  projectType: string,
): boolean {
  if (!standardProjectType || standardProjectType === "ALL") return true
  if (standardProjectType === projectType) return true
  if (projectType === "MIXED") {
    return true
  }
  return false
}

export function matchesCriterion(
  criterion: LoadedCriterion,
  projectValues: LoadedPropertyValue[] | undefined,
  contextProjectType?: string,
): boolean {
  if (!projectValues || projectValues.length === 0) return false

  let relevantValues = projectValues
  if (
    contextProjectType &&
    contextProjectType !== "ALL" &&
    contextProjectType !== "MIXED"
  ) {
    const specificValues = projectValues.filter(
      (pv) => pv.projectType === contextProjectType,
    )
    if (specificValues.length > 0) {
      relevantValues = specificValues
    } else {
      relevantValues = projectValues.filter(
        (pv) =>
          !pv.projectType ||
          pv.projectType === "ALL" ||
          pv.projectType === "COMMON",
      )
    }
  } else {
    const allValues = projectValues.filter(
      (pv) =>
        !pv.projectType ||
        pv.projectType === "ALL" ||
        pv.projectType === "COMMON",
    )
    if (allValues.length > 0) {
      relevantValues = allValues
    }
  }

  if (relevantValues.length === 0) return false

  const isNumberType =
    criterion.property?.dataType === "NUMBER" ||
    relevantValues.some((pv) => pv.valueNumber !== null)

  const min = criterion.minValue !== null ? Number(criterion.minValue) : null
  const max = criterion.maxValue !== null ? Number(criterion.maxValue) : null
  const op = criterion.conditionOperator.trim().toUpperCase()

  for (const pv of relevantValues) {
    if (isNumberType) {
      const actual = pv.valueNumber !== null ? Number(pv.valueNumber) : null
      if (actual === null) continue

      // eslint-disable-next-line no-useless-assignment
      let matched = false
      if (op === "=") matched = min !== null && Math.abs(actual - min) < 0.0001
      else if (op === "<") matched = max !== null && actual < max
      else if (op === "<=") matched = max !== null && actual <= max
      else if (op === ">") matched = min !== null && actual > min
      else if (op === ">=") matched = min !== null && actual >= min
      else
        matched =
          (min === null || actual >= min) && (max === null || actual <= max)

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

export function isPhaseInDateRange(
  phase: { startDate: string; endDate: string },
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return phase.startDate <= rangeEnd && phase.endDate >= rangeStart
}

export function resolvePhaseMilestone(
  project: LoadedProject,
  month: MonthPeriod,
): { hasActivePhase: boolean; phase?: LoadedPhase; monthNoInPhase: number } {
  const activePlan = project.plans?.[0]
  const phases = activePlan?.phases || []
  if (phases.length === 0) return { hasActivePhase: false, monthNoInPhase: 0 }

  const matchingPhase = phases.find((phase) =>
    isPhaseInDateRange(phase, month.startDateStr, month.endDateStr),
  )

  if (!matchingPhase) return { hasActivePhase: false, monthNoInPhase: 0 }

  const monthStart = dayjs(month.startDateStr, "YYYY-MM-DD")
  const phaseStart = dayjs(matchingPhase.startDate, "YYYY-MM-DD")
  const monthDiff = monthStart.diff(phaseStart, "month")
  return {
    hasActivePhase: true,
    phase: matchingPhase,
    monthNoInPhase: Math.max(1, monthDiff + 1),
  }
}

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

  return 1.0
}

export function calculateRoleMonthlyHeadcount(
  project: LoadedProject,
  roleId: number,
  month: MonthPeriod,
  standards: LoadedStandard[],
): number {
  if (standards.length === 0) return 0

  const phaseRes = resolvePhaseMilestone(project, month)
  if (!phaseRes.hasActivePhase || !phaseRes.phase) return 0

  const { phase, monthNoInPhase } = phaseRes
  const milestoneId = phase.milestoneId
  const projectType = project.projectType

  const candidateStandards = standards.filter((std) => {
    if (std.roleId !== roleId) return false
    if (!isStandardApplicable(std.projectType, projectType)) {
      return false
    }

    const matchFrom = std.fromMilestoneId <= milestoneId
    const matchTo = !std.toMilestoneId || milestoneId <= std.toMilestoneId
    return matchFrom && matchTo
  })

  if (candidateStandards.length === 0) return 0

  const propValuesMap = new Map<number, LoadedPropertyValue[]>()
  for (const pv of project.propertyValues) {
    const list = propValuesMap.get(pv.propertyId) || []
    list.push(pv)
    propValuesMap.set(pv.propertyId, list)
  }

  let bestHeadcount = 0

  for (const std of candidateStandards) {
    const criteriaList = std.headcountCriteria || []
    const stdProjectType = std.projectType || "ALL"

    const allPassed =
      criteriaList.length === 0 ||
      criteriaList.every((crit) => {
        const propValues = propValuesMap.get(crit.propertyId)
        return matchesCriterion(crit, propValues, stdProjectType)
      })

    if (!allPassed) continue

    const factor = calculateMonthlyFactor(
      std,
      phase.durationMonths,
      monthNoInPhase,
    )

    const rawDB = Number(std.headcount) * factor

    if (rawDB > bestHeadcount) {
      bestHeadcount = rawDB
    }
  }

  return Math.round(bestHeadcount * 100) / 100
}
