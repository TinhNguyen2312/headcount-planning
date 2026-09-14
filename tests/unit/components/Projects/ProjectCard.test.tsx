import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProjectCard from "@/components/Projects/ProjectCard"
import { projectQueries } from "@/hooks/server/projects"
import type { ProjectResponse } from "@/types"

const mockNavigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: { useDelete: vi.fn() },
}))

const mockProject: ProjectResponse = {
  id: 13,
  name: "Aqua - 112Ha",
  address: "Biên Hòa, Đồng Nai",
  generalInfo: "https://example.com/aqua-112",
  region: "VUNG_DONG_NAI_1",
  status: "ACTIVE",
  startDate: "2024-01-01",
  endDate: "2026-12-31",
  createdAt: "2024-01-01T00:00:00Z",
  thumbnail: "",
}

const mockDeleteMutation = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
}

describe("ProjectCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useDelete).mockReturnValue(
      mockDeleteMutation as any,
    )
  })

  it("renders project information correctly", () => {
    render(<ProjectCard project={mockProject} />)

    expect(screen.getByText("Aqua - 112Ha")).toBeTruthy()
    expect(screen.getByText("Biên Hòa, Đồng Nai")).toBeTruthy()
    expect(screen.getByText("Vùng Đồng Nai 1")).toBeTruthy()
    expect(screen.getByText("Khởi công: 01/01/2024")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Chỉnh sửa/i })).toBeTruthy()
    expect(screen.getByLabelText("Xóa dự án")).toBeTruthy()
  })

  it("renders fallback text when address and startDate are missing", () => {
    const emptyProject: ProjectResponse = {
      ...mockProject,
      address: null,
      startDate: null,
    }
    render(<ProjectCard project={emptyProject} />)

    expect(screen.getByText("Chưa có địa chỉ")).toBeTruthy()
    expect(screen.getByText("Khởi công: Chưa cập nhật")).toBeTruthy()
  })

  it("navigates to project edit page on click 'Chỉnh sửa'", () => {
    render(<ProjectCard project={mockProject} />)

    const editBtn = screen.getByRole("button", { name: /Chỉnh sửa/i })
    fireEvent.click(editBtn)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/projects/$projectId/edit",
      params: { projectId: "13" },
    })
  })

  it("triggers delete mutation when confirming deletion in Popconfirm", async () => {
    render(<ProjectCard project={mockProject} />)

    const deleteBtn = screen.getByLabelText("Xóa dự án")
    fireEvent.click(deleteBtn)

    // Wait for popconfirm to display
    const confirmBtn = await screen.findByRole("button", { name: "Xóa" })
    expect(confirmBtn).toBeTruthy()

    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(13)
    })
  })
})
