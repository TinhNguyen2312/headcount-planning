import { Tooltip } from "antd";
import { CATEGORY_CONFIG } from "@/constants/domain";
import type { GroupPassRate } from "@/types";

export function GroupPassRateChart({ rows }: { rows: readonly GroupPassRate[] }) {
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => {
        const { label, short, dot } = CATEGORY_CONFIG[row.category];
        const hasData = row.concluded > 0;

        return (
          <li key={row.category}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-2">
                <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
                <span className="truncate text-xs font-medium text-foreground">{label}</span>
              </span>

              <span className="flex shrink-0 items-baseline gap-2">
                <span className="numeric text-xs font-semibold text-foreground">
                  {hasData ? `${row.percent}%` : "——"}
                </span>
                <span className="numeric text-[11px] text-muted-foreground">
                  {row.passed}/{row.concluded}
                </span>

                {row.missing > 0 && (
                  <Tooltip
                    placement="topRight"
                    title={
                      <div>
                        <div className="font-semibold">Thiếu dữ liệu — {short}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.missing} tiêu chí không tìm thấy thông tin trên bản vẽ nên không đưa vào mẫu số.
                        </div>
                      </div>
                    }
                  >
                    <span className="inline-flex items-center gap-0.5 rounded bg-muted/60 px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                      ?<span className="numeric">{row.missing}</span>
                    </span>
                  </Tooltip>
                )}
              </span>
            </div>

            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                style={{ width: `${hasData ? row.percent : 0}%` }}
                role="img"
                aria-label={`${label}: đạt ${row.passed} trên ${row.concluded} tiêu chí`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
