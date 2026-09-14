import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useLazyAccumulator } from "@/hooks/useLazyAccumulator"

describe("useLazyAccumulator", () => {
  it("initializes with page 1 items", () => {
    const page1Data = {
      result: [
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" },
      ],
    }

    const { result } = renderHook(
      ({ data, page }) => useLazyAccumulator(data, page, 2),
      { initialProps: { data: page1Data, page: 1 } },
    )

    expect(result.current.allItems).toEqual([
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ])
    expect(result.current.hasMore).toBe(true)
  })

  it("accumulates new items on subsequent pages and dedupes by id", () => {
    const page1Data = {
      result: [
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" },
      ],
    }

    const { result, rerender } = renderHook(
      ({ data, page }) => useLazyAccumulator(data, page, 2),
      { initialProps: { data: page1Data, page: 1 } },
    )

    const page2Data = {
      result: [
        { id: 2, name: "User 2" }, // Duplicate
        { id: 3, name: "User 3" },
      ],
    }

    rerender({ data: page2Data, page: 2 })

    expect(result.current.allItems).toEqual([
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
      { id: 3, name: "User 3" },
    ])
  })

  it("sets hasMore to false when result length is less than pageSize", () => {
    const page2Data = {
      result: [{ id: 3, name: "User 3" }],
    }

    const { result } = renderHook(
      ({ data, page }) => useLazyAccumulator(data, page, 5),
      { initialProps: { data: page2Data, page: 2 } },
    )

    expect(result.current.hasMore).toBe(false)
  })

  it("resets allItems when enabled is false", () => {
    const page1Data = {
      result: [{ id: 1, name: "User 1" }],
    }

    const { result, rerender } = renderHook(
      ({ data, page, enabled }) => useLazyAccumulator(data, page, 5, enabled),
      { initialProps: { data: page1Data, page: 1, enabled: true } },
    )

    expect(result.current.allItems.length).toBe(1)

    rerender({ data: page1Data, page: 1, enabled: false })
    expect(result.current.allItems).toEqual([])
    expect(result.current.hasMore).toBe(true)
  })
})
