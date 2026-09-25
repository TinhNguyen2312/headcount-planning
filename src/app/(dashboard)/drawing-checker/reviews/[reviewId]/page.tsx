"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "antd";
import dynamic from "next/dynamic";

const ReviewDetailPage = dynamic(
  () => import("@/views/drawingChecker/ReviewDetailPage"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    ),
  }
);

export default function ReviewDetailPageDynamicRoute() {
  const params = useParams();
  const reviewId =
    typeof params?.reviewId === "string" ? params.reviewId : "rv-pn2-b12";

  return <ReviewDetailPage reviewId={reviewId} />;
}
