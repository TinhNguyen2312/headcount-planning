"use client";

import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { MemberIcon, PlusIcon } from "@/components/Common/icons";

const MEMBERS = [
  { id: "u-1", name: "Nguyễn Văn A", email: "anguyen@example.com", role: "Chủ trì thẩm định", initials: "NA", activeReviews: 4 },
  { id: "u-2", name: "Trần Thị B", email: "btran@example.com", role: "Kỹ sư kiến trúc", initials: "TB", activeReviews: 2 },
  { id: "u-3", name: "Lê Hoàng C", email: "cle@example.com", role: "Chuyên viên kiểm duyệt", initials: "LC", activeReviews: 5 },
];

export function MembersPage() {
  return (
    <ManagementPageLayout
      title="Thành viên nhóm"
      subtitle="Danh sách các chuyên viên và kỹ sư tham gia thẩm định bản vẽ kiến trúc."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Tổng cộng: <span className="font-mono font-medium text-foreground">{MEMBERS.length}</span> chuyên viên
          </p>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-opacity"
          >
            <PlusIcon className="size-3.5" />
            Mời thành viên
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MEMBERS.map((member) => (
            <div
              key={member.id}
              className="group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-border hover:bg-card/90"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 font-mono text-xs font-semibold text-foreground">
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{member.email}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-border/50 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vai trò</span>
                    <span className="inline-flex items-center rounded-sm border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                      {member.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Hồ sơ đang xử lý</span>
                    <span className="font-mono text-[11px] text-foreground font-medium">{member.activeReviews} hồ sơ</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-end">
                <button
                  type="button"
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Phân công nhiệm vụ →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ManagementPageLayout>
  );
}

export default MembersPage;


