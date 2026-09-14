import { useMemo, useState } from "react"
import type { PaginationMeta } from "@/types/common"

function extractHasMore(
  meta?: PaginationMeta | null,
  itemsCount = 0,
  pageSize = 20,
): boolean {
  if (meta?.hasNext !== undefined) {
    return meta.hasNext
  }
  if (meta?.page !== undefined && meta?.totalPages !== undefined) {
    return meta.page < meta.totalPages - 1
  }
  return itemsCount >= pageSize
}

export function useLazyAccumulator<T>(
  incomingItems?: T[],
  meta?: PaginationMeta | null,
  page = 1,
  enabled = true,
  pageSize = 20,
) {
  const [accumulated, setAccumulated] = useState<T[]>([])
  const [prevItems, setPrevItems] = useState<T[] | undefined>(undefined)

  if (prevItems !== incomingItems) {
    setPrevItems(incomingItems)
    if (enabled && incomingItems) {
      if (page === 1) {
        setAccumulated(incomingItems)
      } else {
        setAccumulated((prev) => {
          const existingIds = new Set(
            prev
              .map((item) =>
                item && typeof item === "object" && "id" in item
                  ? item.id
                  : null,
              )
              .filter(Boolean),
          )
          const newUnique = incomingItems.filter((item) => {
            if (item && typeof item === "object" && "id" in item && item.id) {
              return !existingIds.has(item.id)
            }
            return true
          })
          return newUnique.length > 0 ? [...prev, ...newUnique] : prev
        })
      }
    } else if (!enabled) {
      setAccumulated([])
    }
  }

  const hasMore = useMemo(
    () =>
      enabled ? extractHasMore(meta, incomingItems?.length, pageSize) : true,
    [enabled, meta, incomingItems?.length, pageSize],
  )

  return {
    allItems: enabled ? accumulated : [],
    hasMore,
  }
}
