import { Card, Col, Row, Select } from "antd"
import { AlertTriangle, CheckCircle2, Layers, User, Zap } from "lucide-react"
import React, { useMemo, useState } from "react"
import { DashboardStatCard } from "@/components/Dashboard/DashboardStatCard"
import { reportQueries } from "@/hooks/server/reports"
import useAuth from "@/hooks/useAuth"
import { TaskBreakdownTreeTable } from "./TaskBreakdownTreeTable"
import { UserProfileCard } from "./UserProfileCard"
import { WorkloadHeatmap } from "./WorkloadHeatmap"

interface PersonalPerformanceDashboardProps {
  projectId?: number
  fromDate?: string
  toDate?: string
}

export const PersonalPerformanceDashboard: React.FC<
  PersonalPerformanceDashboardProps
> = ({ projectId, fromDate, toDate }) => {
  const { user } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    user?.id,
  )

  const { data: leaderboardData = [] } = reportQueries.useLeaderboard({
    projectId,
    fromDate,
    toDate,
  })

  const userOptions = useMemo(() => {
    if (leaderboardData.length > 0) {
      return leaderboardData.map((u) => ({
        value: u.userId,
        label: `${u.userName} (${u.roleName || "Kỹ sư"})`,
      }))
    }
    if (user?.id) {
      return [
        {
          value: user.id,
          label: `${user.fullName} (${user.role || "Cá nhân"})`,
        },
      ]
    }
    return []
  }, [leaderboardData, user])

  const activeUserId = selectedUserId ?? userOptions[0]?.value ?? user?.id ?? 1

  const { data: userPerf, isLoading: perfLoading } =
    reportQueries.useUserHistory({
      userId: activeUserId,
      projectId,
      fromDate,
      toDate,
    })

  const { data: heatmapData = [], isLoading: heatmapLoading } =
    reportQueries.useUserWorkloadHeatmap({
      userId: activeUserId,
      projectId,
      fromDate,
      toDate,
    })

  const { data: breakdownData = [], isLoading: breakdownLoading } =
    reportQueries.useUserTaskBreakdown({
      userId: activeUserId,
      projectId,
      fromDate,
      toDate,
    })

  const safePerf = userPerf || {
    userId: activeUserId,
    userName:
      userOptions.find((o) => o.value === activeUserId)?.label.split(" (")[0] ||
      user?.fullName ||
      "Kỹ sư",
    totalAssigned: 0,
    totalCompleted: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalOverdue: 0,
    passRate: 100,
    completionRate: 100,
    totalParentTasks: 0,
    runningParentTasks: 0,
    totalChildTasks: 0,
    runningChildTasks: 0,
    lateTasks: 0,
    lateRate: 0,
    totalLateHours: 0,
    earlyTasks: 0,
    earlyRate: 0,
    totalEarlyHours: 0,
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-2xs rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-foreground">
                Chọn Nhân sự Đánh giá
              </span>
            </div>
          </div>

          <Select
            className="w-full sm:w-80"
            value={activeUserId}
            onChange={(val) => setSelectedUserId(val)}
            options={userOptions}
            showSearch
            optionFilterProp="label"
            placeholder="Tìm kiếm và chọn nhân sự"
            size="middle"
          />
        </div>
      </Card>

      <UserProfileCard
        userPerf={safePerf}
        roleName={
          leaderboardData.find((u) => u.userId === activeUserId)?.roleName ||
          "Kỹ sư chuyên môn"
        }
        departmentName={
          leaderboardData.find((u) => u.userId === activeUserId)
            ?.departmentName || "Phòng Quản lý Xây dựng (PCD)"
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Số Nghiệp vụ"
            value={`${safePerf.totalParentTasks || 0}`}
            subtitle={`Còn ${safePerf.runningChildTasks || 0} việc đang thực hiện`}
            icon={Layers}
            tone="primary"
            loading={perfLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Tỷ lệ Hoàn thành"
            value={`${(safePerf.completionRate || 0).toFixed(1)}%`}
            subtitle={`${safePerf.totalCompleted}/${safePerf.totalAssigned} việc hoàn thành`}
            icon={CheckCircle2}
            tone="success"
            loading={perfLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Việc Trễ hạn & Số giờ"
            value={`${safePerf.lateTasks || 0} việc`}
            subtitle={`Tổng trễ: ${(safePerf.totalLateHours || 0).toFixed(1)}h (${(safePerf.lateRate || 0).toFixed(1)}%)`}
            icon={AlertTriangle}
            tone={safePerf.lateTasks ? "danger" : "info"}
            loading={perfLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Việc Sớm hạn & Tiết kiệm"
            value={`${(safePerf.totalEarlyHours || 0).toFixed(1)}h`}
            subtitle={`${safePerf.earlyTasks || 0} việc hoàn thành trước hạn`}
            icon={Zap}
            tone="info"
            loading={perfLoading}
          />
        </Col>
      </Row>

      <WorkloadHeatmap data={heatmapData} loading={heatmapLoading} />

      <TaskBreakdownTreeTable data={breakdownData} loading={breakdownLoading} />
    </div>
  )
}

export default PersonalPerformanceDashboard
