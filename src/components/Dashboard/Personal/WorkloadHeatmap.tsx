import { Card, Tag, Tooltip } from "antd"
import { Calendar, Clock, Flame } from "lucide-react"
import React, { useMemo } from "react"
import type { UserWorkloadHeatmapItem } from "@/types"

interface WorkloadHeatmapProps {
  data: UserWorkloadHeatmapItem[]
  monthLabel?: string
  loading?: boolean
}

export const WorkloadHeatmap: React.FC<WorkloadHeatmapProps> = ({
  data,
  monthLabel = "Tháng 09/2026",
  loading = false,
}) => {
  const days = useMemo(() => {
    return data && data.length > 0 ? data : []
  }, [data])

  const getCellColor = (item: UserWorkloadHeatmapItem) => {
    if (item.totalAssigned === 0) {
      return "bg-muted/60 text-muted-foreground border-border/40"
    }
    if (item.overdueTasks > 0) {
      return "bg-destructive/15 border-destructive/40 text-destructive font-bold"
    }
    if (item.totalAssigned >= 7) {
      return "bg-primary text-primary-foreground font-bold border-primary"
    }
    if (item.totalAssigned >= 4) {
      return "bg-primary/60 text-primary-foreground font-bold border-primary/50"
    }
    return "bg-primary/20 text-foreground border-primary/30 font-semibold"
  }

  return (
    <Card
      className="shadow-2xs rounded-2xl"
      loading={loading}
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-foreground">
                Ma trận Phân bổ Khối lượng Hàng ngày
              </span>
              <p className="text-xs text-muted-foreground font-normal">
                {monthLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Tag color="default" className="mr-0">
              0 việc
            </Tag>
            <Tag color="processing" className="mr-0">
              1 - 3 việc
            </Tag>
            <Tag color="cyan" className="mr-0">
              4 - 6 việc
            </Tag>
            <Tag color="success" className="mr-0">
              7+ việc
            </Tag>
            <Tag color="error" className="mr-0">
              Trễ hạn
            </Tag>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-15">
        {days.map((item) => {
          const dayNum = item.date.slice(8)

          const tooltipContent = (
            <div className="flex flex-col gap-1 p-1 text-xs">
              <span className="font-bold border-b border-border/40 pb-1">
                Ngày {dayNum} ({item.date})
              </span>
              <span>
                Tổng giao: <strong>{item.totalAssigned} việc</strong>
              </span>
              <span>
                Hoàn thành: <strong>{item.completedTasks}</strong>
              </span>
              {item.overdueTasks > 0 ? (
                <span className="text-destructive font-bold flex items-center gap-1">
                  <Flame size={12} /> {item.overdueTasks} việc quá hạn
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Clock size={12} /> Đúng hạn
                </span>
              )}
            </div>
          )

          return (
            <Tooltip key={item.date} title={tooltipContent} arrow={false}>
              <div
                className={`relative flex h-13 flex-col items-center justify-between rounded-xl border p-1.5 text-xs transition-colors cursor-pointer select-none ${getCellColor(
                  item,
                )}`}
              >
                <span className="text-[10px] opacity-75">{dayNum}</span>
                <span className="text-xs font-black">
                  {item.totalAssigned || "-"}
                </span>
                {item.overdueTasks > 0 && (
                  <span className="absolute top-1 right-1 size-1.5 rounded-full bg-destructive" />
                )}
              </div>
            </Tooltip>
          )
        })}
      </div>
    </Card>
  )
}

export default WorkloadHeatmap
