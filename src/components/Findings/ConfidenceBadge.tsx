import { TipMeta, TipText, TipTitle, Tooltip } from "@/components/Common/Tooltip";
import type { ReasoningGroup } from "@/constants/enums";
import {
  CONFIDENCE_THRESHOLD,
  CHECK_TYPE_CONFIG,
} from "@/constants/domain";

export function ConfidenceBadge({
  value,
  group,
}: {
  value: number;
  group?: ReasoningGroup;
}) {
  const isLow = value < CONFIDENCE_THRESHOLD;
  const expected = group ? CHECK_TYPE_CONFIG[group]?.expectedConfidence : undefined;

  return (
    <Tooltip
      content={
        <>
          <TipTitle>Độ tin cậy của phép trích xuất</TipTitle>
          <TipText>
            {isLow
              ? `Dưới ngưỡng ${Math.round(CONFIDENCE_THRESHOLD * 100)}% — kết luận của máy cần người thẩm định xác nhận.`
              : `Trên ngưỡng ${Math.round(CONFIDENCE_THRESHOLD * 100)}% — kết luận của máy đủ tin cậy để dùng trực tiếp.`}
          </TipText>
          {expected && (
            <TipMeta>
              Kỳ vọng của nhóm {group}:{" "}
              <span className="font-mono text-foreground font-medium">{expected}</span>
            </TipMeta>
          )}
        </>
      }
    >
      <span
        className={`font-mono text-xs tabular-nums font-semibold ${
          isLow ? "text-amber-500" : "text-muted-foreground"
        }`}
      >
        {Math.round(value * 100)}%
      </span>
    </Tooltip>
  );
}
