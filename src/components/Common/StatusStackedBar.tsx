import { STATUS_CONFIG, STATUS_ORDER } from "@/constants/domain";
import type { FindingStatus } from "@/constants/enums";
import type { StatusCounts } from "@/types";

export const EMPTY_STATUS_COUNTS: StatusCounts = {
  pass: 0,
  fail: 0,
  warning: 0,
  pending: 0,
  approved: 0,
  unknown: 0,
};

export function totalOf(counts: StatusCounts): number {
  return STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
}

export function StatusStackedBar({
  counts,
  className,
  height = "h-2",
}: {
  counts: StatusCounts;
  className?: string;
  height?: string;
}) {
  const total = totalOf(counts);
  const segments = STATUS_ORDER.filter((status) => counts[status] > 0);

  if (total === 0) {
    return (
      <div
        className={`${height} w-full rounded-full bg-muted ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`flex ${height} w-full gap-[2px] overflow-hidden rounded-full bg-muted ${className ?? ""}`}
      role="img"
      aria-label={segments
        .map((s) => `${STATUS_CONFIG[s].label}: ${counts[s]}`)
        .join(", ")}
    >
      {segments.map((status) => (
        <span
          key={status}
          className={`${STATUS_CONFIG[status].bar} first:rounded-l-full last:rounded-r-full`}
          style={{ width: `${(counts[status] / total) * 100}%` }}
          title={`${STATUS_CONFIG[status].label}: ${counts[status]}`}
        />
      ))}
    </div>
  );
}

export function StatusLegend({ counts }: { counts: StatusCounts }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {STATUS_ORDER.map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5 text-xs">
          <span
            className={`size-1.5 shrink-0 rounded-full ${STATUS_CONFIG[status].bar}`}
            aria-hidden
          />
          <span className="text-muted-foreground">{STATUS_CONFIG[status].label}</span>
          <span className="font-mono text-foreground">{counts[status]}</span>
        </li>
      ))}
    </ul>
  );
}
