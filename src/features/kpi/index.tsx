import React, { useState, useMemo } from "react"
import { message } from "antd"
import {
  INITIAL_STAFF_KPIS,
  INITIAL_WEEKLY_TASKS,
  SAMPLE_WEEKLY_REPORT,
} from "./data/kpiData"
import { WeeklyWorkItem, StaffKpiRecord, WeeklyReportData } from "./types"
import { KpiHeader } from "./components/KpiHeader"
import { WeeklyWorkTable } from "./components/WeeklyWorkTable"
import { StaffKpiCards } from "./components/StaffKpiCards"
import { WeeklyReportModal } from "./components/WeeklyReportModal"

export const KpiFeature: React.FC = () => {
  const [tasks, setTasks] = useState<WeeklyWorkItem[]>(INITIAL_WEEKLY_TASKS)
  const [staffList, setStaffList] = useState<StaffKpiRecord[]>(INITIAL_STAFF_KPIS)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length
    const doneTasks = tasks.filter((t) => t.status === "DONE").length
    const delayedTasks = tasks.filter((t) => t.status === "DELAYED" || t.isOverdue).length
    const onTimeRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const avgKpiScore =
      staffList.reduce((acc, s) => acc + s.kpiScore, 0) / (staffList.length || 1)

    return { totalTasks, doneTasks, delayedTasks, onTimeRate, avgKpiScore }
  }, [tasks, staffList])

  // Toggle completion of a weekly task
  const handleToggleStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === "DONE" ? "IN_PROGRESS" : "DONE"
          const completedDate =
            newStatus === "DONE"
              ? new Date().toLocaleDateString("vi-VN")
              : undefined

          return {
            ...t,
            status: newStatus,
            completedDate,
          }
        }
        return t
      })
    )

    message.success("Đã cập nhật trạng thái công việc và tính toán lại hiệu suất KPI!")
  }

  return (
    <div className="py-2 space-y-6">
      <KpiHeader
        totalTasks={metrics.totalTasks}
        doneTasks={metrics.doneTasks}
        delayedTasks={metrics.delayedTasks}
        avgKpiScore={metrics.avgKpiScore}
        onTimeRate={metrics.onTimeRate}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Staff KPI SMART Cards */}
      <StaffKpiCards staffList={staffList} />

      {/* Weekly Task Checklist */}
      <WeeklyWorkTable tasks={tasks} onToggleStatus={handleToggleStatus} />

      {/* Weekly Report Modal */}
      <WeeklyReportModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={SAMPLE_WEEKLY_REPORT}
      />
    </div>
  )
}
