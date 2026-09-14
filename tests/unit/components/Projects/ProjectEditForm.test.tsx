import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProjectEditForm from "@/components/Projects/ProjectEditForm"
import { projectQueries } from "@/hooks/server/projects"
import { roleQueries } from "@/hooks/server/roles"
import { useUI } from "@/hooks/useUI"
import type { ProjectResponse } from "@/types"

let mockBlockerStatus = "idle"
const mockProceed = vi.fn()
const mockReset = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useBlocker: () => ({
    status: mockBlockerStatus,
    proceed: mockProceed,
    reset: mockReset,
  }),
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useUpdate: vi.fn(),
    useDelete: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
    useUsers: vi.fn(),
    useAddUser: vi.fn(),
    useRemoveUser: vi.fn(),
  },
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: { useList: vi.fn() },
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: vi.fn(),
}))

const mockProject: ProjectResponse = {
  id: 13,
  name: "Aqua City",
  address: "Đồng Nai",
  generalInfo: "https://aquacity.example.com",
  region: "VUNG_DONG_NAI_1",
  status: "ACTIVE",
  startDate: "2024-01-01",
  endDate: "2026-12-31",
  thumbnail: "https://example.com/thumb.jpg",
  createdAt: "2024-01-01T00:00:00Z",
}

const mockUpdateMutation = {
  mutate: vi.fn(),
  isPending: false,
}

describe("ProjectEditForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBlockerStatus = "idle"

    vi.mocked(projectQueries.useUpdate).mockReturnValue(
      mockUpdateMutation as any,
    )
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: [
        { id: 1, name: "Giám đốc dự án", permissionGroup: "PROJECT_ADMIN" },
      ],
    } as any)
    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: [
        {
          id: 10,
          userId: 100,
          userFullName: "Nguyễn Văn A",
          roleName: "Giám đốc dự án",
          status: "ACTIVE",
          projectRole: "PROJECT_ADMIN",
        },
      ],
    } as any)
    vi.mocked(projectQueries.useAddUser).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)
    vi.mocked(projectQueries.useRemoveUser).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)
    vi.mocked(useUI).mockReturnValue({
      message: { warning: vi.fn(), success: vi.fn(), error: vi.fn() },
    } as any)
  })

  it("renders form fields with initial project values", () => {
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    expect(screen.getByDisplayValue("Aqua City")).toBeTruthy()
    expect(screen.getByDisplayValue("Đồng Nai")).toBeTruthy()
    expect(
      screen.getByDisplayValue("https://aquacity.example.com"),
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeTruthy()
  })

  it("submits update mutation when form is submitted", async () => {
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    const nameInput = screen.getByDisplayValue("Aqua City")
    fireEvent.change(nameInput, { target: { value: "Aqua City Updated" } })

    const saveButton = screen.getByRole("button", { name: "Lưu thay đổi" })
    fireEvent.click(saveButton)

    await waitFor(
      () => {
        expect(mockUpdateMutation.mutate).toHaveBeenCalledTimes(1)
        const callArg = mockUpdateMutation.mutate.mock.calls[0][0]
        expect(callArg.id).toBe(13)
        expect(callArg.data.name).toBe("Aqua City Updated")
        expect(callArg.data.thumbnail).toBe("https://example.com/thumb.jpg")
      },
      { timeout: 8000 },
    )
  })

  it("renders UnsavedChangesModal when navigation is blocked and triggers confirmLeave / cancelLeave", () => {
    mockBlockerStatus = "blocked"
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    expect(screen.getByText("Bạn có thay đổi chưa lưu")).toBeTruthy()
    expect(
      screen.getByText(
        "Nếu thoát bây giờ, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát không?",
      ),
    ).toBeTruthy()

    const leaveButton = screen.getByRole("button", { name: "Thoát" })
    fireEvent.click(leaveButton)
    expect(mockProceed).toHaveBeenCalledTimes(1)

    const stayButton = screen.getByRole("button", { name: "Ở lại" })
    fireEvent.click(stayButton)
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it("rejects invalid generalInfo URL", async () => {
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    const urlInput = screen.getByDisplayValue("https://aquacity.example.com")
    fireEvent.change(urlInput, { target: { value: "not-a-valid-url" } })

    const saveButton = screen.getByRole("button", { name: "Lưu thay đổi" })
    fireEvent.click(saveButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Đường dẫn không hợp lệ/)).toBeTruthy()
        expect(mockUpdateMutation.mutate).not.toHaveBeenCalled()
      },
      { timeout: 8000 },
    )
  })

  it("hides 'Mở trang' link when generalInfo is empty", () => {
    render(
      <ProjectEditForm
        project={{ ...mockProject, generalInfo: "" }}
        viewOnly={false}
      />,
    )

    expect(screen.queryByText("Mở trang")).toBeNull()
  })

  it("rejects 1-character project name", async () => {
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    const nameInput = screen.getByDisplayValue("Aqua City")
    fireEvent.change(nameInput, { target: { value: "A" } })

    const saveButton = screen.getByRole("button", { name: "Lưu thay đổi" })
    fireEvent.click(saveButton)

    await waitFor(
      () => {
        expect(screen.getByText("Tên dự án tối thiểu 2 ký tự")).toBeTruthy()
        expect(mockUpdateMutation.mutate).not.toHaveBeenCalled()
      },
      { timeout: 8000 },
    )
  })

  it("rejects whitespace-only project name", async () => {
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    const nameInput = screen.getByDisplayValue("Aqua City")
    fireEvent.change(nameInput, { target: { value: "   " } })

    const saveButton = screen.getByRole("button", { name: "Lưu thay đổi" })
    fireEvent.click(saveButton)

    await waitFor(
      () => {
        expect(screen.getByText("Vui lòng nhập tên dự án")).toBeTruthy()
        expect(mockUpdateMutation.mutate).not.toHaveBeenCalled()
      },
      { timeout: 8000 },
    )
  })

  it("renders Delete Project button when not viewOnly", () => {
    render(<ProjectEditForm project={mockProject} viewOnly={false} />)

    expect(screen.getByRole("button", { name: /Xóa dự án/ })).toBeTruthy()
  })
})
