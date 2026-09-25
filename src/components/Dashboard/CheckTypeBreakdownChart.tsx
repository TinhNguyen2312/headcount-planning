import { Tooltip } from "antd";
import {
  StatusLegend,
  StatusStackedBar,
} from "@/components/Common/StatusStackedBar";
import { CHECK_TYPE_CONFIG } from "@/constants/domain";
import type { CheckTypeBreakdown, StatusCounts } from "@/types";

export function CheckTypeBreakdownChart({
  rows,
  statusTotals,
}: {
  rows: readonly CheckTypeBreakdown[];
  statusTotals: StatusCounts;
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3.5">
        {rows.map((row) => {
          const config = CHECK_TYPE_CONFIG[row.checkType];

          return (
            <li key={row.checkType}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Tooltip
                    title={
                      <div>
                        <div className="font-semibold">{config.title}</div>
                        <div className="text-xs text-muted-foreground">{config.method}</div>
                        <div className="text-xs font-mono text-primary mt-1">
                          Độ tin cậy kỳ vọng: {config.expectedConfidence}
                        </div>
                      </div>
                    }
                  >
                    <span
                      className={`inline-flex size-4.5 items-center justify-center rounded text-[11px] font-bold ${config.badge}`}
                    >
                      {row.checkType}
                    </span>
                  </Tooltip>
                  <span className="truncate text-xs font-medium text-foreground">
                    {config.label}
                  </span>
                </span>

                <span className="flex shrink-0 items-baseline gap-1.5 text-[11px] text-muted-foreground">
                  <span className="numeric">{row.total}</span> tiêu chí
                  <span aria-hidden>·</span>
                  <span className="numeric text-muted-foreground/70">{config.expectedConfidence}</span>
                </span>
              </div>

              <StatusStackedBar counts={row.counts} height="h-1.5" />
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border/70 pt-3">
        <StatusLegend counts={statusTotals} />
      </div>
    </div>
  );
}
