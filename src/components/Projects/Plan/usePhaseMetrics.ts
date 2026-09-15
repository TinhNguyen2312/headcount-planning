import dayjs from "dayjs"
import { useMemo } from "react"

import type { PhaseResponse } from "@/types"

import type { ExecutionType, PhaseWithMetrics } from "./types"

export function usePhaseMetrics(
  workingPhases: PhaseResponse[],
  projectStartDate?: string | null,
  projectEndDate?: string | null,
) {
  const phasesWithMetrics: PhaseWithMetrics[] = useMemo(() => {
    const sorted = [...workingPhases].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    )
    const baseDate = projectStartDate ? dayjs(projectStartDate) : null
    const projectEnd = projectEndDate ? dayjs(projectEndDate) : null

    return sorted.map((phase, idx) => {
      const endMonth = phase.startMonth + phase.durationMonths - 1
      let startDateCal: string | null = null
      let endDateCal: string | null = null
      let expectedDate: string | null = null
      let isPastProjectEnd = false

      if (baseDate && baseDate.isValid()) {
        const startCalDate = baseDate.add(phase.startMonth - 1, "month")
        const endCalDate = baseDate.add(endMonth - 1, "month")
        startDateCal = startCalDate.format("MM/YYYY")
        endDateCal = endCalDate.format("MM/YYYY")

        const calcDate = endCalDate.endOf("month")
        expectedDate = calcDate.format("DD/MM/YYYY")
        if (
          projectEnd &&
          projectEnd.isValid() &&
          calcDate.isAfter(projectEnd, "day")
        ) {
          isPastProjectEnd = true
        }
      }

      // Detect overlapping or parallel with previous phase
      let executionType: ExecutionType = "SEQUENTIAL"
      if (idx > 0) {
        const prevPhase = sorted[idx - 1]
        const prevEnd = prevPhase.startMonth + prevPhase.durationMonths - 1
        if (phase.startMonth === prevPhase.startMonth) {
          executionType = "PARALLEL"
        } else if (phase.startMonth <= prevEnd) {
          executionType = "OVERLAPPING"
        }
      }

      return {
        ...phase,
        endMonth,
        startDateCal,
        endDateCal,
        expectedDate,
        isPastProjectEnd,
        executionType,
      }
    })
  }, [workingPhases, projectStartDate, projectEndDate])

  const deadlineWarnings = useMemo(() => {
    return phasesWithMetrics.filter((p) => p.isPastProjectEnd)
  }, [phasesWithMetrics])

  return {
    phasesWithMetrics,
    deadlineWarnings,
  }
}
