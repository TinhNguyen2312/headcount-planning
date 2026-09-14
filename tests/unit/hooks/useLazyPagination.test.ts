import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useLazyPagination } from "@/hooks/useLazyPagination"

describe("useLazyPagination", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("initializes with default page 1 and custom pageSize", () => {
    const { result } = renderHook(() => useLazyPagination({ pageSize: 25 }))
    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(25)
    expect(result.current.search).toBe("")
    expect(result.current.debouncedSearch).toBe("")
  })

  it("resets page to 1 when debounced search keyword changes", () => {
    const { result } = renderHook(() =>
      useLazyPagination({ debounceDelay: 200 }),
    )

    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setSearch("Nguyen")
    })
    // Before debounce timer fires
    expect(result.current.page).toBe(3)

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.debouncedSearch).toBe("Nguyen")
    expect(result.current.page).toBe(1)
  })

  it("increments page on handlePopupScroll near bottom when not fetching and hasMore is true", () => {
    const { result } = renderHook(() => useLazyPagination())

    const mockEvent = {
      currentTarget: {
        scrollTop: 400,
        scrollHeight: 500,
        clientHeight: 100, // 500 - 400 <= 100 + 60 -> true
      },
    } as any

    act(() => {
      result.current.handlePopupScroll(false, true)(mockEvent)
    })
    expect(result.current.page).toBe(2)

    // Does not increment if isFetching is true
    act(() => {
      result.current.handlePopupScroll(true, true)(mockEvent)
    })
    expect(result.current.page).toBe(2)

    // Does not increment if hasMore is false
    act(() => {
      result.current.handlePopupScroll(false, false)(mockEvent)
    })
    expect(result.current.page).toBe(2)
  })

  it("increments page on handleDivScroll near bottom", () => {
    const { result } = renderHook(() => useLazyPagination())

    const mockEvent = {
      currentTarget: {
        scrollTop: 350,
        clientHeight: 100,
        scrollHeight: 500, // 350 + 100 >= 500 - 60 (450 >= 440) -> true
      },
    } as any

    act(() => {
      result.current.handleDivScroll(false, true)(mockEvent)
    })
    expect(result.current.page).toBe(2)
  })
})
