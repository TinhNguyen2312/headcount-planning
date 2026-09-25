import { TipText, TipTitle, Tooltip } from "@/components/Common/Tooltip";
import { STATUS_CONFIG, STATUS_ORDER } from "@/constants/domain";
import type { FindingStatus } from "@/constants/enums";

export type MarkedPage = {
  pageNumber: number;
  statuses: readonly FindingStatus[];
  count: number;
};

export function MarkedPageList({
  pages,
  activePage,
  onSelectPage,
}: {
  pages: readonly MarkedPage[];
  activePage: number;
  onSelectPage: (pageNumber: number) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card border border-border shadow-xs">
      <div className="shrink-0 border-b border-border px-3.5 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Trang đánh dấu
        </h2>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {pages.map((page) => {
          const isActive = page.pageNumber === activePage;
          return (
            <li key={page.pageNumber}>
              <Tooltip
                content={
                  <>
                    <TipTitle>Trang {page.pageNumber}</TipTitle>
                    <TipText>
                      <span className="font-mono">{page.count}</span> tiêu chí được
                      đánh dấu trên trang này.
                    </TipText>
                  </>
                }
              >
                <button
                  type="button"
                  data-active={isActive}
                  onClick={() => onSelectPage(page.pageNumber)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left
                             text-sm text-muted-foreground transition-colors duration-150 cursor-pointer
                             hover:bg-muted hover:text-foreground
                             data-[active=true]:bg-primary/10 data-[active=true]:font-bold data-[active=true]:text-primary"
                >
                  <span className="font-mono font-medium">Trang {page.pageNumber}</span>
                  <span className="flex items-center gap-1">
                    {STATUS_ORDER.filter((status) => page.statuses.includes(status)).map(
                      (status) => (
                        <span
                          key={status}
                          className={`size-2 shrink-0 rounded-full ${STATUS_CONFIG[status].bar}`}
                          aria-hidden
                        />
                      ),
                    )}
                  </span>
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
