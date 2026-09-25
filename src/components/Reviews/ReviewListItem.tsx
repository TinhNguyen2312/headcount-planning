import Link from "next/link";
import { Tooltip } from "antd";
import { AlertTriangle, Check, Loader2, FileText } from "lucide-react";
import { StatusStackedBar, totalOf } from "@/components/Common/StatusStackedBar";
import {
  ACTION_REQUIRED_STATUSES,
  HOUSE_TYPE_CONFIG,
  PASSED_STATUSES,
} from "@/constants/domain";
import type { Review } from "@/types";

function passRateTone(percent: number): string {
  if (percent < 50) return "text-red-500 font-semibold";
  if (percent < 80) return "text-amber-500 font-semibold";
  return "text-emerald-500 font-semibold";
}

const PROCESSING_CONFIG = {
  running: {
    label: "Đang xử lý",
    Icon: Loader2,
    className: "text-primary animate-spin",
  },
  failed: {
    label: "Lỗi xử lý",
    Icon: AlertTriangle,
    className: "text-red-500",
  },
  idle: { label: "Hoàn tất", Icon: Check, className: "text-emerald-500" },
} as const;

export function ReviewListItem({
  review,
  workspaceSlug = "palm-marina",
}: {
  review: Review;
  workspaceSlug?: string;
}) {
  const isRunning = review.processingState === "running";
  const isFailed = review.processingState === "failed";
  const isDone = !isRunning && !isFailed;

  const state = isRunning ? "running" : isFailed ? "failed" : "idle";
  const { label: stateLabel, Icon: StateIcon, className: stateClass } =
    PROCESSING_CONFIG[state];

  const total = totalOf(review.statusCounts);
  const concluded = total - review.statusCounts.unknown;
  const passed = PASSED_STATUSES.reduce(
    (sum, s) => sum + review.statusCounts[s],
    0,
  );
  const passRate = concluded > 0 ? Math.round((passed / concluded) * 100) : 0;
  const actionRequired = ACTION_REQUIRED_STATUSES.reduce(
    (sum, s) => sum + review.statusCounts[s],
    0,
  );

  return (
    <Link
      href={`/drawing-checker/reviews/${review.id}`}
      className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3
                 transition-colors duration-150 hover:bg-muted/40 cursor-pointer"
    >
      <Tooltip
        title={
          <div>
            <div className="font-semibold text-xs">{stateLabel}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {isRunning
                ? `AI đã phân tích ${review.progressPercent ?? 0}% số trang.`
                : isFailed
                  ? "Không đọc được file PDF. Cần tải lại hồ sơ."
                  : "Đã đối chiếu xong toàn bộ tiêu chí."}
            </div>
          </div>
        }
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded bg-muted/40">
          <StateIcon className={`size-3.5 ${stateClass}`} />
        </span>
      </Tooltip>

      <div className="min-w-0 flex-1 basis-52">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="numeric shrink-0 text-xs font-semibold text-foreground">
            {review.code}
          </span>
          <span className="min-w-0 truncate text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {review.name}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground/80">
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3 shrink-0" />
            <span className="numeric">{review.pageCount}</span> trang
          </span>
          <span>·</span>
          <span>{review.zoneName}</span>
          <span>·</span>
          <span>{HOUSE_TYPE_CONFIG[review.houseType].label}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
        {isDone ? (
          <StatusStackedBar counts={review.statusCounts} height="h-1.5" />
        ) : (
          <span
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60"
            role="img"
            aria-label={
              isRunning
                ? `AI đang phân tích, ${review.progressPercent ?? 0}%`
                : "Lỗi xử lý"
            }
          >
            <span
              className={`block h-full rounded-full transition-all duration-300 ${
                isFailed ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: isFailed ? "100%" : `${review.progressPercent ?? 0}%` }}
            />
          </span>
        )}

        <div className="text-[11px]">
          {isDone ? (
            actionRequired > 0 ? (
              <span className="text-red-500 font-medium">
                <span className="numeric font-semibold">{actionRequired}</span> cần xử lý
              </span>
            ) : (
              <span className="text-muted-foreground/80">Không còn mục cần xử lý</span>
            )
          ) : isFailed ? (
            <span className="text-red-500 font-medium">Lỗi xử lý</span>
          ) : (
            <span className="text-muted-foreground">
              AI đang phân tích ·{" "}
              <span className="numeric">{review.progressPercent ?? 0}%</span>
            </span>
          )}
        </div>
      </div>

      <div className="w-12 shrink-0 text-right">
        {isDone ? (
          <span className={`numeric text-xs ${passRateTone(passRate)}`}>
            {passRate}%
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">——</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="numeric whitespace-nowrap text-[11px] text-muted-foreground">
          {review.updatedAt}
        </span>
        <Tooltip title={`Phụ trách: ${review.assignee.name}`}>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-mono font-medium text-foreground select-none">
            {review.assignee.initials}
          </div>
        </Tooltip>
      </div>
    </Link>
  );
}
