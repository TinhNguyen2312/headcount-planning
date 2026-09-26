import React, { useCallback, useId, useMemo, useState } from "react"
import type { ProgressTrendPoint } from "@/types"

interface TrendLineChartProps {
  dataPoints: ProgressTrendPoint[]
  height?: number
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  dataPoints,
  height = 280,
}) => {
  const gradientId = useId()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const points = useMemo(() => {
    return dataPoints && dataPoints.length > 0 ? dataPoints : []
  }, [dataPoints])

  const maxVal = useMemo(() => {
    if (points.length === 0) return 100
    const highest = Math.max(
      ...points.map((p) => Math.max(p.cumulativePlanned, p.cumulativeActual)),
    )
    return Math.ceil(highest * 1.15) || 100
  }, [points])

  const padding = { top: 20, right: 30, bottom: 40, left: 45 }
  const width = 650
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const getX = useCallback(
    (index: number) => {
      if (points.length <= 1) return padding.left + chartW / 2
      return padding.left + (index / (points.length - 1)) * chartW
    },
    [chartW, padding.left, points.length],
  )

  const getY = useCallback(
    (val: number) => {
      return padding.top + chartH - (val / maxVal) * chartH
    },
    [chartH, maxVal, padding.top],
  )

  // Generate SVG path for Planned and Actual
  const plannedPath = useMemo(() => {
    if (points.length === 0) return ""
    return points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.cumulativePlanned)}`,
      )
      .join(" ")
  }, [points, getX, getY])

  const actualPath = useMemo(() => {
    if (points.length === 0) return ""
    return points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.cumulativeActual)}`,
      )
      .join(" ")
  }, [points, getX, getY])

  const actualAreaPath = useMemo(() => {
    if (points.length === 0) return ""
    const line = points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.cumulativeActual)}`,
      )
      .join(" ")
    const lastX = getX(points.length - 1)
    const firstX = getX(0)
    const bottomY = padding.top + chartH
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
  }, [points, getX, padding.top, chartH, getY])

  // Horizontal Grid Lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(maxVal * ratio),
  )

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Không có dữ liệu tiến độ trong chu kỳ đã chọn
      </div>
    )
  }

  const activeIdx = hoveredIdx !== null ? hoveredIdx : points.length - 1
  const activePoint = points[activeIdx]

  return (
    <div className="flex flex-col gap-2">
      {/* Legend & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full border-b-2 border-dashed border-muted-foreground" />
            <span className="text-muted-foreground font-medium">Kế hoạch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full bg-primary" />
            <span className="text-foreground font-semibold">Thực tế</span>
          </div>
        </div>
        {activePoint && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-2.5 py-1 text-xs shadow-2xs">
            <span className="font-bold text-foreground">
              {activePoint.date}
            </span>
            <span className="text-muted-foreground">
              KH:{" "}
              <strong className="text-foreground">
                {activePoint.cumulativePlanned}
              </strong>
            </span>
            <span className="text-primary font-bold">
              TT: {activePoint.cumulativeActual}
            </span>
            <span className="rounded bg-primary/10 px-1 py-0.2 text-[10px] font-bold text-primary">
              {activePoint.completionRate ??
                Math.round(
                  (activePoint.cumulativeActual /
                    (activePoint.cumulativePlanned || 1)) *
                    100,
                )}
              %
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartW}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Area Fill for Actual */}
          <path d={actualAreaPath} fill={`url(#${gradientId})`} />

          {/* Planned Line (Dashed) */}
          <path
            d={plannedPath}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Actual Line (Solid Primary) */}
          <path
            d={actualPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive points & X Axis labels */}
          {points.map((p, i) => {
            const cx = getX(i)
            const cy = getY(p.cumulativeActual)
            const isHovered = hoveredIdx === i

            return (
              <g key={p.date} className="cursor-pointer">
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={padding.top + chartH}
                    stroke="var(--primary)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Actual data dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3.5}
                  className="fill-card stroke-primary"
                  strokeWidth={isHovered ? 3 : 2}
                />

                {/* X Axis Date Label */}
                <text
                  x={cx}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  className={`text-[10px] transition-colors ${
                    isHovered
                      ? "fill-primary font-bold"
                      : "fill-muted-foreground"
                  }`}
                >
                  {p.date}
                </text>

                {/* Transparent hit area for hover */}
                <rect
                  x={cx - chartW / points.length / 2}
                  y={padding.top}
                  width={chartW / points.length}
                  height={chartH + 20}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
