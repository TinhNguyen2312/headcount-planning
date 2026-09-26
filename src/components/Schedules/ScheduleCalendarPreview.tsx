import { Button } from "antd"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import type { ScheduleResponse, TaskItemResponse } from "@/types"

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

interface CalendarEntry {
  taskItem: TaskItemResponse
  schedule: ScheduleResponse | null
}

interface ScheduleCalendarPreviewProps {
  entries: CalendarEntry[]
}

const toISODate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const occursOnDate = (
  schedule: ScheduleResponse | null,
  isoDate: string,
): boolean => {
  if (schedule?.status !== "ACTIVE") return false
  return schedule.workDate === isoDate
}

const ScheduleCalendarPreview = ({ entries }: ScheduleCalendarPreviewProps) => {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(cursor.year, cursor.month, 1)
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // 0 = Thứ 2
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()

    const cells: (Date | null)[] = Array(firstWeekday).fill(null)
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(cursor.year, cursor.month, day))
    }
    while (cells.length % 7 !== 0) cells.push(null)

    const result: (Date | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7))
    return result
  }, [cursor])

  const tasksForDate = (date: Date) => {
    const isoDate = toISODate(date)
    return entries.filter(({ schedule }) => occursOnDate(schedule, isoDate))
  }

  const goToMonth = (delta: number) => {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const today = toISODate(new Date())

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium">
          Tháng {cursor.month + 1}/{cursor.year}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            onClick={() => goToMonth(-1)}
            icon={<ChevronLeft className="size-4" />}
          />
          <Button
            type="text"
            size="small"
            onClick={() => goToMonth(1)}
            icon={<ChevronRight className="size-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-base text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, index) => {
          if (!date)
            return <div key={`empty-${index}`} className="aspect-square" />
          const tasks = tasksForDate(date)
          const isoDate = toISODate(date)
          const isToday = isoDate === today
          return (
            <div
              key={isoDate}
              title={tasks.map((t) => t.taskItem.title).join("\n")}
              className={`flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md border p-1 text-base ${
                isToday ? "border-primary" : "border-transparent"
              }`}
            >
              <span className={isToday ? "font-semibold text-primary" : ""}>
                {date.getDate()}
              </span>
              {tasks.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] text-primary">
                  {tasks.length}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScheduleCalendarPreview
