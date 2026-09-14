import { Tag } from "antd"
import { getInitials } from "@/lib/utils"

export interface AvatarNameCellProps {
  name: string
  subtitle?: string
  isSelf?: boolean
}

// Avatar initials + name + optional subtitle, for the first column of people/asset tables
export function AvatarNameCell({
  name,
  subtitle,
  isSelf,
}: AvatarNameCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
        {getInitials(name)}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <span className="truncate" title={name}>
            {name}
          </span>
          {isSelf && (
            <Tag color="blue" className="m-0 text-[10px]">
              Bạn
            </Tag>
          )}
        </div>
        {subtitle && (
          <div
            className="truncate text-base text-muted-foreground"
            title={subtitle}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}

// Monospace code badge for employee/project codes, e.g. NV-0012
export function CodeBadge({ code }: { code: string }) {
  return (
    <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-base font-medium text-foreground">
      {code}
    </span>
  )
}
