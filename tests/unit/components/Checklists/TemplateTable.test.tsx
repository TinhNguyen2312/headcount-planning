import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TemplateTable from "@/components/Checklists/TemplateTable"
import type { ChecklistResponse } from "@/types"

const mockMutateAsync = vi.fn()
const mockDeleteMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true, hasProjectRole: () => true }),
}))

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: {
    useUpdate: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
    useDelete: () => ({
      mutate: mockDeleteMutate,
      isPending: false,
    }),
  },
}))

const mockTemplates: ChecklistResponse[] = [
  {
    id: 1,
    code: "NVLG-PCD-CHECKLIST - F1.1",
    name: "Kiểm tra nhân lực, máy móc thi công",
    custodianDepartment: "Ban Quản lý Thi công",
    recipients: "BQLDA",
    taskItemId: 216,
    taskItemTitle: "Kiểm tra nhân lực, máy móc, vật tư",
    createdAt: "2026-08-22T00:00:00Z",
  },
]

describe("TemplateTable Inline Edit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders checklist rows correctly", () => {
    render(<TemplateTable templates={mockTemplates} />)

    expect(screen.getByText("NVLG-PCD-CHECKLIST - F1.1")).toBeTruthy()
    expect(screen.getByText("Kiểm tra nhân lực, máy móc thi công")).toBeTruthy()
    expect(screen.getByText("Kiểm tra nhân lực, máy móc, vật tư")).toBeTruthy()
    expect(screen.getByText("Ban Quản lý Thi công")).toBeTruthy()
  })

  it("enters inline edit mode when clicking edit button", async () => {
    render(<TemplateTable templates={mockTemplates} />)

    const editBtn = screen.getByTitle("Sửa nhanh")
    fireEvent.click(editBtn)

    expect(
      screen.getByDisplayValue("Kiểm tra nhân lực, máy móc thi công"),
    ).toBeTruthy()
    expect(screen.getByDisplayValue("Ban Quản lý Thi công")).toBeTruthy()
    expect(screen.getByTitle("Lưu")).toBeTruthy()
    expect(screen.getByTitle("Hủy")).toBeTruthy()
  })

  it("submits updated values when clicking save button", async () => {
    mockMutateAsync.mockResolvedValue({})

    render(<TemplateTable templates={mockTemplates} />)

    fireEvent.click(screen.getByTitle("Sửa nhanh"))

    const nameInput = screen.getByDisplayValue(
      "Kiểm tra nhân lực, máy móc thi công",
    )
    fireEvent.change(nameInput, {
      target: { value: "Kiểm tra nhân lực mới" },
    })

    const saveBtn = screen.getByTitle("Lưu")
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        data: {
          name: "Kiểm tra nhân lực mới",
          custodianDepartment: "Ban Quản lý Thi công",
          recipients: "BQLDA",
          description: null,
        },
      })
    })
  })

  it("cancels edit mode without submitting when clicking cancel button", () => {
    render(<TemplateTable templates={mockTemplates} />)

    fireEvent.click(screen.getByTitle("Sửa nhanh"))
    expect(screen.getByTitle("Hủy")).toBeTruthy()

    fireEvent.click(screen.getByTitle("Hủy"))

    expect(screen.queryByTitle("Lưu")).toBeNull()
    expect(screen.getByTitle("Sửa nhanh")).toBeTruthy()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
