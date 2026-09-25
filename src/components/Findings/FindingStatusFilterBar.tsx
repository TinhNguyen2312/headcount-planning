import type { FindingStatus } from "@/constants/enums";
import { STATUS_CONFIG, STATUS_ORDER } from "@/constants/domain";

export type StatusFilter = FindingStatus | "all";

export function FindingStatusFilterBar({
  counts,
  total,
  active,
  onChange,
}: {
  counts: Record<FindingStatus, number>;
  total: number;
  active: StatusFilter;
  onChange: (next: StatusFilter) => void;
}) {
  const chip =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium " +
    "transition-colors duration-150 cursor-pointer border " +
    "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground " +
    "data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary";

  return (
    <div
      role="tablist"
      aria-label="Lọc theo trạng thái tiêu chí"
      className="flex flex-wrap items-center gap-1.5"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "all"}
        data-active={active === "all"}
        onClick={() => onChange("all")}
        className={chip}
      >
        Tất cả
        <span className="font-mono text-xs opacity-75">{total}</span>
      </button>

      {STATUS_ORDER.map((status) => {
        const { label, Icon, bar } = STATUS_CONFIG[status];
        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={active === status}
            data-active={active === status}
            onClick={() => onChange(status)}
            className={chip}
          >
            <span className={`size-1.5 shrink-0 rounded-full ${bar}`} aria-hidden />
            <Icon className="size-3.5 shrink-0" />
            {label}
            <span className="font-mono text-xs opacity-75">{counts[status]}</span>
          </button>
        );
      })}
    </div>
  );
}
