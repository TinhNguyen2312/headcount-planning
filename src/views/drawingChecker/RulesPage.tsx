"use client";

import { ManagementPageLayout } from "@/layout/ManagementPageLayout";
import { RuleList } from "@/components/Rules/RuleList";
import { MOCK_RULES } from "@/mocks/rules.mock";

export function RulesPage() {
  return (
    <ManagementPageLayout
      title="Tiêu chuẩn CHTK"
      subtitle="Bộ quy tắc dùng để đối chiếu bản vẽ. Lọc theo nhóm CHTK, loại kiểm tra, loại nhà và phép so sánh; bật/tắt để quản lý áp dụng."
    >
      <RuleList rules={MOCK_RULES} />
    </ManagementPageLayout>
  );
}

export default RulesPage;

