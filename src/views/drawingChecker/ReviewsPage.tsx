"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { EmptyState } from "@/components/Common/EmptyState";
import { ReviewListItem } from "@/components/Reviews/ReviewListItem";
import { MOCK_REVIEWS } from "@/mocks/reviews.mock";

export function ReviewsPage() {
  const workspaceSlug = useWorkspaceStore((state) => state.currentWorkspace);
  const [search, setSearch] = useState("");

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return MOCK_REVIEWS;
    const term = search.toLowerCase();
    return MOCK_REVIEWS.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        r.zoneName.toLowerCase().includes(term),
    );
  }, [search]);

  return (
    <ManagementPageLayout
      title="Hồ sơ thẩm định"
      subtitle="Toàn bộ bộ bản vẽ đã tải lên để đối chiếu với tiêu chuẩn CHTK."
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Tìm theo mã hồ sơ, tên công trình, phân khu..."
      actions={
        <Link
          href="/drawing-checker/reviews/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
        >
          <Plus className="size-3.5" />
          Thẩm định mới
        </Link>
      }
    >
      {filteredReviews.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState message="Không tìm thấy hồ sơ thẩm định nào." />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border/60">
            {filteredReviews.map((review) => (
              <li key={review.id}>
                <ReviewListItem review={review} workspaceSlug={workspaceSlug} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </ManagementPageLayout>
  );
}

export default ReviewsPage;
