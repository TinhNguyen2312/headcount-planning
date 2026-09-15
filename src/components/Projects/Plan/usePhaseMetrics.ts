import dayjs from "dayjs"
import { useMemo } from "react"

import type { PhaseResponse } from "@/types"

import type { ExecutionType, PhaseWithMetrics } from "./types"

export function usePhaseMetrics(workingPhases: PhaseResponse[]) {
  const phasesWithMetrics: PhaseWithMetrics[] = useMemo(() => {
    const sorted = [...workingPhases].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    )

    return sorted.map((phase, idx) => {
      const start = dayjs(phase.startDate)
      const end = dayjs(phase.endDate)

      const durationDays =
        start.isValid() && end.isValid()
          ? Math.max(1, end.diff(start, "day") + 1)
          : 0

      // Duration months rounded to nearest full/half month or whole month
      const durationMonths =
        start.isValid() && end.isValid()
          ? Math.max(1, Math.round(durationDays / 30.4375))
          : 0

      // Detect overlapping or parallel with previous phase
      let executionType: ExecutionType = "SEQUENTIAL"
      if (idx > 0) {
        const prevPhase = sorted[idx - 1]
        const prevStart = dayjs(prevPhase.startDate)
        const prevEnd = dayjs(prevPhase.endDate)

        if (start.isValid() && prevStart.isValid()) {
          if (start.isSame(prevStart, "day")) {
            executionType = "PARALLEL"
          } else if (prevEnd.isValid() && start.isBefore(prevEnd, "day")) {
            executionType = "OVERLAPPING"
          }
        }
      }

      return {
        ...phase,
        durationDays,
        durationMonths,
        executionType,
      }
    })
  }, [workingPhases])

  return {
    phasesWithMetrics,
  }
}

