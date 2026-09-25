import { TipText, TipTitle, Tooltip } from "@/components/Common/Tooltip";
import type { FindingStatus } from "@/constants/enums";

export function ExtractedVsExpectedValue({
  extractedValue,
  standardValue,
  status,
}: {
  extractedValue: string;
  standardValue: string;
  status: FindingStatus;
}) {
  const extractedTone =
    status === "fail"
      ? "text-red-500 font-semibold"
      : status === "warning"
        ? "text-amber-500 font-semibold"
        : status === "unknown"
          ? "text-muted-foreground italic"
          : "text-foreground font-medium";

  return (
    <Tooltip
      className="min-w-0 max-w-full"
      content={
        <>
          <TipTitle>Vi phạm — Tiêu chuẩn</TipTitle>
          <TipText>
            Trước dấu gạch chéo là giá trị máy trích xuất từ bản vẽ; sau dấu gạch
            chéo là tiêu chuẩn CHTK áp dụng cho tiêu chí này.
          </TipText>
          <TipText>
            <span className={extractedTone}>{extractedValue}</span>
            <span className="text-muted-foreground"> / {standardValue}</span>
          </TipText>
        </>
      }
    >
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs">
        <span className={`min-w-0 break-words ${extractedTone}`}>{extractedValue}</span>
        <span className="text-muted-foreground/60" aria-hidden>
          /
        </span>
        <span className="min-w-0 break-words text-muted-foreground">{standardValue}</span>
      </span>
    </Tooltip>
  );
}
