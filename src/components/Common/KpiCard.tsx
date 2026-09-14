import type { LucideIcon } from "lucide-react"

export interface KpiItem {
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  icon: LucideIcon
  tone?: "primary" | "destructive" | "muted"
}

const TONE_CLASSES: Record<NonNullable<KpiItem["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
}

export function KpiCard({ item }: { item: KpiItem }) {
  const Icon = item.icon
  const toneClass = TONE_CLASSES[item.tone ?? "primary"]

  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-medium text-muted-foreground">
            {item.title}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {item.value}
          </p>
        </div>
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${toneClass}`}
        >
          <Icon className="size-5" />
        </div>
      </div>
      {item.trend && (
        <p className="mt-3 text-base font-semibold text-primary">
          {item.trend}
        </p>
      )}
      {item.subtitle && (
        <p className="mt-3 text-base text-muted-foreground">{item.subtitle}</p>
      )}
    </div>
  )
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.title} item={item} />
      ))}
    </div>
  )
}

export default KpiGrid
