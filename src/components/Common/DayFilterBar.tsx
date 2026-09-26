import { Segmented } from "antd"
import { useMemo } from "react"

import {
  getWeekDays,
  type WeekDayInfo,
} from "@/components/Schedules/scheduleUtils"

export interface DayFilterBarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  weekStart?: Date
  weekDays?: WeekDayInfo[]
  className?: string
}

/**
 * 7-day horizontal pill selector for daily task views (My Tasks, Subordinates, etc.)
 * Accepts either weekStart (calculates 7 days automatically) or custom weekDays.
 */
export const DayFilterBar = ({
  selectedDate,
  onSelectDate,
  weekStart,
  weekDays: explicitWeekDays,
  className,
}: DayFilterBarProps) => {
  const weekDays = useMemo(() => {
    if (explicitWeekDays) return explicitWeekDays
    if (weekStart) return getWeekDays(weekStart)
    return []
  }, [explicitWeekDays, weekStart])

  return (
    <Segmented
      block
      value={selectedDate}
      onChange={(val) => onSelectDate(val as string)}
      className={className}
      classNames={{ label: "flex flex-col items-center py-1" }}
      options={weekDays.map((day) => ({
        value: day.date,
        label: (
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-base font-semibold">
              {day.shortLabel}
              {day.isToday && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {day.dateLabel}
            </span>
          </div>
        ),
      }))}
    />
  )
}

export default DayFilterBar
