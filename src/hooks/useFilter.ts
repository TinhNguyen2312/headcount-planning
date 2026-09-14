/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react"
import {
  type DateRangeValue,
  DEFAULT_DATE_RANGE,
  type FilterDef,
} from "@/lib/filter"

type FilterMode = "and" | "or"

export function useFilters<TItem>(
  items: TItem[],
  filters: FilterDef<TItem, any>[],
  mode: FilterMode = "or",
): TItem[] {
  const activeFilters = filters.filter((f) => f.isActive(f.value))
  const hasAsync = activeFilters.some((f) => f.asyncFilterFn)

  const syncFiltered = useMemo(() => {
    if (hasAsync) return items
    if (activeFilters.length === 0) return items

    if (mode === "or") {
      return items.filter((item) =>
        activeFilters.some((f) =>
          f.filterFn ? f.filterFn(item, f.value) : true,
        ),
      )
    }

    return activeFilters.reduce((acc, f) => {
      return f.filterFn ? acc.filter((item) => f.filterFn!(item, f.value)) : acc
    }, items)
  }, [items, activeFilters, mode, hasAsync])

  const [asyncFiltered, setAsyncFiltered] = useState<TItem[]>(items)

  useEffect(() => {
    if (!hasAsync) return

    let cancelled = false

    const run = async () => {
      if (activeFilters.length === 0) {
        if (!cancelled) setAsyncFiltered(items)
        return
      }

      let result: TItem[]

      if (mode === "or") {
        const itemResults = await Promise.all(
          items.map(async (item) => {
            const checks = await Promise.all(
              activeFilters.map((f) =>
                f.asyncFilterFn
                  ? f.asyncFilterFn(item, f.value)
                  : Promise.resolve(
                      f.filterFn ? f.filterFn(item, f.value) : true,
                    ),
              ),
            )
            return checks.some(Boolean)
          }),
        )
        result = items.filter((_, i) => itemResults[i])
      } else {
        result = items
        for (const filter of activeFilters) {
          if (filter.asyncFilterFn) {
            const checks = await Promise.all(
              result.map((item) => filter.asyncFilterFn!(item, filter.value)),
            )
            result = result.filter((_, i) => checks[i])
          } else if (filter.filterFn) {
            result = result.filter((item) =>
              filter.filterFn!(item, filter.value),
            )
          }
        }
      }

      if (!cancelled) setAsyncFiltered(result)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [items, activeFilters, hasAsync, mode])

  return hasAsync ? asyncFiltered : syncFiltered
}

interface DateFilterState {
  createdAt?: DateRangeValue
  updatedAt?: DateRangeValue
}

type WithDateFilters<T> = T & DateFilterState

export function useFilterState<T extends Record<string, unknown>>(
  initial: T,
  includeDates = false,
) {
  const initialWithDates: WithDateFilters<T> = includeDates
    ? {
        ...initial,
        createdAt: DEFAULT_DATE_RANGE,
        updatedAt: DEFAULT_DATE_RANGE,
      }
    : (initial as WithDateFilters<T>)

  const [state, setState] = useState<WithDateFilters<T>>(initialWithDates)

  const update = <K extends keyof WithDateFilters<T>>(
    key: K,
    value: WithDateFilters<T>[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const reset = () => setState(initialWithDates)

  return { state, update, reset }
}
