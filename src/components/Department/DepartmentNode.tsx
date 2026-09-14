import { Badge, Card, Modal, Tag, Tooltip } from "antd"
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react"
import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import { departmentQueries } from "@/hooks/server/departments"
import type { DepartmentResponse } from "@/types"

export const DEPARTMENT_NODE_WIDTH = 260
export const DEPARTMENT_NODE_HEIGHT = 135

interface DepartmentNodeProps {
  department: DepartmentResponse
  childCount?: number
  expanded?: boolean
  onToggleExpand?: () => void
  onEdit?: (department: DepartmentResponse) => void
}

const getTypeColor = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "khối":
    case "division":
      return "purple"
    case "ban":
      return "blue"
    case "phòng":
    case "department":
      return "cyan"
    case "bộ phận":
    case "team":
      return "geekblue"
    default:
      return "default"
  }
}

const DepartmentNode = ({
  department,
  childCount = 0,
  expanded = true,
  onToggleExpand,
  onEdit,
}: DepartmentNodeProps) => {
  const deleteMutation = departmentQueries.useDelete()

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa phòng ban",
      content: `Bạn có chắc chắn muốn xóa "${department.name}" (${department.code}) không? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        await deleteMutation.mutateAsync(department.id)
      },
    })
  }

  const items: ActionMenuItem<DepartmentResponse>[] = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <Pencil className="size-4" />,
      onClick: (d) => onEdit?.(d),
    },
    {
      key: "delete",
      label: "Xóa phòng ban",
      icon: <Trash2 className="size-4 text-destructive" />,
      danger: true,
      onClick: handleDelete,
    },
  ]

  const isActive = department.status !== "INACTIVE"

  return (
    <Card
      style={{ width: DEPARTMENT_NODE_WIDTH, height: DEPARTMENT_NODE_HEIGHT }}
      className="nodrag nopan gap-0 overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow cursor-default border-border"
    >
      <div className="flex h-full flex-col justify-between p-3">
        {/* Header: Tag + Status + Actions */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Tag
              color={getTypeColor(department.type)}
              className="mr-0 text-xs px-1.5 py-0 leading-tight"
            >
              {department.type || "Phòng ban"}
            </Tag>
            <Badge
              status={isActive ? "success" : "default"}
              text={
                <span className="text-[11px] text-muted-foreground">
                  {isActive ? "Hoạt động" : "Tạm dừng"}
                </span>
              }
            />
          </div>
          <ActionMenu
            record={department}
            items={items}
            triggerButtonClassName="nodrag nopan -mt-1 -mr-1 size-6! p-0! shrink-0 text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Name */}
        <div className="my-1">
          <Tooltip title={`${department.name} (${department.code})`}>
            <span className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
              {department.name}
            </span>
          </Tooltip>
        </div>

        {/* Metadata: Code & Level */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[11px] font-medium">
            {department.code}
          </span>
          {department.level !== undefined && department.level !== null && (
            <span className="text-[11px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
              Cấp {department.level}
            </span>
          )}
        </div>

        {/* Footer: Expand / Collapse children */}
        <div className="pt-1.5 border-t border-border/50 flex items-center justify-between text-xs">
          {childCount > 0 ? (
            <button
              type="button"
              onClick={onToggleExpand}
              className="nodrag nopan flex items-center gap-1 text-primary text-xs font-medium hover:underline cursor-pointer transition-colors"
            >
              {expanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
              {childCount} đơn vị con
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
              <Building2 className="size-3 opacity-60" />
              Đơn vị cơ sở
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export default DepartmentNode
