"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "antd";
import dynamic from "next/dynamic";

const ReviewProcessingPage = dynamic(
  () => import("@/views/drawingChecker/ReviewProcessingPage"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    ),
  }
);

export default function ReviewProcessingPageRoute() {
  const params = useParams();
  const reviewId =
    typeof params?.reviewId === "string" ? params.reviewId : "";

  return <ReviewProcessingPage reviewId={reviewId} />;
}
