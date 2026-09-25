import { EmptyState } from "@/components/Common/EmptyState";
import { FindingRow } from "@/components/Findings/FindingRow";
import type { Finding } from "@/types";
import { SectionCard } from "./SectionCard";

export function PriorityFindingList({
  findings,
  workspaceSlug = "palm-marina",
}: {
  findings: readonly Finding[];
  workspaceSlug?: string;
}) {
  return (
    <SectionCard
      title="Tiêu chí cần xử lý ưu tiên"
      subtitle="Xếp theo mức nghiêm trọng và độ tin cậy để xử lý sai lệch cấp thiết"
      seeAllHref="/drawing-checker/findings"
      bodyClassName="divide-y divide-border/60 p-0"
    >
      {findings.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <EmptyState message="Không có tiêu chí nào ở mức Nghiêm trọng hoặc Cần xử lý." />
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {findings.map((finding) => (
            <li key={finding.id}>
              <FindingRow finding={finding} workspaceSlug={workspaceSlug} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
