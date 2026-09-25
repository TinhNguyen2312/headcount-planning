import Link from "next/link";
import { Tooltip } from "antd";
import { ChevronRight } from "lucide-react";
import { STATUS_CONFIG } from "@/constants/domain";
import type { Finding } from "@/types";
import { ChtkCategoryTag } from "./ChtkCategoryTag";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ExtractedVsExpectedValue } from "./ExtractedVsExpectedValue";
import { FindingSeverityBadge } from "./FindingSeverityBadge";
import { FindingStatusBadge } from "./FindingStatusBadge";
import { PageReferenceLink } from "./PageReferenceLink";
import { ReasoningGroupTag } from "./ReasoningGroupTag";

export function FindingRow({
  finding,
  workspaceSlug = "palm-marina",
}: {
  finding: Finding;
  workspaceSlug?: string;
}) {
  const { label: statusLabel } = STATUS_CONFIG[finding.status];

  return (
    <Link
      href={`/drawing-checker/reviews/${finding.reviewId}`}
      aria-label={`${finding.ruleIndex} ${finding.detailLabel} — ${statusLabel}, mức độ ${finding.severity}, trang ${finding.pageNumber}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 px-3.5
                 transition-colors duration-150 hover:bg-muted/40 cursor-pointer"
    >
      <FindingSeverityBadge severity={finding.severity} />

      <Tooltip
        title={
          <div>
            <div className="font-semibold text-xs">Chỉ mục {finding.ruleIndex}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Vị trí của tiêu chí trong bộ tiêu chuẩn CHTK. Mở tab Tiêu chuẩn CHTK để xem toàn văn.
            </div>
          </div>
        }
      >
        <span className="numeric text-xs text-muted-foreground font-semibold">
          {finding.ruleIndex}
        </span>
      </Tooltip>

      <Tooltip
        title={
          <div>
            <div className="font-semibold text-xs">{finding.detailLabel}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Hạng mục chi tiết được đối chiếu trên bản vẽ.
            </div>
          </div>
        }
      >
        <span className="min-w-0 flex-1 basis-40 truncate text-xs font-medium text-foreground">
          {finding.detailLabel}
        </span>
      </Tooltip>

      <ExtractedVsExpectedValue
        extractedValue={finding.extractedValue}
        standardValue={finding.standardValue}
        status={finding.status}
      />

      <span className="ml-auto flex items-center gap-2.5">
        <ConfidenceBadge value={finding.confidence} group={finding.group} />
        <ReasoningGroupTag group={finding.group} />
        <ChtkCategoryTag category={finding.category} />
        <PageReferenceLink pageNumber={finding.pageNumber} />
        <FindingStatusBadge status={finding.status} />
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
      </span>
    </Link>
  );
}
