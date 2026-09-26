import { Segmented } from "antd"
import { TaskInstanceStageStatus } from "@/types"

export type StageStatusTabValue = "ALL" | TaskInstanceStageStatus

interface StageStatusTabsProps {
  selectedStatus: StageStatusTabValue
  onSelectStatus: (status: StageStatusTabValue) => void
  counts?: Partial<Record<StageStatusTabValue, number>>
}

export const StageStatusTabs = ({
  selectedStatus,
  onSelectStatus,
  counts,
}: StageStatusTabsProps) => {
  const options: { label: string; value: StageStatusTabValue }[] = [
    {
      label: `Tất cả${counts?.ALL !== undefined ? ` (${counts.ALL})` : ""}`,
      value: "ALL",
    },
    {
      label: `Chưa nộp${counts?.TODO !== undefined ? ` (${counts.TODO})` : ""}`,
      value: "TODO",
    },
    {
      label: `Chờ duyệt${counts?.IN_REVIEW !== undefined ? ` (${counts.IN_REVIEW})` : ""}`,
      value: "IN_REVIEW",
    },
    {
      label: `Đã duyệt${counts?.APPROVED !== undefined ? ` (${counts.APPROVED})` : ""}`,
      value: "APPROVED",
    },
    {
      label: `Không đạt${counts?.REJECTED !== undefined ? ` (${counts.REJECTED})` : ""}`,
      value: "REJECTED",
    },
    {
      label: `Hoàn thành${counts?.COMPLETED !== undefined ? ` (${counts.COMPLETED})` : ""}`,
      value: "COMPLETED",
    },
  ]

  return (
    <Segmented
      size="middle"
      block
      value={selectedStatus}
      onChange={(val) => onSelectStatus(val as StageStatusTabValue)}
      options={options}
      className="bg-muted/60 p-1 text-base font-semibold"
    />
  )
}
