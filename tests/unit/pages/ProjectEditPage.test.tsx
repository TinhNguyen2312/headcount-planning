import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { projectQueries } from "@/hooks/server/projects"
import { uploadMutations } from "@/hooks/server/uploads"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"
import ProjectEditPage from "@/pages/ProjectEditPage"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useSuspenseDetail: () => ({
      data: {
        id: 13,
        name: "Aqua - 112Ha",
        address: "Đồng Nai",
        generalInfo: "https://example.com",
        status: "ACTIVE",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        createdAt: "2024-01-01T00:00:00Z",
        thumbnail: "",
      },
    }),
    useUpdate: vi.fn(),
    useDelete: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUsers: () => ({ data: { result: [] } }),
    useAddUser: () => ({ mutateAsync: vi.fn() }),
    useRemoveUser: () => ({ mutateAsync: vi.fn() }),
    useZones: () => ({ data: { result: [] } }),
  },
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: { useList: () => ({ data: { result: [] } }) },
}))

vi.mock("@/hooks/server/uploads", () => ({
  uploadMutations: { useUploadFile: vi.fn() },
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: vi.fn(),
  MANAGER_PROJECT_ROLES: ["PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR"],
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: vi.fn(),
}))

vi.mock("@/components/Projects/ZonesSection", () => ({
  default: () => <div data-testid="zones-section" />,
}))

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
}))

describe("ProjectEditPage Component", () => {
  const mockUploadMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockUpdateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockMessage = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uploadMutations.useUploadFile).mockReturnValue(
      mockUploadMutation as any,
    )
    vi.mocked(projectQueries.useUpdate).mockReturnValue(
      mockUpdateMutation as any,
    )
    vi.mocked(useUI).mockReturnValue({ message: mockMessage } as any)
    vi.mocked(useProjectAuth).mockReturnValue({
      isSuperUser: true,
      canEditSchedule: true,
      isProjectAdmin: true,
      isInspector: false,
      isExecutor: false,
    } as any)
  })

  it("renders PageHeader with title, back button, and header actions including Upload button", () => {
    render(
      <ProjectEditPage
        projectId={13}
        onBack={vi.fn()}
        onNavigateSchedules={vi.fn()}
        onNavigateUsers={vi.fn()}
      />,
    )

    expect(screen.getByText(/Sửa dự án :/i)).toBeTruthy()
    expect(screen.getByText(/Aqua - 112Ha/i)).toBeTruthy()
    expect(screen.getByRole("button", { name: /Quay lại/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /Lịch làm việc/i })).toBeTruthy()
    expect(
      screen.getByRole("button", { name: /Quản lý nhân sự/i }),
    ).toBeTruthy()
    expect(
      screen.getAllByRole("button", { name: /Tải ảnh đại diện/i }).length,
    ).toBeGreaterThan(0)
  })

  it("handles file upload and updates project with thumbnail and existing fields", async () => {
    mockUploadMutation.mutateAsync.mockResolvedValueOnce({
      result: { fileUrl: "https://minio.example.com/new-thumb.jpg" },
    })

    const { container } = render(
      <ProjectEditPage
        projectId={13}
        onBack={vi.fn()}
        onNavigateSchedules={vi.fn()}
        onNavigateUsers={vi.fn()}
      />,
    )

    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()

    const testFile = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    })
    Object.defineProperty(fileInput, "files", {
      value: [testFile],
    })
    fireEvent.change(fileInput!)

    await vi.waitFor(() => {
      expect(mockUploadMutation.mutateAsync).toHaveBeenCalledWith(testFile)
      expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 13,
        data: {
          name: "Aqua - 112Ha",
          address: "Đồng Nai",
          generalInfo: "https://example.com",
          region: undefined,
          status: "ACTIVE",
          startDate: "2024-01-01",
          endDate: "2026-12-31",
          thumbnail: "https://minio.example.com/new-thumb.jpg",
        },
      })
    })
  })
})
