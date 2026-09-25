"use client";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { KpiCard } from "@/components/Dashboard/KpiCard";
import { SectionCard } from "@/components/Dashboard/SectionCard";
import { GroupPassRateChart } from "@/components/Dashboard/GroupPassRateChart";
import { CheckTypeBreakdownChart } from "@/components/Dashboard/CheckTypeBreakdownChart";
import { PriorityFindingList } from "@/components/Dashboard/PriorityFindingList";
import { RecentReviewList } from "@/components/Dashboard/RecentReviewList";
import {
  buildDashboardSummary,
  pickPriorityFindings,
} from "@/services/dashboardService";
import { MOCK_FINDINGS } from "@/mocks/findings.mock";
import { MOCK_REVIEWS } from "@/mocks/reviews.mock";
import { MOCK_RULES } from "@/mocks/rules.mock";

function passRateTone(percent: number): string {
  if (percent < 50) return "text-red-500";
  if (percent < 80) return "text-amber-500";
  return "text-emerald-500";
}

export function DashboardPage() {
  const workspaceSlug = useWorkspaceStore((state) => state.currentWorkspace);

  const summary = buildDashboardSummary({
    reviews: MOCK_REVIEWS,
    findings: MOCK_FINDINGS,
    rules: MOCK_RULES,
  });

  const priorityFindings = pickPriorityFindings({
    reviews: MOCK_REVIEWS,
    findings: MOCK_FINDINGS,
  });

  return (
    <ManagementPageLayout
      title="Bảng điều khiển"
      subtitle="Tổng quan chất lượng hồ sơ đang thẩm định và những mục cần người xử lý."
    >
      <div className="space-y-6">
        {/* Hàng 1 — 4 ô KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Việc cần xử lý"
            value={summary.actionRequired}
            valueTone="text-red-500"
            description="Gồm mục không đạt, cảnh báo và mục chưa thể kết luận."
            footnote="Cần kỹ sư thẩm định xác nhận."
          />

          <KpiCard
            label="Tỷ lệ đạt trung bình"
            value={summary.averagePassRate}
            unit="%"
            valueTone={passRateTone(summary.averagePassRate)}
            description={
              <>
                Tính trên <span className="font-mono font-semibold">{summary.passRateDenominator}</span> tiêu chí đủ dữ liệu để kết luận.
              </>
            }
            footnote={
              <>
                <span className="font-mono font-semibold">{summary.passRateNumerator}</span> tiêu chí đạt chuẩn CHTK.
              </>
            }
          />

          <KpiCard
            label="Tiêu chí đã kiểm tra"
            value={summary.testedCriteria}
            description={
              <>
                Tổng số tiêu chí đã quét trên{" "}
                <span className="font-mono font-semibold">{summary.completedReviewCount}</span> bộ hồ sơ bản vẽ.
              </>
            }
          />

          <KpiCard
            label="Bộ tiêu chuẩn CHTK"
            value={summary.standardLevel.replace("CHTK ", "")}
            description={
              <>
                <span className="font-mono font-semibold">{summary.activeRuleCount}</span>/
                <span className="font-mono font-semibold">{summary.totalRuleCount}</span> quy tắc đang áp dụng.
              </>
            }
            footnote="Cấp tiêu chuẩn: Biệt thự & Nhà ở thấp tầng"
          />
        </div>

        {/* Hàng 2 — Hai biểu đồ */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard
            title="Tỷ lệ đạt theo nhóm tiêu chí CHTK"
            subtitle="Mẫu số gồm các tiêu chí AI đã tìm thấy trên bản vẽ"
          >
            <GroupPassRateChart rows={summary.groupPassRates} />
          </SectionCard>

          <SectionCard
            title="Kết luận theo loại kiểm tra (A–D)"
            subtitle="Phân rã theo phương pháp đối chiếu và độ tin cậy kỳ vọng"
          >
            <CheckTypeBreakdownChart
              rows={summary.checkTypeBreakdowns}
              statusTotals={summary.statusTotals}
            />
          </SectionCard>
        </div>

        {/* Hàng 3 — Tiêu chí cần làm trước */}
        <PriorityFindingList
          findings={priorityFindings}
          workspaceSlug={workspaceSlug}
        />

        {/* Hàng 4 — Hồ sơ gần đây */}
        <RecentReviewList reviews={MOCK_REVIEWS} workspaceSlug={workspaceSlug} />
      </div>
    </ManagementPageLayout>
  );
}

export default DashboardPage;

