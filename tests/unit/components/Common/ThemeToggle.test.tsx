import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ThemeToggle } from "@/components/Common/ThemeToggle"
import { useTheme } from "@/components/theme-provider"

vi.mock("@/components/theme-provider", () => ({
  useTheme: vi.fn(),
}))

describe("ThemeToggle (SCRUM-114)", () => {
  const mockSetTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders light mode theme button and toggles to dark mode when clicked", () => {
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: "light",
      setTheme: mockSetTheme,
      theme: "light",
    })

    render(<ThemeToggle />)

    const button = screen.getByRole("button", { name: "Chuyển giao diện" })
    expect(button).toBeTruthy()
    expect(button.classList.contains("hidden!")).toBe(false)

    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("renders dark mode theme button and toggles to light mode when clicked", () => {
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: "dark",
      setTheme: mockSetTheme,
      theme: "dark",
    })

    render(<ThemeToggle />)

    const button = screen.getByRole("button", { name: "Chuyển giao diện" })
    expect(button).toBeTruthy()

    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })
})
