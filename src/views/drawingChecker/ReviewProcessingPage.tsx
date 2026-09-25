"use client";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { ProcessingProgress } from "@/components/Reviews/ProcessingProgress";

export function ReviewProcessingPage({ reviewId }: { reviewId: string }) {
  const workspaceSlug = useWorkspaceStore((state) => state.currentWorkspace);

  return (
    <ManagementPageLayout
      title="Tiến trình thẩm định AI"
      subtitle="Hệ thống đang quét từng trang bản vẽ và phân tích tiêu chuẩn CHTK."
      showBack
    >
      <ProcessingProgress reviewId={reviewId} workspaceSlug={workspaceSlug} />
    </ManagementPageLayout>
  );
}

export default ReviewProcessingPage;

