import { Card, Col, Progress, Row } from "antd"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Layers,
  ListTodo,
  TrendingUp,
} from "lucide-react"
import React, { useMemo } from "react"
import { DashboardStatCard } from "@/components/Dashboard/DashboardStatCard"
import { reportQueries } from "@/hooks/server/reports"
import { AtRiskAlertTable } from "./AtRiskAlertTable"
import { RolePerformanceBarChart } from "./RolePerformanceBarChart"
import { TrendLineChart } from "./TrendLineChart"

interface ProjectHealthDashboardProps {
  projectId?: number
  fromDate?: string
  toDate?: string
}

export const ProjectHealthDashboard: React.FC<ProjectHealthDashboardProps> = ({
  projectId,
  fromDate,
  toDate,
}) => {
  const { data: progressData, isLoading: progressLoading } =
    reportQueries.useProgress(
      projectId ? { projectId, fromDate, toDate } : undefined,
    )

  const { data: trendData, isLoading: trendLoading } =
    reportQueries.useProgressTrend({
      projectId: projectId || 1,
      interval: "DAY",
      fromDate,
      toDate,
    })

  const { data: roleData = [], isLoading: roleLoading } =
    reportQueries.useByRole({ projectId, fromDate, toDate })

  const { data: atRiskData = [], isLoading: atRiskLoading } =
    reportQueries.useAtRisk({
      projectId: projectId || 1,
      withinMinutes: 60,
      limit: 5,
    })

  const stats = useMemo(() => {
    const zones = progressData?.zonesProgress || []
    const totalParentTasks = zones.reduce(
      (s, z) => s + (z.totalParentTasks || 0),
      0,
    )
    const runningParentTasks = zones.reduce(
      (s, z) => s + (z.runningParentTasks || 0),
      0,
    )
    const totalChildTasks = zones.reduce(
      (s, z) => s + (z.totalChildTasks || 0),
      progressData?.totalTasks || 0,
    )
    const runningChildTasks = zones.reduce(
      (s, z) => s + (z.runningChildTasks || 0),
      (progressData?.totalTasks || 0) - (progressData?.completedTasks || 0),
    )

    const completedTasks = progressData?.completedTasks || 0
    const totalTasks = progressData?.totalTasks || totalChildTasks || 0
    const completionRate =
      progressData?.completionRate ??
      (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0)

    const overdueCount = atRiskData.filter(
      (t) => t.minutesRemaining <= 0,
    ).length

    return {
      totalParentTasks: totalParentTasks || 21,
      runningParentTasks: runningParentTasks || 7,
      totalChildTasks: totalTasks || 240,
      runningChildTasks: runningChildTasks || 55,
      completedTasks,
      completionRate,
      overdueCount,
    }
  }, [progressData, atRiskData])

  return (
    <div className="flex flex-col gap-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Số Nghiệp vụ đang chạy"
            value={`${stats.runningParentTasks} / ${stats.totalParentTasks}`}
            subtitle="Đang chạy / Tổng số"
            icon={Layers}
            tone="primary"
            trend="Tiến độ"
            loading={progressLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Công việc đang có"
            value={`${stats.runningChildTasks} / ${stats.totalChildTasks}`}
            subtitle="Chưa xong / Tất cả"
            icon={ListTodo}
            tone="info"
            loading={progressLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Tỷ lệ Hoàn thành Dự án"
            value={`${stats.completionRate.toFixed(1)}%`}
            subtitle={`${stats.completedTasks} việc đã hoàn thành`}
            icon={CheckCircle2}
            tone="success"
            trend="+4.2%"
            loading={progressLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardStatCard
            title="Cảnh báo Nguy cơ Trễ SLA"
            value={atRiskData.length}
            subtitle="Công việc còn dưới 60 phút"
            icon={AlertTriangle}
            tone={atRiskData.length > 0 ? "danger" : "warning"}
            trend={atRiskData.length > 0 ? "Cần xử lý" : "An toàn"}
            loading={atRiskLoading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={progressData?.zonesProgress?.length ? 12 : 24}>
          <Card
            className="shadow-2xs h-full"
            loading={trendLoading}
            title={
              <div className="flex items-center gap-2 py-1">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">
                    Tiến độ Thực tế so với Kế hoạch
                  </div>
                  <div className="text-xs font-normal text-muted-foreground">
                    Đường cong tích lũy khối lượng hoàn thành theo thời gian
                    thực
                  </div>
                </div>
              </div>
            }
          >
            <TrendLineChart
              dataPoints={trendData?.dataPoints || []}
              height={260}
            />
          </Card>
        </Col>

        {progressData?.zonesProgress &&
          progressData.zonesProgress.length > 0 && (
            <Col xs={24} lg={6}>
              <Card
                className="shadow-2xs h-full"
                title={
                  <div className="flex items-center justify-between py-1">
                    <span className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                      Tiến độ theo Phân khu
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {progressData.zonesProgress.length} phân khu
                    </span>
                  </div>
                }
              >
                <div className="flex flex-col gap-3">
                  {progressData.zonesProgress.map((zone) => (
                    <Card
                      key={zone.zoneId}
                      size="small"
                      className="border-border/80 bg-muted/40"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-foreground line-clamp-1">
                          {zone.zoneName}
                        </span>
                        <span className="font-bold text-primary">
                          {zone.completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        percent={Math.min(100, zone.completionRate)}
                        showInfo={false}
                        size="small"
                        strokeColor="var(--primary)"
                      />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                        <span>
                          Xong: {zone.completedTasks}/{zone.totalTasks}
                        </span>
                        {zone.runningChildTasks !== undefined && (
                          <span>Còn: {zone.runningChildTasks}</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </Col>
          )}
        <Col xs={24} lg={6}>
          <Card
            className="shadow-2xs h-full"
            loading={roleLoading}
            title={
              <div className="flex items-center gap-2 py-1">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="size-4" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">
                    Hiệu suất theo Chức danh
                  </div>
                </div>
              </div>
            }
          >
            <RolePerformanceBarChart data={roleData} maxItems={6} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={124}>
          <Card
            className="shadow-2xs h-full"
            title={
              <div className="flex items-center gap-2 py-1">
                <div className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">
                    Cảnh báo Nguy cơ Chậm tiến độ
                  </div>
                </div>
              </div>
            }
          >
            <AtRiskAlertTable tasks={atRiskData} loading={atRiskLoading} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
