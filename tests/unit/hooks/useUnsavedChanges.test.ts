import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"

// Mock @tanstack/react-router's useBlocker
vi.mock("@tanstack/react-router", () => ({
  useBlocker: vi.fn().mockReturnValue({
    status: "idle",
    proceed: vi.fn(),
    reset: vi.fn(),
  }),
}))

describe("useUnsavedChanges", () => {
  it("should initialize with isDirty = false", () => {
    const state = { count: 1 }
    const { result } = renderHook(() =>
      useUnsavedChanges({
        getCurrentValue: () => state,
      }),
    )

    act(() => {
      result.current.setSnapshot(state)
    })

    expect(result.current.isDirty).toBe(false)
  })

  it("should detect dirty state when value changes from snapshot", () => {
    let state = { text: "initial" }
    const { result, rerender } = renderHook(() =>
      useUnsavedChanges({
        getCurrentValue: () => state,
      }),
    )

    act(() => {
      result.current.setSnapshot(state)
    })
    expect(result.current.isDirty).toBe(false)

    // Modify state and re-render
    state = { text: "modified" }
    rerender()

    expect(result.current.isDirty).toBe(true)
  })

  it("should reset isDirty when markClean is called", () => {
    let state = { count: 1 }
    const { result, rerender } = renderHook(() =>
      useUnsavedChanges({
        getCurrentValue: () => state,
      }),
    )

    act(() => {
      result.current.setSnapshot(state)
    })

    state = { count: 2 }
    rerender()
    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.markClean()
    })
    rerender()

    expect(result.current.isDirty).toBe(false)
  })
})
