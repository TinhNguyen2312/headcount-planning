import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FilterDropdown } from "@/components/Common/Management/FilterDropdown"
import type { FilterUIItem } from "@/lib/filter"

describe("FilterDropdown component", () => {
  it("renders with default badge count and label", () => {
    const filters: FilterUIItem[] = [
      {
        key: "status",
        label: "Trạng thái",
        reset: vi.fn(),
        isActive: () => false,
        render: () => <div>Status Control</div>,
      },
    ]

    render(<FilterDropdown filters={filters} onReset={vi.fn()} />)

    expect(screen.getByText("Bộ lọc")).toBeTruthy()
  })

  it("computes activeCount correctly when filters are active", () => {
    const filters: FilterUIItem[] = [
      {
        key: "status",
        label: "Trạng thái",
        reset: vi.fn(),
        isActive: () => true,
        render: () => <div>Status Control</div>,
      },
    ]

    const { container } = render(
      <FilterDropdown filters={filters} onReset={vi.fn()} />,
    )

    const badge = container.querySelector(".ant-badge-count")
    expect(badge).toBeTruthy()
    expect(badge?.textContent).toBe("1")
  })

  it("calls filter.reset when reset button is clicked", () => {
    const mockReset = vi.fn()
    const filters: FilterUIItem[] = [
      {
        key: "status",
        label: "Trạng thái",
        reset: mockReset,
        isActive: () => true,
        render: () => <div>Status Control</div>,
      },
    ]

    render(<FilterDropdown filters={filters} onReset={vi.fn()} />)

    const button = screen.getByText("Bộ lọc")
    fireEvent.click(button)

    const closeBtn = document.querySelector(".lucide-x")
    expect(closeBtn).toBeTruthy()
    if (closeBtn) {
      fireEvent.click(closeBtn)
      expect(mockReset).toHaveBeenCalledTimes(1)
    }
  })

  it("calls onReset when 'Xóa tất cả bộ lọc' is clicked", () => {
    const onReset = vi.fn()
    const filters: FilterUIItem[] = [
      {
        key: "status",
        label: "Trạng thái",
        reset: vi.fn(),
        isActive: () => true,
        render: () => <div>Status Control</div>,
      },
    ]

    render(<FilterDropdown filters={filters} onReset={onReset} />)

    const button = screen.getByText("Bộ lọc")
    fireEvent.click(button)

    const resetAllBtn = screen.getByText("Xóa tất cả bộ lọc")
    expect(resetAllBtn).toBeTruthy()
    fireEvent.click(resetAllBtn)

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
