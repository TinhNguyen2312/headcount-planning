import { Progress, Table, type TableColumnsType } from "antd"
import { Award, Clock, Medal, Trophy } from "lucide-react"
import React from "react"
import type { LeaderboardUserResponse } from "@/types"

interface LeaderboardTableProps {
  users: LeaderboardUserResponse[]
  loading?: boolean
}

const getInitials = (name?: string) => {
  if (!name) return "KS"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  users,
  loading = false,
}) => {
  const columns: TableColumnsType<LeaderboardUserResponse> = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 75,
      align: "center",
      render: (rank: number) => {
        if (rank === 1) {
          return (
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/15 font-black text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Trophy className="size-5" />
            </span>
          )
        }
        if (rank === 2) {
          return (
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-300/40 dark:bg-slate-700/50 font-black text-slate-600 dark:text-slate-300 border border-slate-400/30">
              <Medal className="size-5" />
            </span>
          )
        }
        if (rank === 3) {
          return (
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-orange-500/15 font-black text-orange-600 dark:text-orange-400 border border-orange-500/30">
              <Award className="size-5" />
            </span>
          )
        }
        return (
          <span className="text-base font-semibold text-muted-foreground">
            {rank}
          </span>
        )
      },
    },
    {
      title: "Nhân sự",
      dataIndex: "userName",
      key: "userName",
      render: (text: string, record) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
            {getInitials(text)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-base">{text}</span>
            <span className="text-[12px] text-muted-foreground">
              {record.roleName || "Kỹ sư chuyên môn"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      responsive: ["md"],
      render: (dept: string) => (
        <span className="text-base text-muted-foreground">
          {dept || "Phòng QLXD"}
        </span>
      ),
    },
    {
      title: "Tổng việc",
      dataIndex: "totalTasks",
      key: "totalTasks",
      align: "right",
      sorter: (a, b) => a.totalTasks - b.totalTasks,
      render: (val: number) => (
        <span className="font-bold text-foreground text-base">{val}</span>
      ),
    },
    {
      title: "Tỷ lệ Đúng hạn",
      dataIndex: "onTimeRate",
      key: "onTimeRate",
      width: 170,
      align: "right",
      sorter: (a, b) => a.onTimeRate - b.onTimeRate,
      render: (rate: number, record) => {
        const isGood = rate >= 90
        const isWarning = rate >= 75 && rate < 90

        return (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-base">
              <span className="font-black text-foreground">
                {rate.toFixed(1)}%
              </span>
              <span className="text-base text-muted-foreground">
                ({record.onTimeTasks}/{record.totalTasks})
              </span>
            </div>
            <Progress
              percent={Number(rate.toFixed(1))}
              showInfo={false}
              size="small"
              strokeColor={
                isGood ? "var(--primary)" : isWarning ? "#f59e0b" : "#ef4444"
              }
              className="m-0 w-24"
            />
          </div>
        )
      },
    },
    {
      title: "% Trễ hạn",
      dataIndex: "lateRate",
      key: "lateRate",
      align: "right",
      responsive: ["sm"],
      sorter: (a, b) => a.lateRate - b.lateRate,
      render: (rate: number, record) => (
        <span
          className={`text-base font-semibold ${
            rate > 0 ? "text-destructive font-bold" : "text-muted-foreground"
          }`}
        >
          {rate.toFixed(1)}%
          {record.overdueTasks > 0 && <span>({record.overdueTasks})</span>}
        </span>
      ),
    },
    {
      title: "% Đang thực hiện",
      dataIndex: "uncompletedRate",
      key: "uncompletedRate",
      align: "right",
      responsive: ["lg"],
      render: (rate: number) => (
        <span className="text-base font-semibold">{rate.toFixed(1)}%</span>
      ),
    },
    {
      title: "Hoàn thành sớm",
      dataIndex: "totalEarlyHours",
      key: "totalEarlyHours",
      align: "right",
      sorter: (a, b) => a.totalEarlyHours - b.totalEarlyHours,
      render: (hours: number) => (
        <span className="inline-flex items-center gap-1 font-mono text-base font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
          <Clock className="size-3" />
          {hours.toFixed(1)}h
        </span>
      ),
    },
  ]

  return (
    <Table
      rowKey="userId"
      columns={columns}
      dataSource={users}
      loading={loading}
      size="middle"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng số ${total} nhân sự`,
      }}
      className="leaderboard-table overflow-hidden rounded-xl border border-border/60"
    />
  )
}

export default LeaderboardTable
