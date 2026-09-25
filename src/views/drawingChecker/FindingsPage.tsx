"use client";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { FindingList } from "@/components/Findings/FindingList";
import { MOCK_DOSSIERS, MOCK_FINDINGS } from "@/mocks/findings.mock";

export function FindingsPage() {
  const workspaceSlug = useWorkspaceStore((state) => state.currentWorkspace);

  return (
    <ManagementPageLayout
      title="Kết quả tiêu chí"
      subtitle="Toàn bộ tiêu chí CHTK được đối chiếu, gom theo hồ sơ thẩm định rồi theo trạng thái. Chọn một tiêu chí để mở hồ sơ kèm vùng khoanh trên bản vẽ."
    >
      <FindingList
        dossiers={MOCK_DOSSIERS}
        findings={MOCK_FINDINGS}
        workspaceSlug={workspaceSlug}
      />
    </ManagementPageLayout>
  );
}

export default FindingsPage;

