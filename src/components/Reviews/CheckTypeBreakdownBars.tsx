import { CHECK_TYPE_CONFIG, CHECK_TYPE_ORDER } from "@/constants/domain";
import type { ReviewCheckTypeBreakdown } from "@/types";

export function CheckTypeBreakdownBars({
  rows,
}: {
  rows: readonly ReviewCheckTypeBreakdown[];
}) {
  const countByType = new Map(rows.map((row) => [row.checkType, row.count]));
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <ul className="space-y-3">
      {CHECK_TYPE_ORDER.map((checkType) => {
        const config = CHECK_TYPE_CONFIG[checkType];
        const count = countByType.get(checkType) ?? 0;

        return (
          <li key={checkType}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-sm text-xs font-medium ${config.badge}`}
                >
                  {checkType}
                </span>
                {config.label}
              </span>
              <span className="font-mono text-sm font-medium text-foreground">
                {count}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <span
                className={`block h-full rounded-full ${config.dot}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
