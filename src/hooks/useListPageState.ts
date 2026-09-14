import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { getStoredItem, STORAGE_PREFIX, setStoredItem } from "@/lib/storage"
import type { SortConfig } from "@/types/common"

export type ViewMode = "grid" | "list"

export const DEFAULT_SORT_CONFIG: SortConfig = {
  sort: {
    sortBy: "createdAt",
    order: "DESC",
  },
}

interface PersistedListState<TExtra = object> {
  sortConfig?: SortConfig<TExtra>
  viewMode?: ViewMode
}

interface UseListPageStateOptions<TExtra extends object> {
  initialSort?: SortConfig<TExtra>
  initialPage?: number
  initialLimit?: number
  initialViewMode?: ViewMode
  resetPageOn?: unknown
  debounceDelay?: number
  persistKey?: string
}

export function useListPageState<TExtra extends object = object>(
  options: UseListPageStateOptions<TExtra> = {},
) {
  const {
    initialSort,
    initialPage = 1,
    initialLimit = 12,
    initialViewMode = "grid",
    resetPageOn,
    debounceDelay = 300,
    persistKey,
  } = options

  const defaultSort = initialSort ?? (DEFAULT_SORT_CONFIG as SortConfig<TExtra>)
  const storageKey = persistKey
    ? `${STORAGE_PREFIX}list-state:${persistKey}`
    : null

  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebounce(keyword, debounceDelay)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (!storageKey) return initialViewMode
    const saved = getStoredItem<PersistedListState<TExtra>>(storageKey, {})
    if (saved.viewMode === "grid" || saved.viewMode === "list") {
      return saved.viewMode
    }
    return initialViewMode
  })
  const [sortConfig, setSortConfig] = useState<SortConfig<TExtra>>(() => {
    if (!storageKey) return defaultSort
    const saved = getStoredItem<PersistedListState<TExtra>>(storageKey, {})
    if (saved.sortConfig?.sort?.sortBy && saved.sortConfig?.sort?.order) {
      return saved.sortConfig
    }
    return defaultSort
  })

  // Persist sort and view mode changes to localStorage
  useEffect(() => {
    if (!storageKey) return
    setStoredItem(storageKey, {
      sortConfig,
      viewMode,
    })
  }, [storageKey, sortConfig, viewMode])

  const [prevFilters, setPrevFilters] = useState({
    debouncedKeyword,
    sortConfig,
    resetPageOn,
  })

  if (
    prevFilters.debouncedKeyword !== debouncedKeyword ||
    prevFilters.sortConfig !== sortConfig ||
    prevFilters.resetPageOn !== resetPageOn
  ) {
    setPrevFilters({ debouncedKeyword, sortConfig, resetPageOn })
    setPage(1)
  }

  const queryParams = {
    keyword: debouncedKeyword || undefined,
    page,
    limit,
    sortBy: sortConfig.sort.sortBy,
    order: (sortConfig.sort.order || "DESC").toUpperCase() as "ASC" | "DESC",
    ...sortConfig.extra,
  }

  const searchBarProps = {
    query: keyword,
    viewMode,
    sortConfig,
    onQueryChange: setKeyword,
    onViewModeChange: (mode?: ViewMode) => {
      if (mode) setViewMode(mode)
    },
    onSortChange: (cfg: SortConfig) => setSortConfig(cfg as SortConfig<TExtra>),
  }

  return {
    keyword,
    setKeyword,
    debouncedKeyword,
    page,
    setPage,
    limit,
    setLimit,
    viewMode,
    setViewMode,
    sortConfig,
    setSortConfig,
    queryParams,
    searchBarProps,
  }
}
