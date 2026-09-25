"use client";

import { useEffect, useState } from "react";
import { PROCESSING_STEPS } from "@/constants/review.constants";
import { reviewsService } from "@/services/reviewsService";
import type { ReviewCheckTypeBreakdown } from "@/types";

const TICK_MS = 180;
const PERCENT_PER_TICK = 5;

export type ReviewProcessingStatus = {
  percent: number;
  currentStepIndex: number;
  isDone: boolean;
  breakdown: readonly ReviewCheckTypeBreakdown[];
};

export function useReviewProcessingStatus(
  reviewId: string,
): ReviewProcessingStatus {
  const [percent, setPercent] = useState(0);
  const [breakdown, setBreakdown] = useState<readonly ReviewCheckTypeBreakdown[]>([]);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(() => {
      setPercent((prev) => {
        const next = Math.min(prev + PERCENT_PER_TICK, 100);
        if (next >= 100) {
          clearInterval(interval);
          reviewsService.getCheckTypeBreakdown(reviewId).then((rows) => {
            if (!cancelled) setBreakdown(rows);
          });
        }
        return next;
      });
    }, TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [reviewId]);

  const stepCount = PROCESSING_STEPS.length;
  const currentStepIndex = Math.min(
    Math.floor((percent / 100) * stepCount),
    stepCount - 1,
  );

  return {
    percent,
    currentStepIndex,
    isDone: percent >= 100 && breakdown.length > 0,
    breakdown,
  };
}
