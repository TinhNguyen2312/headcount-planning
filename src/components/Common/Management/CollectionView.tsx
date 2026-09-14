import type { ReactNode } from "react"
import type { ViewMode } from "@/hooks/useListPageState"
import { EmptyState } from "./EmptyState"
import { GridView } from "./GridView"
import { type ButtonConfig, ListView, type ListViewItemBase } from "./ListView"
import { Pagination } from "./Pagination"

export interface CollectionPagination {
  page: number
  total: number
  pageSize: number
  onChange: (page: number) => void
  itemLabel: string
}

export interface CollectionViewProps<T extends ListViewItemBase> {
  viewMode: ViewMode
  items: T[]
  getImageSrc?: (item: T) => string
  buttons?: ButtonConfig<T>[]
  renderTitle?: (item: T) => ReactNode
  imageComponent?: (item: T) => ReactNode
  showTitleTooltip?: boolean
  showDescription?: boolean
  itemClassName?: string
  actionLayout?: "horizontal" | "vertical"
  actionAriaLabel?: string
  emptyDescription: string
  emptyHelperText?: string
  emptyActionText?: string
  onEmptyAction?: () => void
  renderCustomCard?: (item: T) => ReactNode
  renderCustomRow?: (item: T) => ReactNode
  pagination?: CollectionPagination
}

export function CollectionView<T extends ListViewItemBase>({
  viewMode,
  items,
  getImageSrc,
  buttons,
  renderTitle,
  imageComponent,
  showTitleTooltip,
  showDescription,
  itemClassName,
  actionLayout,
  actionAriaLabel,
  emptyDescription,
  emptyHelperText,
  emptyActionText,
  onEmptyAction,
  renderCustomCard,
  renderCustomRow,
  pagination,
}: CollectionViewProps<T>) {
  if (items.length === 0) {
    return (
      <EmptyState
        emptyDescription={emptyDescription}
        helperText={emptyHelperText}
        actionText={emptyActionText}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {viewMode === "list" ? (
        <ListView
          items={items}
          getImageSrc={getImageSrc}
          buttons={buttons}
          renderTitle={renderTitle}
          imageComponent={imageComponent}
          showDescription={showDescription}
          itemClassName={itemClassName}
          actionLayout={actionLayout}
          renderCustomRow={renderCustomRow}
        />
      ) : (
        <GridView
          items={items}
          getImageSrc={getImageSrc}
          buttons={buttons}
          renderTitle={renderTitle}
          imageComponent={imageComponent}
          showTitleTooltip={showTitleTooltip}
          showDescription={showDescription}
          actionAriaLabel={actionAriaLabel}
          renderCustomCard={renderCustomCard}
        />
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          filteredCount={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onChange}
          itemLabel={pagination.itemLabel}
        />
      )}
    </div>
  )
}
