import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import PageHeader from "@/components/Common/PageHeader"
import { ShortcutButton } from "@/keyboard"

export interface ManagementPageLayoutProps {
  title: ReactNode
  onBack?: () => void
  backLabel?: string
  headerActions?: ReactNode
  searchBar?: ReactNode
  fullScreen?: boolean
  children: ReactNode
  modals?: ReactNode
  containerClassName?: string
}

export default function ManagementPageLayout({
  title,
  onBack,
  backLabel = "Quay lại",
  headerActions,
  searchBar,
  fullScreen = false,
  children,
  modals,
  containerClassName = "",
}: ManagementPageLayoutProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${
        fullScreen ? "h-screen" : "flex-1 h-full min-h-0"
      } bg-background ${containerClassName}`}
    >
      <div className="shrink-0 border-b border-border bg-background pb-4">
        <PageHeader
          title={title}
          leftSlot={
            onBack ? (
              <ShortcutButton
                shortcutKeys="backspace"
                icon={<ArrowLeft className="size-4" />}
                onClick={onBack}
              >
                {backLabel}
              </ShortcutButton>
            ) : undefined
          }
          rightSlot={headerActions}
        />
      </div>

      {searchBar && <div className="py-4 shrink-0">{searchBar}</div>}

      <div className="relative flex-1 overflow-y-auto min-h-0 py-2">
        {children}
      </div>

      {modals}
    </div>
  )
}
