import { Card, Skeleton } from "antd"
import type { LucideIcon } from "lucide-react"
import type React from "react"

export type StatCardTone = "primary" | "info" | "warning" | "danger" | "success"

interface DashboardStatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  subtitle?: string
  tone?: StatCardTone
  onClick?: () => void
  loading?: boolean
  trend?: string
}

const TONE_CLASSES: Record<
  StatCardTone,
  {
    iconBg: string
    iconText: string
    borderHover: string
    badgeBg: string
  }
> = {
  primary: {
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    borderHover: "hover:border-primary/50",
    badgeBg: "bg-primary/15 text-primary",
  },
  info: {
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-500/50",
    badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  warning: {
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500/50",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  danger: {
    iconBg: "bg-destructive/10",
    iconText: "text-destructive",
    borderHover: "hover:border-destructive/50",
    badgeBg: "bg-destructive/15 text-destructive",
  },
  success: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/50",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  tone = "primary",
  onClick,
  loading = false,
  trend,
}) => {
  const toneStyle = TONE_CLASSES[tone]

  if (loading) {
    return (
      <Card className="rounded-xl border border-border bg-card shadow-2xs">
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-4 transition-all duration-200 shadow-2xs ${
        onClick
          ? `cursor-pointer ${toneStyle.borderHover} hover:shadow-sm active:scale-[0.99]`
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-foreground">
              {value}
            </span>
            {trend && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${toneStyle.badgeBg}`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="mt-1 text-base text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>

        <div
          className={`flex size-10 items-center justify-center rounded-lg ${toneStyle.iconBg} ${toneStyle.iconText}`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

export default DashboardStatCard
