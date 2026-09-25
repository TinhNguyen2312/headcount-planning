"use client";

import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { EmptyState } from "@/components/Common/EmptyState";
import { InboxIcon } from "@/components/Common/icons";

export function InboxPage() {
  return (
    <ManagementPageLayout
      title="Hộp thư thông báo"
      subtitle="Cập nhật các cảnh báo mới từ hệ thống AI và trao đổi từ các thành viên."
    >
      <div className="rounded-lg border border-border/80 bg-card py-16">
        <EmptyState
          icon={InboxIcon}
          title="Hộp thư trống"
          message="Không có thông báo mới nào chưa đọc từ hệ thống hoặc cộng sự."
        />
      </div>
    </ManagementPageLayout>
  );
}

export default InboxPage;


