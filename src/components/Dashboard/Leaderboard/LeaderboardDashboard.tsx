import { Col, Row, Segmented } from "antd"
import { CheckCircle2, ListOrdered, Trophy, Zap } from "lucide-react"
import React, { useMemo, useState } from "react"
import { reportQueries } from "@/hooks/server/reports"
import { HonorPodiumCards } from "./HonorPodiumCards"
import { LeaderboardTable } from "./LeaderboardTable"
import { QuadrantMatrixChart } from "./QuadrantMatrixChart"

interface LeaderboardDashboardProps {
  projectId?: number
  fromDate?: string
  toDate?: string
}

type SortByOption = "EFFICIENCY" | "SPEED" | "TOTAL_TASKS"

export const LeaderboardDashboard: React.FC<LeaderboardDashboardProps> = ({
  projectId,
  fromDate,
  toDate,
}) => {
  const [sortBy, setSortBy] = useState<SortByOption>("EFFICIENCY")

  // Query leaderboard data
  const { data: leaderboardData = [], isLoading: leaderboardLoading } =
    reportQueries.useLeaderboard({
      projectId,
      fromDate,
      toDate,
      sortBy,
    })

  // Extract Top 3 efficiency and speed
  const { topEfficiency, topSpeed } = useMemo(() => {
    const list = [...leaderboardData]
    const eff = [...list]
      .sort(
        (a, b) =>
          b.onTimeRate - a.onTimeRate || a.overdueTasks - b.overdueTasks,
      )
      .slice(0, 3)
    const spd = [...list]
      .sort((a, b) => b.totalEarlyHours - a.totalEarlyHours)
      .slice(0, 3)

    return { topEfficiency: eff, topSpeed: spd }
  }, [leaderboardData])

  return (
    <div className="flex flex-col gap-3">
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <HonorPodiumCards topEfficiency={topEfficiency} topSpeed={topSpeed} />
        </Col>
        <Col xs={24} lg={14}>
          <QuadrantMatrixChart users={leaderboardData} height={500} />
        </Col>
      </Row>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
              <ListOrdered className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Bảng Xếp Hạng & Đánh Giá Chi Tiết
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground font-medium">
              Sắp xếp theo:
            </span>
            <Segmented<SortByOption>
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              options={[
                {
                  label: "Hiệu quả (% Đúng hạn)",
                  value: "EFFICIENCY",
                  icon: (
                    <CheckCircle2 className="size-3.5 inline mr-1 text-primary" />
                  ),
                },
                {
                  label: "Tốc độ (Sớm hạn)",
                  value: "SPEED",
                  icon: <Zap className="size-3.5 inline mr-1 text-blue-500" />,
                },
                {
                  label: "Khối lượng việc",
                  value: "TOTAL_TASKS",
                  icon: (
                    <Trophy className="size-3.5 inline mr-1 text-amber-500" />
                  ),
                },
              ]}
              className="bg-muted p-1 text-xs"
            />
          </div>
        </div>

        <LeaderboardTable
          users={leaderboardData}
          loading={leaderboardLoading}
        />
      </div>
    </div>
  )
}

export default LeaderboardDashboard
