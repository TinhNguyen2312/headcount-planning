import React from "react"
import {
  Table,
  Tag,
  Checkbox,
  Button,
  Space,
  Tooltip,
  Typography,
} from "antd"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileText,
  UserCheck,
} from "lucide-react"
import { WeeklyWorkItem, WorkStatus } from "../types"
import { useDmdRole } from "@/core/auth/roleContext"

const { Text } = Typography

interface WeeklyWorkTableProps {
  tasks: WeeklyWorkItem[]
  onToggleStatus: (taskId: string) => void
}

export const WeeklyWorkTable: React.FC<WeeklyWorkTableProps> = ({
  tasks,
  onToggleStatus,
}) => {
  const { currentRole, currentUser } = useDmdRole()

  const isTaskEditable = (record: WeeklyWorkItem) => {
    if (currentRole === "BOM") return false
    if (currentRole === "DMD_HEAD") return true
    // DESIGNER only edits his own assigned tasks
    return record.assigneeName.includes("Trần Hải Đăng") || record.assigneeName.includes(currentUser.name)
  }

  const getCheckboxTooltip = (record: WeeklyWorkItem) => {
    if (currentRole === "BOM") {
      return "Ban Tổng Giám Đốc theo dõi ở chế độ giám sát chỉ đọc (RACI 3.3.6)."
    }
    if (currentRole === "DESIGNER" && !isTaskEditable(record)) {
      return `Chỉ KTS được phân công (${record.assigneeName}) mới có quyền cập nhật việc này.`
    }
    return record.status === "DONE" ? "Click để chuyển về Đang làm" : "Click để tick hoàn thành công việc"
  }

  const columns = [
    {
      title: "Trạng Thái",
      key: "status",
      width: 140,
      render: (_: any, record: WeeklyWorkItem) => {
        const isDone = record.status === "DONE"
        const canEdit = isTaskEditable(record)

        return (
          <div className="flex items-center gap-2">
            <Tooltip title={getCheckboxTooltip(record)}>
              <Checkbox
                checked={isDone}
                disabled={!canEdit}
                onChange={() => onToggleStatus(record.id)}
              />
            </Tooltip>
            {isDone ? (
              <Tag color="success" className="font-semibold text-xs py-0.5">
                HOÀN THÀNH
              </Tag>
            ) : record.status === "DELAYED" ? (
              <Tag color="error" className="font-semibold text-xs py-0.5">
                CHẬM TIẾN ĐỘ
              </Tag>
            ) : (
              <Tag color="processing" className="text-xs py-0.5">
                ĐANG LÀM
              </Tag>
            )}
          </div>
        )
      },
    },
    {
      title: "Nội Dung Công Việc Tuần",
      dataIndex: "taskTitle",
      key: "taskTitle",
      render: (title: string, record: WeeklyWorkItem) => (
        <div className="space-y-0.5">
          <div className={`font-medium text-xs ${record.status === "DONE" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {title}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>Giai đoạn: <strong className="text-foreground">{record.stageCode}</strong></span>
            {record.relatedDwgCode && (
              <>
                <span>•</span>
                <span className="font-mono text-primary">{record.relatedDwgCode}</span>
              </>
            )}
            <span>•</span>
            <span>Trọng số: <strong className="text-foreground">{record.kpiWeight}%</strong></span>
          </div>
        </div>
      ),
    },
    {
      title: "Nghiệp Vụ Chuyên Môn (23 NV)",
      dataIndex: "competencyCode",
      key: "competencyCode",
      width: 220,
      render: (code: string, record: WeeklyWorkItem) => (
        <Tooltip title={record.competencyName}>
          <div className="cursor-pointer">
            <Tag color="purple" className="font-mono font-bold text-xs">
              NV {code}
            </Tag>
            <div className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
              {record.competencyName}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Người Thực Hiện",
      dataIndex: "assigneeName",
      key: "assigneeName",
      width: 170,
      render: (name: string, record: WeeklyWorkItem) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{name}</div>
          <div className="text-[11px] text-muted-foreground">{record.assigneeRole}</div>
        </div>
      ),
    },
    {
      title: "Hạn Chót",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date: string, record: WeeklyWorkItem) => (
        <div className="text-xs">
          <div className={record.isOverdue && record.status !== "DONE" ? "text-red-500 font-bold" : "text-foreground"}>
            {date}
          </div>
          {record.completedDate && (
            <div className="text-[10px] text-emerald-600">Xong: {record.completedDate}</div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Danh Sách Công Việc Kế Hoạch Tuần Hiện Tại ({tasks.length} đầu việc)
        </span>
        <span className="text-xs text-muted-foreground">
          Bấm tick vào ô vuông để cập nhật trạng thái hoàn thành công việc
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        pagination={false}
        size="middle"
      />
    </div>
  )
}
