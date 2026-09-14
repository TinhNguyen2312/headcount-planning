import { Card, Tag, Tooltip } from "antd"
import { GitBranch, Pencil, Trash2 } from "lucide-react"
import React from "react"
import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import type { MilestoneResponse } from "@/types"
import {
  MILESTONE_NODE_HEIGHT,
  MILESTONE_NODE_WIDTH,
} from "./milestoneTreeLayout"

interface MilestoneNodeProps {
  milestone: MilestoneResponse
  onEdit?: (milestone: MilestoneResponse) => void
  onDelete?: (milestone: MilestoneResponse) => void
}

const MilestoneNode: React.FC<MilestoneNodeProps> = ({
  milestone,
  onEdit,
  onDelete,
}) => {
  const items: ActionMenuItem<MilestoneResponse>[] = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <Pencil className="size-4" />,
      onClick: (m) => onEdit?.(m),
    },
    {
      key: "delete",
      label: "Xóa mốc",
      icon: <Trash2 className="size-4" />,
      danger: true,
      confirm: {
        title: "Xác nhận xóa mốc tiến độ?",
        content: `Bạn có chắc chắn muốn xóa mốc "${milestone.code} - ${milestone.name}" không? Thao tác này không thể hoàn tác.`,
        okType: "danger",
        okText: "Xóa",
        cancelText: "Hủy",
      },
      onClick: (m) => onDelete?.(m),
    },
  ]

  const predCount = milestone.predecessorIds?.length ?? 0

  return (
    <Card
      style={{ width: MILESTONE_NODE_WIDTH, height: MILESTONE_NODE_HEIGHT }}
      className={`nodrag nopan gap-0 overflow-hidden text-left shadow-sm cursor-default border transition-all hover:shadow-md ${
        milestone.isActive
          ? "border-primary/40 bg-card"
          : "border-border/60 bg-muted/30 opacity-75"
      }`}
    >
      <div className="flex h-full flex-col justify-between p-2.5">
        {/* Top: Code Tag + Status + Actions */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Tag
              color="blue"
              className="font-mono font-bold text-xs m-0 shrink-0"
            >
              {milestone.code}
            </Tag>
            {!milestone.isActive && (
              <Tag color="default" className="text-[10px] m-0 shrink-0">
                Tạm dừng
              </Tag>
            )}
          </div>
          <ActionMenu
            record={milestone}
            items={items}
            triggerButtonClassName="nodrag nopan -mt-1 -mr-1 size-5! p-0! shrink-0"
          />
        </div>

        {/* Center: Milestone Name */}
        <Tooltip title={milestone.name}>
          <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
            {milestone.name}
          </span>
        </Tooltip>

        {/* Bottom: Predecessors info */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <div className="flex items-center gap-1">
            <GitBranch className="size-3 text-primary/70" />
            <span>
              {predCount > 0 ? `${predCount} mốc tiền đề` : "Mốc khởi đầu"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MilestoneNode
