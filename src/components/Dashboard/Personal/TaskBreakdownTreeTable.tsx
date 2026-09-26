import { Card, Progress, Table, type TableColumnsType } from "antd"
import { FolderGit2, ListChecks } from "lucide-react"
import React from "react"
import type { TaskBreakdownNode } from "@/types"

interface TaskBreakdownTreeTableProps {
  data: TaskBreakdownNode[]
  loading?: boolean
}

export const TaskBreakdownTreeTable: React.FC<TaskBreakdownTreeTableProps> = ({
  data,
  loading = false,
}) => {
  const columns: TableColumnsType<TaskBreakdownNode> = [
    {
      title: "Nghiệp vụ",
      dataIndex: "title",
      key: "title",
      render: (text: string, record) => {
        const isParent = record.childTasks && record.childTasks.length > 0
        return (
          <div className="flex items-center gap-2 py-0.5">
            {isParent ? (
              <FolderGit2 className="size-4 shrink-0 text-primary" />
            ) : (
              <ListChecks className="size-3.5 shrink-0 text-muted-foreground ml-1" />
            )}
            <span
              className={`text-base ${
                isParent
                  ? "font-bold text-foreground tracking-tight"
                  : "font-medium text-foreground/90"
              }`}
            >
              {text}
            </span>
          </div>
        )
      },
    },
    {
      title: "Tổng số",
      dataIndex: "total",
      key: "total",
      width: 100,
      align: "right",
      render: (val: number, record) => (
        <span
          className={`text-base ${
            record.childTasks?.length
              ? "font-black text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {val} việc
        </span>
      ),
    },
    {
      title: "Đã hoàn thành",
      dataIndex: "completedTasks",
      key: "completedTasks",
      width: 150,
      align: "right",
      render: (val: number) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
          {val}
        </span>
      ),
    },
    {
      title: "Chưa thực hiện",
      dataIndex: "uncompletedTasks",
      key: "uncompletedTasks",
      width: 150,
      align: "right",
      render: (val: number) => (
        <span
          className={`text-base ${
            val > 0
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-muted-foreground"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Trễ hạn",
      dataIndex: "overdueTasks",
      key: "overdueTasks",
      width: 100,
      align: "right",
      render: (val: number) => (
        <span
          className={`text-base ${
            val > 0 ? "font-black text-destructive" : "text-muted-foreground"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Tỷ lệ Đạt",
      key: "rate",
      width: 150,
      align: "center",
      render: (_, record) => {
        const rate =
          record.total > 0
            ? Math.round((record.completedTasks / record.total) * 100)
            : 0
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress
              percent={rate}
              size="small"
              strokeColor="var(--primary)"
            />
          </div>
        )
      },
    },
  ]

  return (
    <Card
      className="shadow-2xs rounded-2xl"
      title={
        <div className="text-base font-bold text-foreground">
          Bảng Chi tiết Công việc
        </div>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        size="middle"
        pagination={false}
        expandable={{
          defaultExpandAllRows: true,
          childrenColumnName: "childTasks",
        }}
        className="overflow-hidden rounded-xl border border-border/60"
      />
    </Card>
  )
}

export default TaskBreakdownTreeTable
