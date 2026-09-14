import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ChecklistEditPage } from "@/pages/ChecklistEditPage"

const mockBlocker = {
  status: "idle",
  proceed: vi.fn(),
  reset: vi.fn(),
}

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "10" }),
  useBlocker: (_options: any) => {
    return mockBlocker
  },
}))

const mockTemplate = {
  id: 10,
  code: "FORM-001",
  name: "Checklist Mẫu Ban Đầu",
  description: null,
  itemsCount: 0,
  taskItemId: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}

const mockUpdateMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
}

const mockErrorMessage = vi.fn()
const mockSuccessMessage = vi.fn()

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: {
    useSuspenseDetail: () => ({ data: mockTemplate }),
    useUpdate: () => mockUpdateMutation,
  },
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true }),
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: () => ({
    message: {
      success: mockSuccessMessage,
      error: mockErrorMessage,
      warning: vi.fn(),
    },
  }),
}))

vi.mock("@/components/Checklists/ChecklistDetailsTable", () => ({
  default: () => <div>Checklist Items Table</div>,
}))

vi.mock("@/components/Common/TaskTreeSelect", () => ({
  TaskTreeSelect: ({ value, onChange }: any) => (
    <div data-testid="task-item-tree-select" onClick={() => onChange?.(99)}>
      TaskItem: {value ?? "none"}
    </div>
  ),
}))

describe("ChecklistEditPage (SCRUM-124 & useUnsavedChanges)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBlocker.status = "idle"
  })

  it("disables save button initially and does not have save button in PageHeader", () => {
    render(<ChecklistEditPage />)

    // PageHeader should not have extra Save button
    expect(screen.queryByRole("button", { name: /Lưu thay đổi/i })).toBeNull()

    // Card should have disabled Save button
    const cardSaveBtn = screen.getByRole("button", { name: /Lưu thông tin/i })
    expect((cardSaveBtn as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByText("Có thay đổi chưa lưu")).toBeNull()
  })

  it("enables save button and shows unsaved changes tag when user modifies code or name", () => {
    render(<ChecklistEditPage />)

    const nameInput = screen.getByLabelText(
      /Tên biểu mẫu Checklist/i,
    ) as HTMLInputElement
    fireEvent.change(nameInput, {
      target: { value: "Tên biểu mẫu đã đổi" },
    })

    const cardSaveBtn = screen.getByRole("button", { name: /Lưu thông tin/i })
    expect((cardSaveBtn as HTMLButtonElement).disabled).toBe(false)
    expect(screen.getByText("Có thay đổi chưa lưu")).toBeTruthy()
  })

  it("shows error toast when saving with empty code", async () => {
    render(<ChecklistEditPage />)

    const codeInput = screen.getByLabelText(/Mã biểu mẫu/i) as HTMLInputElement
    fireEvent.change(codeInput, { target: { value: "   " } })

    const saveButton = screen.getByRole("button", { name: /Lưu thông tin/i })
    fireEvent.click(saveButton)

    expect(mockErrorMessage).toHaveBeenCalledWith(
      "Mã biểu mẫu không được để trống",
    )
    expect(mockUpdateMutation.mutateAsync).not.toHaveBeenCalled()
  })

  it("shows error toast when saving with empty name", async () => {
    render(<ChecklistEditPage />)

    const nameInput = screen.getByLabelText(
      /Tên biểu mẫu Checklist/i,
    ) as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "" } })

    const saveButton = screen.getByRole("button", { name: /Lưu thông tin/i })
    fireEvent.click(saveButton)

    expect(mockErrorMessage).toHaveBeenCalledWith(
      "Tên biểu mẫu Checklist không được để trống",
    )
    expect(mockUpdateMutation.mutateAsync).not.toHaveBeenCalled()
  })

  it("submits mutation and displays success toast when Save button is clicked", async () => {
    render(<ChecklistEditPage />)

    const nameInput = screen.getByLabelText(
      /Tên biểu mẫu Checklist/i,
    ) as HTMLInputElement
    fireEvent.change(nameInput, {
      target: { value: "Checklist Mẫu Mới Cập Nhật" },
    })

    const saveButton = screen.getByRole("button", { name: /Lưu thông tin/i })
    fireEvent.click(saveButton)

    expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith({
      id: 10,
      data: {
        code: "FORM-001",
        name: "Checklist Mẫu Mới Cập Nhật",
        taskItemId: undefined,
      },
    })
    await waitFor(() => {
      expect(mockSuccessMessage).toHaveBeenCalledWith(
        "Cập nhật thông tin mẫu Checklist thành công!",
      )
    })
  })

  it("renders UnsavedChangesModal when blocker status is blocked", () => {
    mockBlocker.status = "blocked"
    render(<ChecklistEditPage />)

    expect(screen.getByText("Bạn có thay đổi chưa lưu")).toBeTruthy()
    expect(
      screen.getByText(
        "Nếu thoát bây giờ, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát không?",
      ),
    ).toBeTruthy()
  })
})
