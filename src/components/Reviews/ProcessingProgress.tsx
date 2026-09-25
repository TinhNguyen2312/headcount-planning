"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Clock, Loader2, ArrowRight } from "lucide-react";
import { PROCESSING_STEPS } from "@/constants/review.constants";
import { useReviewProcessingStatus } from "@/hooks/useReviewProcessingStatus";
import { reviewsService } from "@/services/reviewsService";
import type { Review } from "@/types";
import { CheckTypeBreakdownBars } from "./CheckTypeBreakdownBars";

type StepState = "done" | "running" | "pending";

export function ProcessingProgress({
  reviewId,
  workspaceSlug,
}: {
  reviewId: string;
  workspaceSlug: string;
}) {
  const [review, setReview] = useState<Review | undefined>(undefined);
  const { percent, currentStepIndex, isDone, breakdown } =
    useReviewProcessingStatus(reviewId);

  useEffect(() => {
    let cancelled = false;
    reviewsService.getReview(reviewId).then((result) => {
      if (!cancelled) setReview(result);
    });
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <header className="space-y-0.5">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
          {review ? review.name : "Đang chuẩn bị hồ sơ..."}
        </h1>
        {review && (
          <p className="text-xs text-muted-foreground">
            Mã hồ sơ: <span className="numeric font-medium text-foreground">{review.code}</span> · Phân khu: {review.zoneName}
          </p>
        )}
      </header>

      <section className="rounded-lg border border-border bg-card p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isDone ? "Kết thúc quá trình phân tích" : "AI đang đọc và đối chiếu bản vẽ"}
          </h2>
          <span className="numeric text-xs font-semibold text-foreground">{percent}%</span>
        </div>

        {/* Flat Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDone ? "bg-primary" : "bg-primary"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="space-y-2.5 pt-1">
          {PROCESSING_STEPS.map((step, index) => {
            const state: StepState = isDone
              ? "done"
              : index < currentStepIndex
                ? "done"
                : index === currentStepIndex
                  ? "running"
                  : "pending";

            return (
              <li key={step.key} className="flex items-center gap-2.5 text-xs">
                {state === "done" && (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
                {state === "running" && (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
                )}
                {state === "pending" && (
                  <Clock className="size-3.5 shrink-0 text-muted-foreground/60" />
                )}
                <span
                  className={
                    state === "pending"
                      ? "text-muted-foreground"
                      : "text-foreground font-medium"
                  }
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {isDone && (
        <section className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Số phần tử đã phân tích theo loại kiểm tra
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Thống kê sơ bộ các tiêu chí CHTK trước khi vào xem chi tiết bản vẽ.
            </p>
          </div>
          <CheckTypeBreakdownBars rows={breakdown} />
        </section>
      )}

      {isDone && (
        <div className="flex justify-end pt-1">
          <Link
            href={`/drawing-checker/reviews/${reviewId}`}
            className="inline-flex h-8.5 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
          >
            <span>Xem kết quả thẩm định bản vẽ</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
