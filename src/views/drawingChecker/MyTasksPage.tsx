"use client";

import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { EmptyState } from "@/components/Common/EmptyState";
import { MyTaskIcon } from "@/components/Common/icons";

export function MyTasksPage() {
  return (
    <ManagementPageLayout
      title="Nhiệm vụ của tôi"
      subtitle="Danh sách các bộ hồ sơ và tiêu chí bạn được phân công kiểm tra, rà soát."
    >
      <div className="rounded-lg border border-border/80 bg-card py-16">
        <EmptyState
          icon={MyTaskIcon}
          title="Không có nhiệm vụ chờ xử lý"
          message="Bạn đã hoàn thành xong toàn bộ nhiệm vụ thẩm định được giao."
        />
      </div>
    </ManagementPageLayout>
  );
}

export default MyTasksPage;


