import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AccConditionCell from "@/components/BusinessMatrix/AccConditionCell"
import type { BusinessMatrixResponse } from "@/types"

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true }),
}))

const createMockRecord = (
  accCondition: string | null = 'submittal[type="Thi công"ORpackage="Gói 1"]',
): BusinessMatrixResponse => ({
  id: 101,
  parentTaskId: 1,
  title: "Giám sát hoàn thiện",
  stt: "1.1",
  workType: null,
  taskType: "FREQUENCY",
  accCondition,
  approvalLevel: 1,
  slaHours: 24,
  escalateLevel: "HIGH",
  requirementType: "IMAGE",
  label: "Ảnh",
  roles: [],
  requirements: [],
  children: [],
})

describe("AccConditionCell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("opens modal, deletes a field, saves, and does not show the deleted field when reopened", async () => {
    const record = createMockRecord()
    const onSave = vi.fn().mockImplementation((newCondition) => {
      // simulate parent onSave behavior
      record.accCondition = newCondition
      return Promise.resolve()
    })

    const { rerender, unmount } = render(
      <AccConditionCell record={record} onSave={onSave} />,
    )

    // 1. Mở modal lần đầu
    fireEvent.click(screen.getByRole("button", { name: "Cấu hình ACC" }))

    expect(screen.getByDisplayValue("Thi công")).toBeTruthy()
    expect(screen.getByDisplayValue("Gói 1")).toBeTruthy()

    // 2. Xóa trường thứ 2 ('package')
    const deleteButtons = screen.getAllByRole("button", { name: "" })
    // Nút xóa thứ 2 (dòng Gói 1)
    fireEvent.click(deleteButtons[1])

    expect(screen.queryByDisplayValue("Gói 1")).toBeNull()
    expect(screen.getByDisplayValue("Thi công")).toBeTruthy()

    // 3. Bấm Lưu
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('submittal[type="Thi công"]')
    })

    // Parent nhận được update và truyền record mới xuống
    rerender(
      <AccConditionCell
        record={{ ...record, accCondition: 'submittal[type="Thi công"]' }}
        onSave={onSave}
      />,
    )

    // 4. Mở lại modal: trường 'Gói 1' tuyệt đối không còn xuất hiện
    fireEvent.click(screen.getByRole("button", { name: "Cấu hình ACC" }))

    expect(screen.getByDisplayValue("Thi công")).toBeTruthy()
    expect(screen.queryByDisplayValue("Gói 1")).toBeNull()

    unmount()
  })
})
