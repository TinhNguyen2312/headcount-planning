import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useFilterState, useFilters } from "@/hooks/useFilter"
import { createSelectFilter } from "@/lib/filter"

describe("useFilterState", () => {
  it("manages filter state and reset functionality", () => {
    const { result } = renderHook(() =>
      useFilterState({
        region: "all",
        status: "ACTIVE",
      }),
    )

    expect(result.current.state).toEqual({
      region: "all",
      status: "ACTIVE",
    })

    act(() => {
      result.current.update("region", "VUNG_TPHCM_1")
    })

    expect(result.current.state.region).toBe("VUNG_TPHCM_1")

    act(() => {
      result.current.reset()
    })

    expect(result.current.state).toEqual({
      region: "all",
      status: "ACTIVE",
    })
  })
})

describe("useFilters", () => {
  const items = [
    { id: 1, name: "Project A", status: "ACTIVE" },
    { id: 2, name: "Project B", status: "PAUSED" },
    { id: 3, name: "Project C", status: "ACTIVE" },
  ]

  it("filters items synchronously with and mode", () => {
    let currentStatus = "ACTIVE"
    const statusFilter = createSelectFilter({
      key: "status",
      label: "Status",
      value: currentStatus,
      onChange: (v) => {
        currentStatus = v as string
      },
      getField: (item: (typeof items)[0]) => item.status,
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "ACTIVE" },
        { label: "Paused", value: "PAUSED" },
      ],
    })

    const { result } = renderHook(() =>
      useFilters(items, [statusFilter], "and"),
    )

    expect(result.current).toHaveLength(2)
    expect(result.current.map((i) => i.id)).toEqual([1, 3])
  })
})
