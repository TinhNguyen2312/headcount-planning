import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AccConditionRuleRow from "@/components/BusinessMatrix/AccConditionRuleRow"
import type { FactorFieldDef } from "@/components/BusinessMatrix/accConditionConfig"

const mockFields: FactorFieldDef[] = [
  { key: "type", label: "Type (Loại đệ trình)", placeholder: "Nhập loại..." },
  { key: "package", label: "Package (Gói thầu)", placeholder: "Nhập gói..." },
]

describe("AccConditionRuleRow", () => {
  const onFieldChange = vi.fn()
  const onValueChange = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders with rule value and placeholder correctly", () => {
    render(
      <AccConditionRuleRow
        rule={{ id: "1", field: "type", value: "Thi công" }}
        fields={mockFields}
        onFieldChange={onFieldChange}
        onValueChange={onValueChange}
        onDelete={onDelete}
      />,
    )

    const valueInput = screen.getByDisplayValue("Thi công")
    expect(valueInput).toBeTruthy()

    fireEvent.change(valueInput, { target: { value: "Kiểm tra" } })
    expect(onValueChange).toHaveBeenCalledWith("Kiểm tra")
  })

  it("renders select options from predefined fields and handles field change", () => {
    render(
      <AccConditionRuleRow
        rule={{ id: "1", field: "type", value: "" }}
        fields={mockFields}
        onFieldChange={onFieldChange}
        onValueChange={onValueChange}
        onDelete={onDelete}
      />,
    )

    // Mở dropdown Select
    const selectCombobox = screen.getByRole("combobox")
    expect(selectCombobox).toBeTruthy()

    // Chọn option 'Package (Gói thầu)'
    fireEvent.mouseDown(selectCombobox)
    const packageOption = screen.getByTitle("Package (Gói thầu)")
    expect(packageOption).toBeTruthy()
    fireEvent.click(packageOption)

    expect(onFieldChange).toHaveBeenCalledWith("package")
  })

  it("calls onDelete when delete button is clicked", () => {
    render(
      <AccConditionRuleRow
        rule={{ id: "1", field: "type", value: "" }}
        fields={mockFields}
        onFieldChange={onFieldChange}
        onValueChange={onValueChange}
        onDelete={onDelete}
      />,
    )

    const deleteBtn = screen.getByRole("button", { name: "" })
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalled()
  })
})
