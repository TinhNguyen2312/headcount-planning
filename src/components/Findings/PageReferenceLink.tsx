import { PageIcon } from "@/components/Common/icons";
import { TipText, TipTitle, Tooltip } from "@/components/Common/Tooltip";

export function PageReferenceLink({
  pageNumber,
  withTooltip = true,
}: {
  pageNumber: number;
  withTooltip?: boolean;
}) {
  const label = (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground hover:text-foreground transition-colors">
      <PageIcon className="size-3.5 shrink-0" />
      <span className="font-mono">tr. {pageNumber}</span>
    </span>
  );

  if (!withTooltip) return label;

  return (
    <Tooltip
      align="right"
      content={
        <>
          <TipTitle>Trang {pageNumber} trong file PDF</TipTitle>
          <TipText>
            Vị trí máy phát hiện tiêu chí. Mở hồ sơ thẩm định để xem vùng khoanh
            trên đúng trang này.
          </TipText>
        </>
      }
    >
      {label}
    </Tooltip>
  );
}
