"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useId } from "react";
import { UploadCloud, FileText, Check, X, AlertCircle } from "lucide-react";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  HOUSE_TYPE_CONFIG,
  HOUSE_TYPE_ORDER,
} from "@/constants/domain";
import type { ChtkCategory, HouseType } from "@/constants/enums";
import {
  CATEGORY_CHECK_DESCRIPTIONS,
  MAX_FILE_SIZE_MB,
  UPLOAD_ACCEPT,
} from "@/constants/review.constants";
import { reviewsService } from "@/services/reviewsService";
import type { ChtkStandardSet, ZoneOption } from "@/types";

const CONTROL_CLASS =
  "h-8.5 w-full rounded-md border border-border bg-surface-sunken/40 px-3 text-xs text-foreground " +
  "transition-colors duration-150 placeholder:text-muted-foreground/60 hover:border-border-strong " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReviewUploadForm({
  workspaceSlug,
  zoneOptions,
  standardSets,
}: {
  workspaceSlug: string;
  zoneOptions: readonly ZoneOption[];
  standardSets: readonly ChtkStandardSet[];
}) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [standardSetId, setStandardSetId] = useState("");
  const [houseType, setHouseType] = useState<HouseType | null>(null);
  const [categories, setCategories] = useState<ReadonlySet<ChtkCategory>>(
    new Set(CATEGORY_ORDER),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFiles = (files: FileList | null) => {
    const next = files?.[0];
    if (next && next.type === "application/pdf") {
      if (next.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File PDF vượt quá dung lượng tối đa ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setFile(next);
      setError(null);
    }
  };

  const toggleCategory = (category: ChtkCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const isValid =
    file !== null &&
    name.trim().length > 0 &&
    zoneId !== "" &&
    standardSetId !== "" &&
    houseType !== null &&
    categories.size > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || !file || !houseType || !zoneId || !standardSetId) {
      setError("Vui lòng điền đủ thông tin, chọn file bản vẽ PDF và ít nhất một nhóm tiêu chí kiểm tra.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const review = await reviewsService.createReview({
        name: name.trim(),
        zoneId,
        standardSetId,
        houseType,
        categories: Array.from(categories),
        file: { name: file.name, sizeBytes: file.size },
      });
      router.push(`/drawing-checker/reviews/${review.id}/processing`);
    } catch {
      setError("Không thể tạo hồ sơ thẩm định. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
      {/* 1. Bản vẽ PDF */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-2.5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bản vẽ PDF công trình
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tải lên toàn bộ hồ sơ bản vẽ kiến trúc cần soát dưới dạng một file PDF duy nhất.
          </p>
        </div>

        {file ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-surface-sunken/40 px-3.5 py-2.5">
            <FileText className="size-6 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
              <p className="numeric text-[11px] text-muted-foreground mt-0.5">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-muted cursor-pointer transition-colors"
            >
              <X className="size-3.5" /> Gỡ file
            </button>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border-strong bg-surface-sunken/20"
            }`}
          >
            <UploadCloud className="size-7 text-muted-foreground" />
            <p className="text-xs text-foreground font-medium">
              Kéo thả file PDF vào đây, hoặc{" "}
              <span className="text-primary underline-offset-2 hover:underline">chọn file</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Chỉ nhận file .pdf, tối đa {MAX_FILE_SIZE_MB}MB
            </p>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={UPLOAD_ACCEPT}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </section>

      {/* 2. Thông tin hồ sơ */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Thông tin thẩm định
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label htmlFor="review-name" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Tên hồ sơ <span className="text-red-500">*</span>
            </label>
            <input
              id="review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: PN2 Đà Nẵng — Shophouse lô B12"
              className={CONTROL_CLASS}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="review-zone" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Phân khu <span className="text-red-500">*</span>
            </label>
            <select
              id="review-zone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Chọn phân khu quy hoạch</option>
              {zoneOptions.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="review-standard" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Bộ tiêu chuẩn CHTK <span className="text-red-500">*</span>
            </label>
            <select
              id="review-standard"
              value={standardSetId}
              onChange={(e) => setStandardSetId(e.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Chọn bộ tiêu chuẩn áp dụng</option>
              {standardSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.ruleCount} tiêu chí
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Loại sản phẩm nhà <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {HOUSE_TYPE_ORDER.map((type) => {
                const config = HOUSE_TYPE_CONFIG[type];
                const isSelected = houseType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHouseType(type)}
                    className={`h-8.5 rounded-md px-2.5 text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {config.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Nhóm tiêu chí CHTK */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nhóm tiêu chí cần đối chiếu (CHTK)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chọn một hoặc nhiều nhóm quy chuẩn CHTK mà AI sẽ quét trên bản vẽ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORY_ORDER.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const checked = categories.has(category);

            return (
              <div
                key={category}
                onClick={() => toggleCategory(category)}
                className={`flex items-start gap-2.5 p-3 rounded-md border cursor-pointer transition-colors ${
                  checked
                    ? "border-primary/80 bg-primary/5"
                    : "border-border/60 hover:bg-muted/30"
                }`}
              >
                <div
                  className={`size-4 mt-0.5 rounded flex items-center justify-center border transition-colors ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {checked && <Check className="size-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${config.dot}`} />
                    <span className="text-xs font-semibold text-foreground">
                      {config.section}. {config.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    {CATEGORY_CHECK_DESCRIPTIONS[category]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-500 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-8.5 px-3.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="h-8.5 px-4 rounded-md bg-foreground text-background text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Đang xử lý..." : "Tải lên & Bắt đầu phân tích AI"}
        </button>
      </div>
    </form>
  );
}
