"use client";

import { useState } from "react";
import { ChtkCategoryTag } from "@/components/Findings/ChtkCategoryTag";
import { ConfidenceBadge } from "@/components/Findings/ConfidenceBadge";
import { ExtractedVsExpectedValue } from "@/components/Findings/ExtractedVsExpectedValue";
import { FindingSeverityBadge } from "@/components/Findings/FindingSeverityBadge";
import { FindingStatusBadge } from "@/components/Findings/FindingStatusBadge";
import { PageReferenceLink } from "@/components/Findings/PageReferenceLink";
import { ReasoningGroupTag } from "@/components/Findings/ReasoningGroupTag";
import type { Finding } from "@/types";
import { NoteIcon, ShieldCheckIcon } from "@/components/Common/icons";

function NoteEditor({
  note,
  onSave,
}: {
  note?: string;
  onSave: (note: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  if (!isEditing) {
    return (
      <div className="space-y-1.5">
        {note && (
          <p className="rounded-md border border-border/60 bg-muted/30 p-2 text-xs leading-relaxed text-foreground">
            {note}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setDraft(note ?? "");
            setIsEditing(true);
          }}
          className="inline-flex h-6 items-center gap-1.5 rounded border border-dashed border-border px-2 text-[11px] font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
        >
          <NoteIcon className="size-3" />
          <span>{note ? "Sửa ghi chú" : "Thêm ghi chú"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={2}
        placeholder="Ghi chú cho tiêu chí này..."
        className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none transition-colors resize-none"
      />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            onSave(draft.trim());
            setIsEditing(false);
          }}
          className="inline-flex h-6 items-center rounded-md border border-primary/80 bg-primary px-2.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Lưu ghi chú
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="inline-flex h-6 items-center rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

export function FindingResultCard({
  finding,
  isSelected,
  onSelect,
  onConfirm,
  onSaveNote,
}: {
  finding: Finding;
  isSelected: boolean;
  onSelect: () => void;
  onConfirm: () => void;
  onSaveNote: (note: string) => void;
}) {
  return (
    <div
      data-selected={isSelected}
      data-finding-id={finding.id}
      className={`rounded-lg border p-3 transition-all duration-150 ${
        isSelected
          ? "border-primary/70 bg-muted/30 shadow-xs"
          : "border-border/80 bg-card hover:border-border"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-col gap-1.5 text-left cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">
            {finding.ruleIndex}
          </span>
          <FindingStatusBadge status={finding.status} />
        </div>

        <p className="text-xs font-medium text-foreground leading-snug">{finding.detailLabel}</p>

        <ExtractedVsExpectedValue
          extractedValue={finding.extractedValue}
          standardValue={finding.standardValue}
          status={finding.status}
        />

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <FindingSeverityBadge severity={finding.severity} />
          <ConfidenceBadge value={finding.confidence} group={finding.group} />
          <ReasoningGroupTag group={finding.group} />
          <ChtkCategoryTag category={finding.category} />
          <PageReferenceLink pageNumber={finding.pageNumber} withTooltip={false} />
          {finding.note && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground" title="Có ghi chú">
              <NoteIcon className="size-3 shrink-0" />
            </span>
          )}
        </div>
      </button>

      {isSelected && (
        <div className="mt-3 space-y-2.5 border-t border-border/60 pt-2.5">
          {finding.status !== "approved" && (
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 text-xs font-medium text-foreground shadow-xs hover:bg-muted/80 transition-colors"
            >
              <ShieldCheckIcon className="size-3.5 text-emerald-500" />
              <span>Xác nhận kết luận</span>
            </button>
          )}

          <NoteEditor note={finding.note} onSave={onSaveNote} />
        </div>
      )}
    </div>
  );
}
