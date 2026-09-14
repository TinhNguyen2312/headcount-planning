export type StatusDotTone = "active" | "warning" | "error" | "muted"

const DOT_CLASSES: Record<StatusDotTone, string> = {
  active: "bg-primary",
  warning: "bg-destructive/70",
  error: "bg-destructive",
  muted: "bg-muted-foreground",
}

export interface StatusDotBadgeProps {
  tone: StatusDotTone
  label: string
  pulse?: boolean
}

export function StatusDotBadge({ tone, label, pulse }: StatusDotBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      <span
        className={`size-2 rounded-full ${DOT_CLASSES[tone]} ${pulse ? "animate-pulse" : ""}`}
      />
      {label}
    </span>
  )
}

export default StatusDotBadge
