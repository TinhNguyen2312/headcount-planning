import { Input, Segmented, Space } from "antd"
import { LayoutGrid, List, Search } from "lucide-react"
import type React from "react"
import type { ViewMode } from "@/hooks/useListPageState"
import type { FilterUIItem } from "@/lib/filter"
import type { SortConfig, SortOption } from "@/types/common"
import { FilterDropdown } from "./FilterDropdown"
import { SortDropdown } from "./SortDropdown"

export interface SearchBarProps {
  query: string
  viewMode?: ViewMode
  sortConfig?: SortConfig
  onQueryChange: (query: string) => void
  onViewModeChange?: (mode?: ViewMode) => void
  onSortChange?: (config: SortConfig) => void
  sortOptions?: SortOption[]
  searchPlaceholder?: string
  sortPlaceholder?: string
  gridLabel?: string
  listLabel?: string
  middleSlot?: React.ReactNode
  filters?: FilterUIItem[]
  onResetFilters?: () => void
}

export const SearchBar = ({
  query,
  viewMode,
  sortConfig,
  onQueryChange,
  onViewModeChange,
  onSortChange,
  sortOptions,
  middleSlot,
  searchPlaceholder = "Tìm kiếm theo tên...",
  sortPlaceholder = "Sắp xếp",
  gridLabel = "Lưới",
  listLabel = "Danh sách",
  filters = [],
  onResetFilters,
}: SearchBarProps) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={searchPlaceholder}
        prefix={<Search className="size-4 text-muted-foreground mr-1" />}
        className="flex-1 h-9!"
        allowClear
      />

      {middleSlot}

      {filters.length > 0 && onResetFilters && (
        <FilterDropdown filters={filters} onReset={onResetFilters} />
      )}

      <Space size="middle" className="flex-wrap">
        {sortConfig && onSortChange && (
          <SortDropdown
            value={sortConfig}
            onChange={onSortChange}
            options={sortOptions}
            placeholder={sortPlaceholder}
          />
        )}
        {viewMode !== undefined && onViewModeChange && (
          <Segmented
            value={viewMode}
            onChange={(v) => onViewModeChange(v as ViewMode)}
            className="h-9!"
            classNames={{ label: "flex items-center" }}
            options={[
              {
                label: (
                  <span className="flex items-center gap-1 text-base font-medium">
                    <LayoutGrid className="size-3.5" /> {gridLabel}
                  </span>
                ),
                value: "grid",
              },
              {
                label: (
                  <span className="flex items-center gap-1 text-base font-medium">
                    <List className="size-3.5" /> {listLabel}
                  </span>
                ),
                value: "list",
              },
            ]}
          />
        )}
      </Space>
    </div>
  )
}
