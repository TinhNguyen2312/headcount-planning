import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useListPageState } from "@/hooks/useListPageState"

describe("useListPageState", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("initializes with default options", () => {
    const { result } = renderHook(() => useListPageState())

    expect(result.current.keyword).toBe("")
    expect(result.current.debouncedKeyword).toBe("")
    expect(result.current.page).toBe(1)
    expect(result.current.limit).toBe(12)
    expect(result.current.viewMode).toBe("grid")
    expect(result.current.sortConfig.sort.sortBy).toBe("createdAt")
    expect(result.current.sortConfig.sort.order).toBe("DESC")
    expect(result.current.queryParams).toEqual({
      keyword: undefined,
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      order: "DESC",
    })
  })

  it("updates keyword and debounces value", () => {
    const { result } = renderHook(() =>
      useListPageState({ debounceDelay: 200 }),
    )

    act(() => {
      result.current.setKeyword("Novaworld")
    })

    expect(result.current.keyword).toBe("Novaworld")
    expect(result.current.debouncedKeyword).toBe("")

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.debouncedKeyword).toBe("Novaworld")
    expect(result.current.queryParams.keyword).toBe("Novaworld")
  })

  it("resets page to 1 when debouncedKeyword or sortConfig changes", () => {
    const { result } = renderHook(() =>
      useListPageState({ debounceDelay: 100 }),
    )

    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)

    // Change keyword
    act(() => {
      result.current.setKeyword("Aqua")
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.page).toBe(1)

    // Change page again
    act(() => {
      result.current.setPage(4)
    })
    expect(result.current.page).toBe(4)

    // Change sort
    act(() => {
      result.current.setSortConfig({
        sort: { sortBy: "name", order: "ASC" },
      })
    })

    expect(result.current.page).toBe(1)
  })

  it("switches viewMode and provides searchBarProps", () => {
    const { result } = renderHook(() => useListPageState())

    act(() => {
      result.current.searchBarProps.onViewModeChange("list")
    })

    expect(result.current.viewMode).toBe("list")

    act(() => {
      result.current.searchBarProps.onQueryChange("Test")
    })

    expect(result.current.keyword).toBe("Test")
  })

  it("loads initial sortConfig and viewMode from localStorage when persistKey is provided", () => {
    localStorage.setItem(
      "tm:list-state:projects",
      JSON.stringify({
        sortConfig: { sort: { sortBy: "name", order: "ASC" } },
        viewMode: "list",
      }),
    )

    const { result } = renderHook(() =>
      useListPageState({
        persistKey: "projects",
        initialSort: { sort: { sortBy: "createdAt", order: "DESC" } },
      }),
    )

    expect(result.current.viewMode).toBe("list")
    expect(result.current.sortConfig.sort.sortBy).toBe("name")
    expect(result.current.sortConfig.sort.order).toBe("ASC")
    expect(result.current.queryParams.sortBy).toBe("name")
    expect(result.current.queryParams.order).toBe("ASC")
  })

  it("persists sortConfig and viewMode changes to localStorage when persistKey is provided", () => {
    localStorage.clear()

    const { result } = renderHook(() =>
      useListPageState({
        persistKey: "projects",
      }),
    )

    act(() => {
      result.current.setSortConfig({
        sort: { sortBy: "name", order: "DESC" },
      })
      result.current.setViewMode("list")
    })

    const stored = JSON.parse(
      localStorage.getItem("tm:list-state:projects") || "{}",
    )
    expect(stored.viewMode).toBe("list")
    expect(stored.sortConfig.sort.sortBy).toBe("name")
    expect(stored.sortConfig.sort.order).toBe("DESC")
  })

  it("falls back to default options when localStorage contains corrupted data", () => {
    localStorage.setItem("tm:list-state:corrupted", "{ invalid json }")

    const { result } = renderHook(() =>
      useListPageState({
        persistKey: "corrupted",
        initialSort: { sort: { sortBy: "createdAt", order: "DESC" } },
        initialViewMode: "grid",
      }),
    )

    expect(result.current.viewMode).toBe("grid")
    expect(result.current.sortConfig.sort.sortBy).toBe("createdAt")
    expect(result.current.sortConfig.sort.order).toBe("DESC")
  })
})
