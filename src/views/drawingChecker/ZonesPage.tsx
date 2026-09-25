"use client";

import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { ZoneIcon, PlusIcon } from "@/components/Common/icons";
import { MOCK_ZONE_OPTIONS } from "@/mocks/zoneOptions.mock";
import { MOCK_REVIEWS } from "@/mocks/reviews.mock";

export function ZonesPage() {
  return (
    <ManagementPageLayout
      title="Phân khu quy hoạch"
      subtitle="Quản lý danh mục phân khu đô thị và các dự án thiết kế kiến trúc đang thẩm định."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Tổng cộng: <span className="font-mono font-medium text-foreground">{MOCK_ZONE_OPTIONS.length}</span> phân khu
          </p>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-opacity"
          >
            <PlusIcon className="size-3.5" />
            Thêm phân khu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MOCK_ZONE_OPTIONS.map((zone) => {
            const reviewCount = MOCK_REVIEWS.filter((r) => r.zoneName === zone.name).length;
            return (
              <div
                key={zone.id}
                className="group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-border hover:bg-card/90"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground group-hover:text-foreground transition-colors">
                        <ZoneIcon className="size-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground tracking-tight">
                        {zone.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
                      Hoạt động
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Mã phân khu</span>
                      <span className="font-mono text-[11px] text-foreground font-medium">{zone.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Hồ sơ liên kết</span>
                      <span className="font-mono text-[11px] text-foreground font-medium">{reviewCount} bộ hồ sơ</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ManagementPageLayout>
  );
}

export default ZonesPage;


