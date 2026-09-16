"use client"

import { Card, Progress } from "antd"
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"
import type { MatrixRowItem } from "@/mocks/headcountReportMock"

interface HeadcountReportStatCardsProps {
  matrixRows: MatrixRowItem[]
}

export const HeadcountReportStatCards = ({
  matrixRows,
}: HeadcountReportStatCardsProps) => {
  // Tính toán tổng số tích luỹ qua các tháng
  let totalStandard = 0
  let totalActual = 0
  let totalSurplus = 0
  let totalShortage = 0

  for (const row of matrixRows) {
    if (row.isSubTotal) continue
    for (const m of row.months) {
      totalStandard += m.standardHeadcount
      totalActual += m.actualHeadcount
      totalSurplus += m.surplus
      totalShortage += m.shortage
    }
  }

  const fulfillmentRate =
    totalStandard > 0 ? Math.min(100, (totalActual / totalStandard) * 100) : 100

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Card 1: Tổng Định biên */}
      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden hover:border-primary/40 transition-all bg-card"
        styles={{ body: { padding: "14px 16px" } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Tổng Định biên (ĐB)
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <Users className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {totalStandard.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">người-tháng</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground truncate">
          Nhu cầu chuẩn theo tiến độ dự án
        </p>
      </Card>

      {/* Card 2: Tổng Thực tế */}
      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden hover:border-emerald-500/40 transition-all bg-card"
        styles={{ body: { padding: "14px 16px" } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Tổng Thực tế (TT)
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <UserCheck className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {totalActual.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">người-tháng</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground truncate">
          Theo phân bổ 1/N nhân sự thực tế
        </p>
      </Card>

      {/* Card 3: Thừa nhân sự */}
      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden hover:border-amber-500/40 transition-all bg-card"
        styles={{ body: { padding: "14px 16px" } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Dư thừa (+)
          </span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            +{totalSurplus.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">FTEs</span>
        </div>
        <p className="mt-1 text-[11px] text-amber-600/80 font-medium truncate">
          Căn cứ đề xuất Thuyên chuyển
        </p>
      </Card>

      {/* Card 4: Thiếu nhân sự */}
      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden hover:border-rose-500/40 transition-all bg-card"
        styles={{ body: { padding: "14px 16px" } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Thiếu hụt (-)
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
            <AlertTriangle className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            -{totalShortage.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">FTEs</span>
        </div>
        <p className="mt-1 text-[11px] text-rose-600/80 font-medium truncate">
          Căn cứ đề xuất Tuyển dụng
        </p>
      </Card>

      {/* Card 5: Tỷ lệ đáp ứng */}
      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden hover:border-primary/40 transition-all bg-card"
        styles={{ body: { padding: "14px 16px" } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Tỷ lệ Đáp ứng
          </span>
          <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {fulfillmentRate.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {fulfillmentRate >= 90 ? "Tốt" : "Cần bổ sung"}
          </span>
        </div>
        <div className="mt-2">
          <Progress
            percent={Number(fulfillmentRate.toFixed(1))}
            size="small"
            showInfo={false}
            strokeColor={
              fulfillmentRate >= 90
                ? "#10b981"
                : fulfillmentRate >= 80
                  ? "#3b82f6"
                  : "#f59e0b"
            }
          />
        </div>
      </Card>
    </div>
  )
}
