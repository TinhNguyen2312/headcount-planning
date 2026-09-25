"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Finding } from "@/types";
import { EmptyState } from "@/components/Common/EmptyState";
import {
  StatusLegend,
  StatusStackedBar,
  totalOf,
} from "@/components/Common/StatusStackedBar";
import {
  ACTION_REQUIRED_STATUSES,
  PASSED_STATUSES,
  SEVERITY_ORDER,
  STATUS_ORDER,
} from "@/constants/domain";
import { EMPTY_STATUS_COUNTS, type FindingStatus } from "@/types";
import { FindingResultCard } from "./FindingResultCard";

type ResultTab = "action" | "all" | "passed";

const TABS: readonly { key: ResultTab; label: string }[] = [
  { key: "action", label: "Cần xử lý" },
  { key: "all", label: "Tất cả" },
  { key: "passed", label: "Đạt" },
];

function passRateTone(percent: number): string {
  if (percent < 50) return "text-red-600";
  if (percent < 80) return "text-amber-500";
  return "text-emerald-600";
}

function belongsToTab(finding: Finding, tab: ResultTab): boolean {
  if (tab === "all") return true;
  return (tab === "action" ? ACTION_REQUIRED_STATUSES : PASSED_STATUSES).includes(finding.status);
}

function tabOf(finding: Finding): ResultTab {
  if (ACTION_REQUIRED_STATUSES.includes(finding.status)) return "action";
  if (PASSED_STATUSES.includes(finding.status)) return "passed";
  return "all";
}

function sortFindings(findings: readonly Finding[]): readonly Finding[] {
  return [...findings].sort((a, b) => {
    const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (byStatus !== 0) return byStatus;
    const bySeverity = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    if (bySeverity !== 0) return bySeverity;
    return a.ruleIndex.localeCompare(b.ruleIndex, "vi", { numeric: true });
  });
}

export function FindingResultPanel({
  findings,
  selectedFindingId,
  onSelectFinding,
  onConfirmFinding,
  onSaveNote,
}: {
  findings: readonly Finding[];
  selectedFindingId?: string;
  onSelectFinding: (id: string) => void;
  onConfirmFinding: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
}) {
  const [tab, setTab] = useState<ResultTab>("action");
  const listRef = useRef<HTMLDivElement>(null);

  const [syncedSelectedId, setSyncedSelectedId] = useState<string | undefined>(undefined);
  if (selectedFindingId !== syncedSelectedId) {
    setSyncedSelectedId(selectedFindingId);
    const target = findings.find((f) => f.id === selectedFindingId);
    if (target && !belongsToTab(target, tab)) setTab(tabOf(target));
  }

  useEffect(() => {
    if (!selectedFindingId) return;
    listRef.current
      ?.querySelector(`[data-finding-id="${selectedFindingId}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedFindingId, tab]);

  const statusCounts = useMemo(() => {
    const counts = { ...EMPTY_STATUS_COUNTS } as Record<FindingStatus, number>;
    for (const finding of findings) counts[finding.status] += 1;
    return counts;
  }, [findings]);

  const concluded = totalOf(statusCounts) - statusCounts.unknown;
  const passed = PASSED_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0);
  const passRate = concluded > 0 ? Math.round((passed / concluded) * 100) : 0;

  const visible = useMemo(() => {
    const filtered =
      tab === "all"
        ? findings
        : tab === "action"
          ? findings.filter((f) => ACTION_REQUIRED_STATUSES.includes(f.status))
          : findings.filter((f) => PASSED_STATUSES.includes(f.status));
    return sortFindings(filtered);
  }, [findings, tab]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-card border border-border/80 shadow-xs">
      <div className="shrink-0 space-y-2.5 border-b border-border/80 p-3 bg-card">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Kết quả thẩm định
          </h2>
          <p className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">Đạt</span>
            <span className={`font-mono text-sm font-bold ${passRateTone(passRate)}`}>
              {concluded > 0 ? `${passRate}%` : "——"}
            </span>
          </p>
        </div>
        <StatusStackedBar counts={statusCounts} />
        <StatusLegend counts={statusCounts} />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{passed}</span>/<span className="font-mono font-medium text-foreground">{concluded}</span>{" "}
          tiêu chí đã kết luận được là đạt; không tính{" "}
          <span className="font-mono font-medium text-foreground">{statusCounts.unknown}</span> mục không xác định.
        </p>

        <div role="tablist" aria-label="Lọc kết quả thẩm định" className="flex rounded-md border border-border/70 bg-muted/40 p-0.5 gap-0.5">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              data-active={tab === key}
              onClick={() => setTab(key)}
              className="flex-1 rounded py-1 px-2 text-xs font-medium text-muted-foreground transition-all cursor-pointer
                         hover:text-foreground
                         data-[active=true]:bg-surface-raised data-[active=true]:font-medium data-[active=true]:text-foreground data-[active=true]:shadow-xs"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden p-3">
        {visible.length === 0 ? (
          <div className="px-2 py-10 text-center">
            <EmptyState message="Không có tiêu chí nào trong mục này." />
          </div>
        ) : (
          visible.map((finding) => (
            <FindingResultCard
              key={finding.id}
              finding={finding}
              isSelected={finding.id === selectedFindingId}
              onSelect={() => onSelectFinding(finding.id)}
              onConfirm={() => onConfirmFinding(finding.id)}
              onSaveNote={(note) => onSaveNote(finding.id, note)}
            />
          ))
        )}
      </div>
    </div>
  );
}
