import { TipMeta, TipText, TipTitle, Tooltip } from "@/components/Common/Tooltip";
import type { ReasoningGroup } from "@/constants/enums";
import { CHECK_TYPE_CONFIG } from "@/constants/domain";

export function ReasoningGroupTag({ group }: { group: ReasoningGroup }) {
  const { title, method, expectedConfidence, dot } = CHECK_TYPE_CONFIG[group];

  return (
    <Tooltip
      content={
        <>
          <TipTitle>{title}</TipTitle>
          <TipText>{method}</TipText>
          <TipMeta>
            Độ tin cậy kỳ vọng:{" "}
            <span className="font-mono text-foreground font-medium">{expectedConfidence}</span>
          </TipMeta>
        </>
      }
    >
      <span
        aria-label={title}
        className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground"
      >
        <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
        {group}
      </span>
    </Tooltip>
  );
}
