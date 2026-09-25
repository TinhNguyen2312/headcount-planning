import { ChevronDownIcon } from "@/components/Common/icons";
import type { FindingStatus } from "@/constants/enums";
import { STATUS_CONFIG, STATUS_ORDER } from "@/constants/domain";
import type { Finding, ReviewDossier } from "@/types";
import { StatusGroupSection } from "./StatusGroupSection";

export function ReviewDossierSection({
  dossier,
  findings,
  workspaceSlug,
  isOpen,
  onToggle,
  isStatusOpen,
  onToggleStatus,
}: {
  dossier: ReviewDossier;
  findings: readonly Finding[];
  workspaceSlug: string;
  isOpen: boolean;
  onToggle: () => void;
  isStatusOpen: (status: FindingStatus) => boolean;
  onToggleStatus: (status: FindingStatus) => void;
}) {
  const panelId = `dossier-panel-${dossier.id}`;

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    items: findings.filter((f) => f.status === status),
  }));

  const failCount = byStatus.find((g) => g.status === "fail")?.items.length ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 px-4 py-3 text-left
                     transition-colors duration-150 hover:bg-muted/40 cursor-pointer"
        >
          <ChevronDownIcon
            className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ${
              isOpen ? "" : "-rotate-90"
            }`}
          />
          <span className="numeric shrink-0 text-xs font-semibold text-foreground">
            {dossier.code}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-foreground/80 font-medium">
            {dossier.name}
          </span>

          <span className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 md:flex">
              {byStatus
                .filter((g) => g.items.length > 0)
                .map(({ status, items }) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1"
                    title={`${STATUS_CONFIG[status].label}: ${items.length}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${STATUS_CONFIG[status].bar}`}
                      aria-hidden
                    />
                    <span className="numeric text-[11px] text-muted-foreground">
                      {items.length}
                    </span>
                  </span>
                ))}
            </span>
            <span className="text-[11px] text-muted-foreground">
              <span className="numeric">{findings.length}</span> tiêu chí
              {failCount > 0 && (
                <>
                  {" · "}
                  <span className="text-red-500 font-semibold">
                    <span className="numeric">{failCount}</span> không đạt
                  </span>
                </>
              )}
            </span>
          </span>
        </button>
      </h2>

      {isOpen && (
        <div id={panelId} className="space-y-1 pb-3 pt-1 border-t border-border/70">
          {byStatus.map(({ status, items }) => (
            <StatusGroupSection
              key={status}
              dossierId={dossier.id}
              status={status}
              findings={items}
              workspaceSlug={workspaceSlug}
              isOpen={isStatusOpen(status)}
              onToggle={() => onToggleStatus(status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
