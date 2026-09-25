"use client";

import { useMemo } from "react";
import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { EmptyState } from "@/components/Common/EmptyState";
import { ReviewWorkspace } from "@/components/Reviews/ReviewWorkspace";
import { MOCK_REVIEWS } from "@/mocks/reviews.mock";
import { MOCK_FINDINGS } from "@/mocks/findings.mock";

export function ReviewDetailPage({ reviewId }: { reviewId: string }) {
  const review = useMemo(
    () => MOCK_REVIEWS.find((r) => r.id === reviewId) ?? MOCK_REVIEWS[0],
    [reviewId],
  );

  const findings = useMemo(
    () => MOCK_FINDINGS.filter((f) => f.reviewId === review?.id || f.reviewId === "rv-pn2-b12"),
    [review],
  );

  if (!review) {
    return (
      <ManagementPageLayout title="Hồ sơ thẩm định" showBack>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState message="Không tìm thấy hồ sơ thẩm định này." />
        </div>
      </ManagementPageLayout>
    );
  }

  return (
    <div className="h-[calc(100vh-3.25rem)] p-3 flex flex-col overflow-hidden">
      <ReviewWorkspace review={review} findings={findings} />
    </div>
  );
}

export default ReviewDetailPage;
