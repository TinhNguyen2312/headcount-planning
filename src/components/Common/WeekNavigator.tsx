import { Button, Tooltip } from "antd"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo } from "react"
import {
  mondayOf,
  toDisplayDate,
  toISODate,
} from "@/components/Schedules/scheduleUtils"

export interface WeekNavigatorProps {
  weekStart: Date
  setWeekStart?: (updater: Date | ((prev: Date) => Date)) => void
  setSelectedDate?: (date: string) => void
  onWeekChange?: (newWeekStart: Date) => void
  onShiftWeek?: (deltaWeeks: number) => void
  onGoThisWeek?: () => void
  isCurrentWeek?: boolean
  currentWeekText?: string
  prevTitle?: string
  nextTitle?: string
  className?: string
  size?: "small" | "middle" | "large"
  showDateRange?: boolean
  showThisWeekButton?: boolean
  disabled?: boolean
}

export const WeekNavigator = ({
  weekStart,
  setWeekStart,
  setSelectedDate,
  onWeekChange,
  onShiftWeek,
  onGoThisWeek,
  isCurrentWeek: explicitIsCurrentWeek,
  currentWeekText = "Về tuần này",
  prevTitle = "Tuần trước",
  nextTitle = "Tuần sau",
  className = "",
  size = "middle",
  showDateRange = true,
  showThisWeekButton = true,
  disabled = false,
}: WeekNavigatorProps) => {
  const isCurrentWeek = useMemo(() => {
    if (explicitIsCurrentWeek !== undefined) return explicitIsCurrentWeek
    return toISODate(weekStart) === toISODate(mondayOf(new Date()))
  }, [weekStart, explicitIsCurrentWeek])

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return end
  }, [weekStart])
  const handlePrevWeek = () => {
    if (onShiftWeek) {
      onShiftWeek(-1)
      return
    }
    setWeekStart?.((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() - 7)
      setSelectedDate?.(toISODate(next))
      onWeekChange?.(next)
      return next
    })
  }

  const handleNextWeek = () => {
    if (onShiftWeek) {
      onShiftWeek(1)
      return
    }
    setWeekStart?.((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + 7)
      setSelectedDate?.(toISODate(next))
      onWeekChange?.(next)
      return next
    })
  }

  const handleGoCurrentWeek = () => {
    if (onGoThisWeek) {
      onGoThisWeek()
      return
    }
    const today = new Date()
    const thisMonday = mondayOf(today)
    setWeekStart?.(thisMonday)
    setSelectedDate?.(toISODate(today))
    onWeekChange?.(thisMonday)
  }

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <Tooltip title={prevTitle}>
        <Button
          icon={<ChevronLeft size={16} />}
          onClick={handlePrevWeek}
          disabled={disabled}
          size={size}
          title={prevTitle}
          aria-label={prevTitle}
        />
      </Tooltip>

      <div className="flex items-center gap-1.5 px-3 py-2.5! bg-muted/60 rounded-md border border-border text-sm select-none">
        {showDateRange && (
          <span className="text-xs text-muted-foreground font-medium">
            ({toDisplayDate(weekStart)} – {toDisplayDate(weekEnd)})
          </span>
        )}
      </div>

      <Tooltip title={nextTitle}>
        <Button
          icon={<ChevronRight size={16} />}
          onClick={handleNextWeek}
          disabled={disabled}
          size={size}
          title={nextTitle}
          aria-label={nextTitle}
        />
      </Tooltip>

      {showThisWeekButton && (
        <Button
          type={isCurrentWeek ? "default" : "primary"}
          disabled={disabled || isCurrentWeek}
          onClick={handleGoCurrentWeek}
          size={size}
          className={!isCurrentWeek ? "font-medium" : "text-muted-foreground"}
        >
          {isCurrentWeek ? "Tuần này" : currentWeekText}
        </Button>
      )}
    </div>
  )
}

export default WeekNavigator
