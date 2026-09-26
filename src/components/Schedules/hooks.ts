import { useNavigate, useSearch } from "@/lib/routerAdapter"
import { useCallback, useEffect, useMemo, useState } from "react"
import { userScheduleQueries } from "@/hooks/server/userSchedules"
import useAuth from "@/hooks/useAuth"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import type { ScheduleCoverageRow } from "@/types"
import type { WeekScheduleSearch } from "./scheduleSchemas"
import {
  getISOWeekNumber,
  getPersonalScheduleSignature,
  mondayOf,
  toDisplayDate,
  toISODate,
} from "./scheduleUtils"

export const useWeekCursor = () => {
  const search = useSearch({ strict: false }) as WeekScheduleSearch
  const navigate = useNavigate()

  const weekStart = useMemo(() => {
    const raw = search?.weekStart
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const parsed = new Date(`${raw}T00:00:00`)
      if (!isNaN(parsed.getTime())) {
        return mondayOf(parsed)
      }
    }
    return mondayOf(new Date())
  }, [search?.weekStart])

  const nextWeekStart = useMemo(() => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    return next
  }, [weekStart])

  const updateWeekStartSearch = useCallback(
    (mondayDate: Date) => {
      ;(navigate as any)({
        search: (prev: Record<string, unknown>) => ({
          ...(typeof prev === "object" && prev !== null ? prev : {}),
          weekStart: toISODate(mondayDate),
        }),
      })
    },
    [navigate],
  )

  const shiftWeek = useCallback(
    (deltaWeeks: number) => {
      const next = new Date(weekStart)
      next.setDate(next.getDate() + deltaWeeks * 7)
      updateWeekStartSearch(mondayOf(next))
    },
    [weekStart, updateWeekStartSearch],
  )

  const goThisWeek = useCallback(() => {
    updateWeekStartSearch(mondayOf(new Date()))
  }, [updateWeekStartSearch])

  const setWeekStart = useCallback(
    (updater: Date | ((prev: Date) => Date)) => {
      const nextDate =
        typeof updater === "function" ? updater(weekStart) : updater
      updateWeekStartSearch(mondayOf(nextDate))
    },
    [weekStart, updateWeekStartSearch],
  )

  return { weekStart, setWeekStart, nextWeekStart, shiftWeek, goThisWeek }
}

export const usePersonalSchedule = (currentProjectId?: number) => {
  const { user } = useAuth()
  const projectId = currentProjectId ?? user?.currentProject?.id
  const roleId = user?.currentProject?.roleId
  const userId = user?.id

  const { weekStart, shiftWeek, goThisWeek } = useWeekCursor()
  const weekStartISO = toISODate(weekStart)

  const { data: coverage, isLoading } =
    userScheduleQueries.usePersonalCoverageMatrix(
      projectId ?? 0,
      userId ?? 0,
      weekStartISO,
    )

  const matrixRows: ScheduleCoverageRow[] = useMemo(() => {
    if (!coverage?.rows) return []
    return coverage.rows
      .filter((row) => roleId == null || row.roleId === roleId)
      .map((row) => ({
        ...row,
        days: row.days.map((day) => ({
          ...day,
          scheduled: Boolean(
            day.scheduled &&
              userId != null &&
              day.assignedUserIds.includes(userId),
          ),
        })),
      }))
  }, [coverage, roleId, userId])

  return {
    projectId,
    weekStart,
    weekStartISO,
    weekNumber: getISOWeekNumber(weekStart),
    weekLabel: toDisplayDate(weekStart),
    isCurrentWeek: weekStartISO === toISODate(mondayOf(new Date())),
    matrixRows,
    isLoading,
    shiftWeek,
    goThisWeek,
  }
}

export function usePersonalScheduleRows({
  rows,
  weekStartISO,
  save,
}: {
  rows: ScheduleCoverageRow[] | undefined
  weekStartISO: string
  save: (rows: ScheduleCoverageRow[], weekStartISO: string) => Promise<unknown>
}) {
  const [prevRows, setPrevRows] = useState<ScheduleCoverageRow[] | undefined>(
    undefined,
  )
  const [matrixRows, setMatrixRows] = useState<ScheduleCoverageRow[]>([])

  const {
    isDirty,
    showWarning,
    confirmLeave,
    cancelLeave,
    markClean,
    setSnapshot,
  } = useUnsavedChanges({
    getCurrentValue: () => getPersonalScheduleSignature(matrixRows),
  })

  if (rows && rows !== prevRows) {
    setPrevRows(rows)
    setMatrixRows(rows)
  }

  useEffect(() => {
    if (rows) {
      setSnapshot(getPersonalScheduleSignature(rows))
    }
  }, [rows, setSnapshot])

  const handleMatrixChange = useCallback(
    (newRows: ScheduleCoverageRow[]) => setMatrixRows(newRows),
    [],
  )

  const handleSave = useCallback(async () => {
    await save(matrixRows, weekStartISO)
    markClean()
  }, [save, matrixRows, weekStartISO, markClean])

  return {
    matrixRows,
    handleMatrixChange,
    isDirty,
    showWarning,
    confirmLeave,
    cancelLeave,
    markClean,
    handleSave,
  }
}
