import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useIsMobile } from "@/hooks/use-mobile"

describe("useIsMobile", () => {
  let listeners: ((e: MediaQueryListEvent) => void)[] = []
  let matchesValue = false

  beforeEach(() => {
    listeners = []
    matchesValue = false

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchesValue,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(
          (_: string, cb: (e: MediaQueryListEvent) => void) => {
            listeners.push(cb)
          },
        ),
        removeEventListener: vi.fn(
          (_: string, cb: (e: MediaQueryListEvent) => void) => {
            listeners = listeners.filter((l) => l !== cb)
          },
        ),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it("returns false for desktop viewport", () => {
    matchesValue = false
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("returns true for mobile viewport", () => {
    matchesValue = true
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("reacts dynamically to media query change events", () => {
    matchesValue = false
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      matchesValue = true
      for (const listener of listeners) {
        listener({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)
  })
})
