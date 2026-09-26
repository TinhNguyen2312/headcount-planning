import { Card, Tag } from "antd"
import { ClipboardList } from "lucide-react"
import { STAGE_STATUS_TAG } from "@/components/MyTask/taskStageStatus"
import type { TaskInstanceResponse } from "@/types"

export type ApprovalListItem = Omit<TaskInstanceResponse, "description"> & {
  description?: string
}

interface PendingApprovalRowProps {
  task: ApprovalListItem
  onPress: () => void
}

export const PendingApprovalRow = ({
  task,
  onPress,
}: PendingApprovalRowProps) => {
  const statusTag = STAGE_STATUS_TAG[task.stageStatus]

  return (
    <Card hoverable size="small" onClick={onPress}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {task.taskItemTitle ?? task.title}
            </p>
            {statusTag && (
              <Tag color={statusTag.color} className="m-0 shrink-0">
                {statusTag.label}
              </Tag>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {task.title}
          </p>
        </div>
      </div>
    </Card>
  )
}
