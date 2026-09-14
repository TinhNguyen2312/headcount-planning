import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AccConditionModal from "@/components/BusinessMatrix/AccConditionModal"
import type { BusinessMatrixResponse } from "@/types"

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true }),
}))

const mockRecord: BusinessMatrixResponse = {
  id: 123,
  parentTaskId: 1,
  title: "Giám sát thi công hoàn thiện",
  stt: "1.1",
  workType: null,
  taskType: "FREQUENCY",
  accCondition: 'submittal[type="Thi công"ORtype="Kiểm tra"]',
  approvalLevel: 1,
  slaHours: 24,
  escalateLevel: "HIGH",
  requirementType: "IMAGE",
  label: "Ảnh",
  roles: [],
  requirements: [],
  children: [],
}

describe("AccConditionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders modal with title 'Cấu hình ACC' and prefilled condition rows", () => {
    render(
      <AccConditionModal
        open={true}
        record={mockRecord}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByText("Cấu hình ACC")).toBeTruthy()
    expect(screen.getByText(/1\.1\. Giám sát thi công hoàn thiện/)).toBeTruthy()

    const inputs = screen.getAllByRole("textbox")
    expect(inputs.length).toBeGreaterThanOrEqual(2)
    expect((inputs[0] as HTMLInputElement).value).toBe("Thi công")
    expect((inputs[1] as HTMLInputElement).value).toBe("Kiểm tra")
  })

  it("submits compiled accCondition when clicking Lưu", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(
      <AccConditionModal
        open={true}
        record={mockRecord}
        onClose={onClose}
        onSave={onSave}
      />,
    )

    const saveButton = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        'submittal[type="Thi công"ORtype="Kiểm tra"]',
      )
    })
  })

  it("submits empty string when all condition rules are deleted", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <AccConditionModal
        open={true}
        record={mockRecord}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    )

    // Xóa cả 2 điều kiện
    const deleteButtons = screen.getAllByRole("button", { name: "" })
    fireEvent.click(deleteButtons[0])
    fireEvent.click(deleteButtons[1])

    const saveButton = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("")
    })
  })

  it("calls onClose when clicking Hủy", () => {
    const onClose = vi.fn()
    render(
      <AccConditionModal
        open={true}
        record={mockRecord}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    )

    const cancelButton = screen.getByRole("button", { name: "Hủy" })
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })
})
