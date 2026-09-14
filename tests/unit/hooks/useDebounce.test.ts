import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDebounce } from "@/hooks/useDebounce"

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300))
    expect(result.current).toBe("hello")
  })

  it("debounces value updates after specified delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 300 } },
    )

    rerender({ value: "second", delay: 300 })
    expect(result.current).toBe("first")

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe("first")

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe("second")
  })
})
