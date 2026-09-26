import { Select, Tabs } from "antd"
import { Building2, Calendar, LineChart, Trophy, UserCheck } from "lucide-react"
import React, { useMemo, useState } from "react"
import { LeaderboardDashboard } from "@/components/Dashboard/Leaderboard/LeaderboardDashboard"
import { PersonalPerformanceDashboard } from "@/components/Dashboard/Personal/PersonalPerformanceDashboard"
import { ProjectHealthDashboard } from "@/components/Dashboard/ProjectHealth/ProjectHealthDashboard"
import { projectQueries } from "@/hooks/server/projects"
import useAuth from "@/hooks/useAuth"

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("project-health")
  const [period, setPeriod] = useState<
    "day" | "week" | "month" | "quarter" | "year"
  >("month")

  // Query projects for filter dropdown
  const { data: projects = [] } = projectQueries.useList({ limit: 50 })
  const defaultProjectId = user?.currentProject?.id || projects[0]?.id || 1
  const [selectedProjectId, setSelectedProjectId] =
    useState<number>(defaultProjectId)

  const { fromDate, toDate, periodLabel } = useMemo(() => {
    const now = new Date()
    const to = now.toISOString().slice(0, 10)
    let from = to
    let label = "Hôm nay"

    if (period === "week") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      from = past.toISOString().slice(0, 10)
      label = "7 ngày gần nhất"
    } else if (period === "month") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      from = past.toISOString().slice(0, 10)
      label = "Tháng này (30 ngày)"
    } else if (period === "quarter") {
      const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      from = past.toISOString().slice(0, 10)
      label = "Quý này (90 ngày)"
    } else if (period === "year") {
      const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      from = past.toISOString().slice(0, 10)
      label = "Năm 2026"
    }

    return { fromDate: from, toDate: to, periodLabel: label }
  }, [period])

  const projectOptions = useMemo(() => {
    if (projects.length > 0) {
      return projects.map((p) => ({ value: p.id, label: p.name }))
    }
    return [
      { value: 1, label: "NovaWorld Phan Thiết" },
      { value: 2, label: "Aqua City - Đô thị sinh thái" },
      { value: 3, label: "NovaWorld Hồ Tràm" },
    ]
  }, [projects])

  const tabItems = [
    {
      key: "project-health",
      label: (
        <span className="flex items-center gap-2 text-base font-semibold py-1">
          <LineChart className="size-4" />
          Tổng quan
        </span>
      ),
      children: (
        <ProjectHealthDashboard
          projectId={selectedProjectId}
          fromDate={fromDate}
          toDate={toDate}
        />
      ),
    },
    {
      key: "leaderboard",
      label: (
        <span className="flex items-center gap-2 text-base font-semibold py-1">
          <Trophy className="size-4" />
          Xếp loại Nhân sự
        </span>
      ),
      children: (
        <LeaderboardDashboard
          projectId={selectedProjectId}
          fromDate={fromDate}
          toDate={toDate}
        />
      ),
    },
    {
      key: "personal",
      label: (
        <span className="flex items-center gap-2 text-base font-semibold py-1">
          <UserCheck className="size-4" />
          Đánh giá Cá nhân
        </span>
      ),
      children: (
        <PersonalPerformanceDashboard
          projectId={selectedProjectId}
          fromDate={fromDate}
          toDate={toDate}
        />
      ),
    },
  ]

  return (
    <div className="mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              BẢNG ĐIỀU HÀNH TỔNG HỢP PCD - GMS
            </span>
            <span className="text-base text-muted-foreground">
              - {periodLabel}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">
            Báo cáo Tiến độ của Dự án và Đánh giá KPI
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-base">
            <Building2 className="size-3.5 text-primary" />
            <Select
              variant="borderless"
              size="small"
              className="min-w-[160px] text-base font-semibold"
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projectOptions}
              popupMatchSelectWidth={false}
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-base">
            <Calendar className="size-3.5 text-muted-foreground" />
            <Select
              variant="borderless"
              size="small"
              className="min-w-[110px] text-base font-semibold"
              value={period}
              onChange={(val) => setPeriod(val)}
              options={[
                { value: "day", label: "Theo Ngày" },
                { value: "week", label: "Theo Tuần" },
                { value: "month", label: "Theo Tháng" },
                { value: "quarter", label: "Theo Quý" },
                { value: "year", label: "Theo Năm" },
              ]}
            />
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="middle"
        className="dashboard-unified-tabs"
      />
    </div>
  )
}

export default DashboardPage
