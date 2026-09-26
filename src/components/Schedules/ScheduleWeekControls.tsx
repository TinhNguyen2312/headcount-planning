import { Button, Popconfirm, Tooltip } from "antd"
import { Copy, Save, Sparkles } from "lucide-react"
import React from "react"
import { WeekNavigator } from "@/components/Common/WeekNavigator"
import { getISOWeekNumber, toDisplayDate } from "./scheduleUtils"

interface ScheduleWeekControlsProps {
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
  weekStart: Date
  nextWeekStart: Date
  isCopying: boolean
  onCopyNextWeek: () => void
  onShiftWeek: (deltaWeeks: number) => void
  onGoThisWeek: () => void
  hasScheduledTasks?: boolean
  isGenerating?: boolean
  onGenerateWeek?: () => void
}

const ScheduleWeekControls = React.memo(
  ({
    isDirty,
    isSaving,
    onSave,
    weekStart,
    nextWeekStart,
    isCopying,
    onCopyNextWeek,
    onShiftWeek,
    onGoThisWeek,
    hasScheduledTasks,
    isGenerating,
    onGenerateWeek,
  }: ScheduleWeekControlsProps) => {
    const isGenerateDisabled =
      isDirty || Boolean(isGenerating) || hasScheduledTasks === false
    const isCopyDisabled =
      isDirty || Boolean(isCopying) || hasScheduledTasks === false

    const generateTooltipTitle = isDirty
      ? "Vui lòng lưu thay đổi hiện tại trước khi tạo công việc"
      : hasScheduledTasks === false
        ? "Tuần này chưa có lịch làm việc để tạo công việc"
        : ""

    const copyTooltipTitle = isDirty
      ? "Vui lòng lưu thay đổi hiện tại trước khi sao chép"
      : hasScheduledTasks === false
        ? "Tuần này chưa có lịch làm việc để sao chép"
        : ""

    return (
      <>
        <Button
          type="primary"
          icon={<Save size={14} />}
          loading={isSaving}
          disabled={!isDirty}
          onClick={onSave}
          className={isDirty ? "shadow-md animate-pulse" : ""}
        >
          Lưu thay đổi {isDirty && "(*)"}
        </Button>

        {onGenerateWeek && (
          <Tooltip placement="bottomRight" title={generateTooltipTitle}>
            <Popconfirm
              placement="bottomRight"
              title="Tạo công việc cho tuần này?"
              description={`Tự động quét lịch trình và tạo các ca làm việc cho tuần ${getISOWeekNumber(weekStart)} (${toDisplayDate(weekStart)}).`}
              onConfirm={onGenerateWeek}
              okText="Tạo công việc"
              cancelText="Hủy"
              disabled={isGenerateDisabled}
            >
              <Button
                icon={<Sparkles size={14} />}
                loading={isGenerating}
                disabled={isGenerateDisabled}
              >
                Tạo công việc
              </Button>
            </Popconfirm>
          </Tooltip>
        )}

        <Tooltip placement="bottomRight" title={copyTooltipTitle}>
          <Popconfirm
            placement="bottomRight"
            title="Sao chép lịch sang tuần sau?"
            description={`Sao chép toàn bộ lịch tuần ${getISOWeekNumber(weekStart)} sang tuần ${getISOWeekNumber(nextWeekStart)} (${toDisplayDate(nextWeekStart)}).`}
            onConfirm={onCopyNextWeek}
            okText="Sao chép"
            cancelText="Hủy"
            disabled={isCopyDisabled}
          >
            <Button
              icon={<Copy size={14} />}
              loading={isCopying}
              disabled={isCopyDisabled}
            >
              Sao chép sang tuần sau
            </Button>
          </Popconfirm>
        </Tooltip>

        <WeekNavigator
          weekStart={weekStart}
          onShiftWeek={onShiftWeek}
          onGoThisWeek={onGoThisWeek}
        />
      </>
    )
  },
)
ScheduleWeekControls.displayName = "ScheduleWeekControls"

export default ScheduleWeekControls
