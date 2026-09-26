import { Tag } from "antd"
import { Compass } from "lucide-react"
import React, { useMemo } from "react"
import {
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { LeaderboardUserResponse } from "@/types"

interface QuadrantMatrixChartProps {
  users: LeaderboardUserResponse[]
  height?: number
}

const getInitials = (name?: string) => {
  if (!name) return "KS"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const getQuadrantInfo = (
  user: LeaderboardUserResponse,
  midTasks: number,
  midRate: number,
) => {
  const isHighRate = user.onTimeRate >= midRate
  const isHighVolume = user.totalTasks >= midTasks

  if (isHighRate && isHighVolume) {
    return {
      label: "Ngôi sao",
      tagColor: "success" as const,
      color: "#10b981",
    }
  }
  if (isHighRate && !isHighVolume) {
    return {
      label: "Tiềm năng",
      tagColor: "processing" as const,
      color: "#3b82f6",
    }
  }
  if (!isHighRate && isHighVolume) {
    return {
      label: "Quá tải",
      tagColor: "warning" as const,
      color: "#f59e0b",
    }
  }
  return {
    label: "Cần cải thiện",
    tagColor: "error" as const,
    color: "#ef4444",
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomScatterTooltip = ({ active, payload, midTasks, midRate }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]?.payload as LeaderboardUserResponse
  if (!data) return null

  const quadrant = getQuadrantInfo(data, midTasks, midRate)

  return (
    <div className="pointer-events-none select-none flex flex-col gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-xs min-w-[220px]">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-xs">
            {getInitials(data.userName)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">
              {data.userName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {data.roleName || "Kỹ sư"}
            </span>
          </div>
        </div>
        <Tag color={quadrant.tagColor} className="mr-0">
          {quadrant.label}
        </Tag>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">
            Tổng công việc
          </span>
          <span className="font-bold text-foreground text-xs">
            {data.totalTasks} việc
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">
            Hoàn thành đúng hạn
          </span>
          <span className="font-bold text-foreground">
            {data.onTimeTasks} việc
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">
            Tỷ lệ đúng hạn
          </span>
          <span className="font-black text-primary text-xs">
            {data.onTimeRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">
            Hoàn thành sớm deadline
          </span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {data.totalEarlyHours.toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  )
}

export const QuadrantMatrixChart: React.FC<QuadrantMatrixChartProps> = ({
  users,
  height = 380,
}) => {
  // Calculate thresholds and domains
  const { minTasks, maxTasks, minRate, midTasks, midRate } = useMemo(() => {
    if (users.length === 0) {
      return {
        minTasks: 0,
        maxTasks: 50,
        minRate: 50,
        midTasks: 25,
        midRate: 90,
      }
    }
    const tasks = users.map((u) => u.totalTasks)
    const rates = users.map((u) => u.onTimeRate)
    const minT = Math.max(0, Math.floor(Math.min(...tasks) * 0.8))
    const maxT = Math.ceil(Math.max(...tasks) * 1.15) || 50
    const minR = Math.max(40, Math.floor(Math.min(...rates) * 0.9))

    return {
      minTasks: minT,
      maxTasks: maxT,
      minRate: minR,
      midTasks: Math.round((minT + maxT) / 2),
      midRate: 90, // SLA 90% benchmark
    }
  }, [users])

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
            <Compass className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Biểu đồ Năng lực & Khối lượng
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Tag
            color="success"
            className="mr-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            Ngôi sao
          </Tag>
          <Tag
            color="processing"
            className="mr-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            Tiềm năng
          </Tag>
          <Tag
            color="warning"
            className="mr-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            Quá tải
          </Tag>
          <Tag
            color="error"
            className="mr-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            Cần cải thiện
          </Tag>
        </div>
      </div>

      <div className="w-full min-h-[380px] rounded-xl border border-border/70 bg-background/50 pt-4 pb-2 pr-4">
        <ResponsiveContainer width="100%" height={height} debounce={50}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.3}
              stroke="var(--border)"
            />

            <ReferenceArea
              x1={midTasks}
              x2={maxTasks}
              y1={midRate}
              y2={100}
              fill="#10b981"
              fillOpacity={0.1}
            />
            <ReferenceArea
              x1={minTasks}
              x2={midTasks}
              y1={midRate}
              y2={100}
              fill="#3b82f6"
              fillOpacity={0.1}
            />
            <ReferenceArea
              x1={midTasks}
              x2={maxTasks}
              y1={minRate}
              y2={midRate}
              fill="#f59e0b"
              fillOpacity={0.1}
            />
            <ReferenceArea
              x1={minTasks}
              x2={midTasks}
              y1={minRate}
              y2={midRate}
              fill="#ef4444"
              fillOpacity={0.1}
            />

            <ReferenceLine
              x={midTasks}
              stroke="var(--border)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={midRate}
              stroke="#2db34b"
              strokeDasharray="3 3"
              strokeWidth={1.2}
              label={{
                value: "Chuẩn SLA 90%",
                fill: "#2db34b",
                fontSize: 10,
                fontWeight: 600,
                position: "insideTopRight",
              }}
            />

            <XAxis
              type="number"
              dataKey="totalTasks"
              name="Khối lượng công việc"
              unit=" việc"
              domain={[minTasks, maxTasks]}
              tick={{
                fontSize: 10,
                fill: "var(--color-muted-foreground, #64748b)",
              }}
              label={{
                value: "Tổng số công việc được giao",
                position: "insideBottom",
                offset: -12,
                fontSize: 12,
                fill: "var(--color-muted-foreground, #64748b)",
                fontWeight: 500,
              }}
            />
            <YAxis
              type="number"
              dataKey="onTimeRate"
              name="Tỷ lệ đúng hạn"
              unit="%"
              domain={[minRate, 100]}
              tick={{
                fontSize: 10,
                fill: "var(--color-muted-foreground, #64748b)",
              }}
              label={{
                value: "Tỷ lệ đúng hạn (%)",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: {
                  textAnchor: "middle",
                  fontSize: 11,
                  fill: "var(--color-muted-foreground, #64748b)",
                  fontWeight: 600,
                },
              }}
            />

            <Tooltip
              content={
                <CustomScatterTooltip midTasks={midTasks} midRate={midRate} />
              }
              cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none", zIndex: 100 }}
            />

            <Scatter name="Nhân sự" data={users} isAnimationActive={false}>
              {users.map((entry) => (
                <Cell
                  key={entry.userId}
                  fill={getQuadrantInfo(entry, midTasks, midRate).color}
                  stroke="var(--color-background, #ffffff)"
                  strokeWidth={2}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default QuadrantMatrixChart
