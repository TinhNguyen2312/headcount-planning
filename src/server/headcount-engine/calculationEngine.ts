import dayjs from "dayjs"
import type {
  LoadedCriterion,
  LoadedPhase,
  LoadedProject,
  LoadedPropertyValue,
  LoadedStandard,
} from "./scopeLoader"
import type { MonthPeriod } from "./types"

/**
 * Các loại hình áp dụng cho Property Value & Standard:
 * - "ALL": Áp dụng chung cho mọi loại hình
 * - "LOW_RISE": Áp dụng riêng cho Thấp tầng
 * - "HIGH_RISE": Áp dụng riêng cho Cao tầng
 * - "MIXED": Áp dụng cho Dự án hỗn hợp
 */
export type ProjectTypeScope = "ALL" | "LOW_RISE" | "HIGH_RISE" | "MIXED"

export function isStandardApplicable(
  standardProjectType: string | null | undefined,
  projectType: string,
): boolean {
  if (!standardProjectType || standardProjectType === "ALL") return true
  if (standardProjectType === projectType) return true
  if (projectType === "MIXED") {
    // Dự án hỗn hợp có thể thỏa mãn cả LOW_RISE, HIGH_RISE, MIXED, ALL
    return true
  }
  return false
}

// 1. So khớp toán tử cho Criteria với ngữ cảnh projectType (string)
export function matchesCriterion(
  criterion: LoadedCriterion,
  projectValues: LoadedPropertyValue[] | undefined,
  contextProjectType?: string,
): boolean {
  if (!projectValues || projectValues.length === 0) return false

  // Lọc propertyValues theo ngữ cảnh: ưu tiên đúng contextProjectType, nếu không có lấy ALL
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
      // Fallback lấy giá trị ALL
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

/**
 * 4. Chạy định biên theo dự án trong 1 tháng cụ thể:
 * 4.1: Với mỗi dự án lọc headcount_standard theo roleId, theo projectType (chuỗi: ALL, LOW_RISE, HIGH_RISE, COMMON), from_milestone và to_milestone
 * 4.2: Lấy property values của dự án
 * 4.2.1: Đối chiếu criteria theo đúng projectType (Logic AND). Khớp hết mới giữ lại.
 * 4.2.2: Lấy hệ số tối ưu factor theo duration_months và monthNoInPhase
 * 4.2.3: rawDB = headcount * factor
 * 4.3: Nếu có nhiều standard thỏa mãn => lấy cái tối ưu nhân sự hơn (max rawDB)
 */
export function calculateRoleMonthlyHeadcount(
  project: LoadedProject,
  roleId: number,
  month: MonthPeriod,
  standards: LoadedStandard[],
): number {
  // Bước 2: Xác định Phase & Milestone của dự án trong tháng T
  const phaseRes = resolvePhaseMilestone(project, month)
  if (!phaseRes.hasActivePhase || !phaseRes.phase) return 0

  const { phase, monthNoInPhase } = phaseRes
  const milestoneId = phase.milestoneId

  // 4.1 Lọc standards theo role bước 3, theo projectType (chuỗi), from_milestone và to_milestone
  const projectType =
    (project as any).projectType ||
    (Array.isArray((project as any).projectTypes)
      ? (project as any).projectTypes[0]
      : "HIGH_RISE")

  const candidateStandards = standards.filter((std) => {
    if (std.roleId !== roleId) return false

    // Khớp projectType dạng string
    if (!isStandardApplicable(std.projectType, projectType)) {
      return false
    }

    const matchFrom = std.fromMilestoneId <= milestoneId
    const matchTo = !std.toMilestoneId || milestoneId <= std.toMilestoneId
    return matchFrom && matchTo
  })

  if (candidateStandards.length === 0) return 0

  // 4.2 Lấy các properties - values của dự án (gom nhóm theo propertyId)
  const propValuesMap = new Map<number, LoadedPropertyValue[]>()
  for (const pv of project.propertyValues) {
    const list = propValuesMap.get(pv.propertyId) || []
    list.push(pv)
    propValuesMap.set(pv.propertyId, list)
  }

  // 4.2 & 4.3: Duyệt từng standard, kiểm tra criteria theo context projectType và tính rawDB
  let bestHeadcount = 0

  for (const std of candidateStandards) {
    const criteriaList = std.headcountCriteria || []
    const stdProjectType = std.projectType || "ALL"

    // 4.2.1: Đối chiếu criteria có match theo context projectType (ALL / LOW_RISE / HIGH_RISE / MIXED)
    const allPassed =
      criteriaList.length === 0 ||
      criteriaList.every((crit) => {
        const propValues = propValuesMap.get(crit.propertyId)
        return matchesCriterion(crit, propValues, stdProjectType)
      })

    if (!allPassed) continue

    // 4.2.2: Lấy hệ số tối ưu thông qua headcount_monthly_factors
    const factor = calculateMonthlyFactor(
      std,
      phase.durationMonths,
      monthNoInPhase,
    )

    // 4.2.3: Từ hệ số tối ưu nhân với headcount => định biên thô của role
    const rawDB = Number(std.headcount) * factor

    // 4.3: Tổng hợp nếu có nhiều standard => lấy cái tối ưu nhân sự hơn (max)
    if (rawDB > bestHeadcount) {
      bestHeadcount = rawDB
    }
  }

  return Math.round(bestHeadcount * 100) / 100
}
