import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { ShortcutButton } from "@/keyboard"

export interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  leftSlot?: ReactNode
  onBack?: () => void
  rightSlot?: ReactNode
  extra?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  onBack,
  leftSlot,
  rightSlot,
  extra,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <ShortcutButton
            shortcutKeys="backspace"
            icon={<ArrowLeft className="size-4" />}
            onClick={onBack}
          >
            {"Quay lại"}
          </ShortcutButton>
        )}
        {leftSlot}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {typeof title === "string" ? (
              <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {rightSlot || extra ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {rightSlot}
          {extra}
        </div>
      ) : null}
    </div>
  )
}
