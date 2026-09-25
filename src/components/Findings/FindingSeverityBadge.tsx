import { TipText, TipTitle, Tooltip } from "@/components/Common/Tooltip";
import type { FindingSeverity } from "@/constants/enums";
import { SEVERITY_CONFIG } from "@/constants/domain";

export function FindingSeverityBadge({ severity }: { severity: FindingSeverity }) {
  const { label, badge, bar, description } = SEVERITY_CONFIG[severity];

  return (
    <Tooltip
      content={
        <>
          <TipTitle>Mức độ — {label}</TipTitle>
          <TipText>{description}</TipText>
          <TipText>Thang tăng dần: Thấp · Trung bình · Cao · Nghiêm trọng.</TipText>
        </>
      }
    >
      <span
        className={`inline-flex items-center gap-1.5 rounded-sm py-0.5 pl-1.5 pr-2 text-xs font-semibold ${badge}`}
      >
        <span className={`h-3 w-0.5 shrink-0 rounded-full ${bar}`} aria-hidden />
        {label}
      </span>
    </Tooltip>
  );
}
