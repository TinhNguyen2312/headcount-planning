import { Empty, Progress, Tag } from "antd"
import React, { useMemo } from "react"
import type { RolePerformanceReportResponse } from "@/types"

interface RolePerformanceBarChartProps {
  data: RolePerformanceReportResponse[]
  maxItems?: number
}

export const RolePerformanceBarChart: React.FC<
  RolePerformanceBarChartProps
> = ({ data, maxItems = 8 }) => {
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalTasks - a.totalTasks)
      .slice(0, maxItems)
  }, [data, maxItems])

  if (sortedData.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Không có dữ liệu chức danh"
        className="my-8"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {sortedData.map((item) => {
        const rate = Math.min(100, Math.max(0, item.completionRate || 0))
        const isBottleneck = rate < 85 || item.overdueTasks > 2

        return (
          <div
            key={item.roleId || item.roleName}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="w-[60%] flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {item.roleName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>
                  Tổng:{" "}
                  <strong className="text-foreground">{item.totalTasks}</strong>
                </span>
                {item.overdueTasks > 0 && (
                  <Tag
                    color="error"
                    className="mr-0 text-[10px] leading-tight px-1.5 py-0 font-bold"
                  >
                    Trễ: {item.overdueTasks}
                  </Tag>
                )}
              </div>
            </div>

            <Progress
              percent={Number(rate.toFixed(1))}
              showInfo={false}
              size="small"
              strokeColor={isBottleneck ? "#faad14" : "var(--primary)"}
              className="m-0"
            />
          </div>
        )
      })}
    </div>
  )
}
