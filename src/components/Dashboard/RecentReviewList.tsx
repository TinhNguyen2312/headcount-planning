import { EmptyState } from "@/components/Common/EmptyState";
import { ReviewListItem } from "@/components/Reviews/ReviewListItem";
import type { Review } from "@/types";
import { SectionCard } from "./SectionCard";

export function RecentReviewList({
  reviews,
  workspaceSlug = "palm-marina",
}: {
  reviews: readonly Review[];
  workspaceSlug?: string;
}) {
  return (
    <SectionCard
      title="Hồ sơ thẩm định gần đây"
      subtitle="Tiến độ xử lý AI và kết quả đối chiếu tiêu chuẩn CHTK của từng bộ hồ sơ"
      seeAllHref="/drawing-checker/reviews"
      bodyClassName="divide-y divide-border/60 p-0"
    >
      {reviews.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <EmptyState message="Chưa có hồ sơ thẩm định nào." />
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewListItem review={review} workspaceSlug={workspaceSlug} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
