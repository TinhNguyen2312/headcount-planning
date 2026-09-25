"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "antd";
import type { FindingStatus } from "@/constants/enums";
import {
  COLLAPSED_BY_DEFAULT,
  SEVERITY_ORDER,
  STATUS_ORDER,
} from "@/constants/domain";
import type { Finding, ReviewDossier } from "@/types";
import { ReviewDossierSection } from "./ReviewDossierSection";
import {
  FindingStatusFilterBar,
  type StatusFilter,
} from "./FindingStatusFilterBar";

const statusKey = (dossierId: string, status: FindingStatus) =>
  `${dossierId}:${status}`;

export function FindingList({
  dossiers,
  findings,
  workspaceSlug,
}: {
  dossiers: readonly ReviewDossier[];
  findings: readonly Finding[];
  workspaceSlug: string;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [closedDossiers, setClosedDossiers] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [closedStatusGroups, setClosedStatusGroups] = useState<ReadonlySet<string>>(
    () =>
      new Set<string>(
        dossiers.flatMap((d) =>
          COLLAPSED_BY_DEFAULT.map((s: FindingStatus) => statusKey(d.id, s)),
        ),
      ),
  );

  const counts = useMemo(() => {
    const base = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<
      FindingStatus,
      number
    >;
    for (const f of findings) base[f.status] += 1;
    return base;
  }, [findings]);

  const groups = useMemo(() => {
    const visible =
      statusFilter === "all"
        ? findings
        : findings.filter((f) => f.status === statusFilter);

    return dossiers.map((dossier) => ({
      dossier,
      items: visible
        .filter((f) => f.reviewId === dossier.id)
        .sort((a, b) => {
          const byStatus =
            STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
          if (byStatus !== 0) return byStatus;
          const bySeverity =
            SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
          if (bySeverity !== 0) return bySeverity;
          return a.ruleIndex.localeCompare(b.ruleIndex, "vi", { numeric: true });
        }),
    }));
  }, [dossiers, findings, statusFilter]);

  const toggleDossier = useCallback((dossierId: string) => {
    setClosedDossiers((prev) => {
      const next = new Set(prev);
      if (!next.delete(dossierId)) next.add(dossierId);
      return next;
    });
  }, []);

  const toggleStatusGroup = useCallback(
    (dossierId: string, status: FindingStatus) => {
      setClosedStatusGroups((prev) => {
        const next = new Set(prev);
        const key = statusKey(dossierId, status);
        if (!next.delete(key)) next.add(key);
        return next;
      });
    },
    [],
  );

  const expandAll = useCallback(() => {
    setClosedDossiers(new Set<string>());
    setClosedStatusGroups(new Set<string>());
  }, []);

  const collapseAll = useCallback(() => {
    setClosedDossiers(new Set(dossiers.map((d) => d.id)));
    setClosedStatusGroups(
      new Set(dossiers.flatMap((d) => STATUS_ORDER.map((s: FindingStatus) => statusKey(d.id, s)))),
    );
  }, [dossiers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FindingStatusFilterBar
          counts={counts}
          total={findings.length}
          active={statusFilter}
          onChange={setStatusFilter}
        />

        <div className="flex items-center gap-2">
          <Button size="small" onClick={expandAll}>
            Mở rộng tất cả
          </Button>
          <Button size="small" onClick={collapseAll}>
            Thu gọn tất cả
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map(({ dossier, items }) => (
          <ReviewDossierSection
            key={dossier.id}
            dossier={dossier}
            findings={items}
            workspaceSlug={workspaceSlug}
            isOpen={!closedDossiers.has(dossier.id)}
            onToggle={() => toggleDossier(dossier.id)}
            isStatusOpen={(status) =>
              !closedStatusGroups.has(statusKey(dossier.id, status))
            }
            onToggleStatus={(status) => toggleStatusGroup(dossier.id, status)}
          />
        ))}
      </div>
    </div>
  );
}
