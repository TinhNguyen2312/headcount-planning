"use client";

import { useMemo, useState } from "react";
import { message } from "antd";
import { Download } from "lucide-react";
import type { Finding, Review } from "@/types";
import { AlertTriangleIcon } from "@/components/Common/icons";
import { HOUSE_TYPE_CONFIG, STATUS_ORDER } from "@/constants/domain";
import { MOCK_PDF_URL } from "@/constants/review.constants";
import { exportAnnotatedPdf } from "@/services/annotatedPdfService";
import { DrawingPageViewer, type ViewerAnnotation } from "./DrawingPageViewer";
import { FindingResultPanel } from "./FindingResultPanel";
import { MarkedPageList, type MarkedPage } from "./MarkedPageList";

type FindingOverride = Partial<Pick<Finding, "status" | "note">>;

export function ReviewWorkspace({
  review,
  findings: initialFindings,
}: {
  review: Review;
  findings: readonly Finding[];
}) {
  const [overrides, setOverrides] = useState<Readonly<Record<string, FindingOverride>>>({});

  const findings = useMemo(
    () =>
      initialFindings.map((finding) =>
        overrides[finding.id] ? { ...finding, ...overrides[finding.id] } : finding,
      ),
    [initialFindings, overrides],
  );

  const [currentPage, setCurrentPage] = useState(() =>
    findings.length > 0 ? Math.min(...findings.map((f) => f.pageNumber)) : 1,
  );
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const markedPages: readonly MarkedPage[] = useMemo(() => {
    const byPage = new Map<number, Finding[]>();
    for (const finding of findings) {
      const list = byPage.get(finding.pageNumber) ?? [];
      list.push(finding);
      byPage.set(finding.pageNumber, list);
    }
    return Array.from(byPage.entries())
      .sort(([a], [b]) => a - b)
      .map(([pageNumber, items]) => ({
        pageNumber,
        count: items.length,
        statuses: STATUS_ORDER.filter((status) => items.some((f) => f.status === status)),
      }));
  }, [findings]);

  const pageAnnotations: readonly ViewerAnnotation[] = useMemo(
    () =>
      findings
        .filter((finding) => finding.pageNumber === currentPage)
        .map((finding) => ({
          id: finding.id,
          ruleIndex: finding.ruleIndex,
          label: `${finding.ruleIndex} ${finding.detailLabel}`,
          boundingBox: finding.boundingBox,
          status: finding.status,
        })),
    [findings, currentPage],
  );

  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId);
  const focusOnSelected = selectedFinding && selectedFinding.pageNumber === currentPage;
  const focusBoundingBox = focusOnSelected ? selectedFinding.boundingBox : undefined;
  const focusKey = focusOnSelected ? `finding:${selectedFinding.id}` : `page:${currentPage}`;

  const handleSelectFinding = (id: string) => {
    const finding = findings.find((f) => f.id === id);
    if (!finding) return;
    setSelectedFindingId(id);
    setCurrentPage(finding.pageNumber);
  };

  const handleSelectPage = (pageNumber: number) => {
    setSelectedFindingId(undefined);
    setCurrentPage(pageNumber);
  };

  const handlePageChange = (nextPage: number) => {
    setSelectedFindingId(undefined);
    setCurrentPage(Math.min(Math.max(nextPage, 1), Math.max(review.pageCount, 1)));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      await exportAnnotatedPdf({
        pdfUrl: MOCK_PDF_URL,
        findings,
        fileName: `${review.code}-danh-dau.pdf`,
      });
      message.success("Xuất PDF đánh dấu thành công!");
    } catch {
      setExportError("Không tạo được file PDF đánh dấu. Thử lại sau.");
      message.error("Lỗi xuất file PDF đánh dấu.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirm = (id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], status: "approved" } }));
    message.success("Đã xác nhận kết luận tiêu chí!");
  };

  const handleSaveNote = (id: string, note: string) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], note: note || undefined } }));
    message.success("Đã cập nhật ghi chú!");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="numeric text-xs font-semibold px-1.5 py-0.5 rounded border border-border bg-muted/40 text-foreground">
              {review.code}
            </span>
            <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {review.name}
            </h1>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Phân khu: <span className="font-medium text-foreground">{review.zoneName}</span> · Loại nhà:{" "}
            <span className="font-medium text-foreground">{HOUSE_TYPE_CONFIG[review.houseType].label}</span> · Tổng số trang:{" "}
            <span className="numeric font-medium text-foreground">{review.pageCount}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={findings.length === 0 || isExporting}
            onClick={handleExport}
            className="inline-flex h-7.5 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>{isExporting ? "Đang xuất..." : "Tải PDF đánh dấu"}</span>
          </button>
          {exportError && (
            <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
              <AlertTriangleIcon className="size-3.5 shrink-0" />
              {exportError}
            </p>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-2.5">
        <div className="w-28 shrink-0">
          <MarkedPageList
            pages={markedPages}
            activePage={currentPage}
            onSelectPage={handleSelectPage}
          />
        </div>

        <div className="min-w-0 flex-1">
          <DrawingPageViewer
            pdfUrl={MOCK_PDF_URL}
            pageNumber={currentPage}
            pageCount={Math.max(review.pageCount, 1)}
            annotations={pageAnnotations}
            selectedAnnotationId={selectedFindingId}
            focusBoundingBox={focusBoundingBox}
            focusKey={focusKey}
            onSelectAnnotation={handleSelectFinding}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="w-[360px] shrink-0">
          <FindingResultPanel
            findings={findings}
            selectedFindingId={selectedFindingId}
            onSelectFinding={handleSelectFinding}
            onConfirmFinding={handleConfirm}
            onSaveNote={handleSaveNote}
          />
        </div>
      </div>
    </div>
  );
}
