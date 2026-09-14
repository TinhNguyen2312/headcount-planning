import { type UIEvent, useCallback, useState } from "react"
import { useDebounce } from "./useDebounce"

interface UseLazyPaginationOptions {
  pageSize?: number
  debounceDelay?: number
}

export function useLazyPagination({
  pageSize = 20,
  debounceDelay = 300,
}: UseLazyPaginationOptions = {}) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, debounceDelay)
  const [prevSearch, setPrevSearch] = useState(debouncedSearch)

  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch)
    setPage(1)
  }

  const handlePopupScroll = useCallback(
    (isFetching: boolean, hasMore: boolean) => (e: UIEvent<HTMLDivElement>) => {
      const target = (e.currentTarget || e.target) as HTMLElement
      if (!target) return
      const { scrollTop, scrollHeight, clientHeight } = target
      if (
        scrollHeight > 0 &&
        scrollHeight - scrollTop <= clientHeight + 80 &&
        !isFetching &&
        hasMore
      ) {
        setPage((p) => p + 1)
      }
    },
    [],
  )

  return {
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    debouncedSearch,
    handlePopupScroll,
  }
}
