import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
  DEFAULT_SORT_OPTIONS,
  SortDropdown,
} from "@/components/Common/Management/SortDropdown"
import type { SortConfig } from "@/types/common"

describe("SortDropdown component", () => {
  it("renders with active option label", () => {
    const value: SortConfig = {
      sort: { sortBy: "createdAt", order: "DESC" },
    }
    const onChange = vi.fn()

    render(<SortDropdown value={value} onChange={onChange} />)

    expect(screen.getByText("Mới nhất")).toBeTruthy()
  })

  it("renders placeholder when sort does not match any options", () => {
    const value: SortConfig = {
      sort: { sortBy: "unknownField", order: "ASC" },
    }
    const onChange = vi.fn()

    render(
      <SortDropdown
        value={value}
        onChange={onChange}
        placeholder="Chọn sắp xếp"
      />,
    )

    expect(screen.getByText("Chọn sắp xếp")).toBeTruthy()
  })

  it("triggers onChange when a menu item is clicked", async () => {
    const value: SortConfig = {
      sort: { sortBy: "createdAt", order: "DESC" },
    }
    const onChange = vi.fn()

    render(
      <SortDropdown
        value={value}
        onChange={onChange}
        options={DEFAULT_SORT_OPTIONS}
      />,
    )

    const button = screen.getByRole("button")
    fireEvent.click(button)

    const optionAz = screen.getByText("Tên (A-Z)")
    fireEvent.click(optionAz)

    expect(onChange).toHaveBeenCalledWith({
      sort: { sortBy: "name", order: "ASC" },
    })
  })
})
