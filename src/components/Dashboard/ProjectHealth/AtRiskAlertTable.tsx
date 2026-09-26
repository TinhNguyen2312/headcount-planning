import { Table, type TableColumnsType } from "antd"
import { AlertTriangle, Clock, User } from "lucide-react"
import React from "react"
import type { AtRiskTaskReportResponse } from "@/types"

interface AtRiskAlertTableProps {
  tasks: AtRiskTaskReportResponse[]
  loading?: boolean
}

export const AtRiskAlertTable: React.FC<AtRiskAlertTableProps> = ({
  tasks,
  loading = false,
}) => {
  const columns: TableColumnsType<AtRiskTaskReportResponse> = [
    {
      title: "Tên công việc",
      dataIndex: "taskTitle",
      key: "taskTitle",
      render: (text: string, record) => {
        const isCritical = record.minutesRemaining <= 30
        return (
          <div className="flex items-start gap-2">
            <AlertTriangle
              className={`size-4 shrink-0 mt-0.5 ${
                isCritical ? "text-destructive animate-pulse" : "text-amber-500"
              }`}
            />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground line-clamp-1">
                {text}
              </span>
              {record.parentTaskTitle && (
                <span className="text-[11px] text-muted-foreground line-clamp-1">
                  {record.parentTaskTitle}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      title: "Phân khu & Phụ trách",
      key: "zoneAndExecutor",
      width: 220,
      render: (_, record) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-medium text-foreground">
            {record.zoneName || "Toàn dự án"}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <User className="size-3" />
            {record.executorName || "Chưa gán"}
          </span>
        </div>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "slaDeadline",
      key: "slaDeadline",
      align: "center",
      width: 100,
      render: (val: string) => (
        <span className="text-base font-medium text-muted-foreground">
          {val ? val.slice(11, 16) : "--:--"}
        </span>
      ),
    },
    {
      title: "Thời gian còn lại",
      dataIndex: "minutesRemaining",
      key: "minutesRemaining",
      align: "right",
      width: 200,
      render: (mins: number) => {
        const isCritical = mins <= 30

        return (
          <div className="flex items-center justify-end gap-1">
            <span
              className={`text-destructive-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-black ${
                isCritical ? "bg-destructive  animate-pulse" : "bg-yellow-500"
              }`}
            >
              <Clock className="size-3" />
              {mins} phút
            </span>
            {/* {record.escalateLevel && (
              <Tag
                color={tagColor}
                className="mr-0 text-[10px] leading-tight px-1 py-0 font-bold"
              >
                {record.escalateLevel}
              </Tag>
            )} */}
          </div>
        )
      },
    },
  ]

  return (
    <Table
      rowKey="taskInstanceId"
      columns={columns}
      dataSource={tasks.slice(0, 5)}
      loading={loading}
      pagination={false}
      size="small"
      locale={{
        emptyText: (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-muted-foreground">
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Clock className="size-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Không có công việc nào trong vùng nguy cơ trễ hạn
            </p>
            <p className="text-[11px] text-muted-foreground">
              Tất cả công việc trong ca đều đang được thực hiện đúng định mức
              SLA
            </p>
          </div>
        ),
      }}
    />
  )
}
