"use client";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { ReviewUploadForm } from "@/components/Reviews/ReviewUploadForm";
import { MOCK_ZONE_OPTIONS } from "@/mocks/zoneOptions.mock";
import { MOCK_STANDARD_SETS } from "@/mocks/standardSets.mock";

export function NewReviewPage() {
  const workspaceSlug = useWorkspaceStore((state) => state.currentWorkspace);

  return (
    <ManagementPageLayout
      title="Tải lên hồ sơ thẩm định mới"
      subtitle="Tải lên bản vẽ PDF và chọn tiêu chuẩn CHTK để AI tự động đối chiếu."
      showBack
    >
      <ReviewUploadForm
        workspaceSlug={workspaceSlug}
        zoneOptions={MOCK_ZONE_OPTIONS}
        standardSets={MOCK_STANDARD_SETS}
      />
    </ManagementPageLayout>
  );
}

export default NewReviewPage;

