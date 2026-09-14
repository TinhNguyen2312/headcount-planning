import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DashboardSuperAdmin from "@/components/Dashboard/DashboardSuperAdmin"

const {
  mockProjectQueries,
  mockUserQueries,
  mockChecklistQueries,
  mockRoleQueries,
  mockReportQueries,
} = vi.hoisted(() => ({
  mockProjectQueries: { useList: vi.fn() },
  mockUserQueries: { useList: vi.fn() },
  mockChecklistQueries: { useList: vi.fn() },
  mockRoleQueries: { useList: vi.fn() },
  mockReportQueries: { useProgress: vi.fn(), useOverdue: vi.fn() },
}))

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    user: { fullName: "Nguyễn Văn A" },
    isSuperUser: true,
  }),
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: mockProjectQueries,
}))

vi.mock("@/hooks/server/users", () => ({
  userQueries: mockUserQueries,
}))

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: mockChecklistQueries,
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: mockRoleQueries,
}))

vi.mock("@/hooks/server/reports", () => ({
  reportQueries: mockReportQueries,
}))

describe("DashboardSuperAdmin (SCRUM-125)", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockProjectQueries.useList.mockReturnValue({
      data: [{ id: 1, name: "Aqua City" }],
      meta: { totalElements: 12, totalPages: 12, page: 0, size: 1 },
      isLoading: false,
    })

    mockUserQueries.useList.mockReturnValue({
      data: [],
      meta: { totalElements: 32, totalPages: 32, page: 0, size: 1 },
      isLoading: false,
    })

    mockChecklistQueries.useList.mockReturnValue({
      data: [{ id: 1, name: "Checklist 1" }],
      meta: { totalElements: 16, totalPages: 16, page: 0, size: 1 },
      isLoading: false,
    })

    mockRoleQueries.useList.mockReturnValue({
      data: [{ id: 1, name: "Role 1" }],
      meta: { totalElements: 14, totalPages: 14, page: 0, size: 1 },
      isLoading: false,
    })

    mockReportQueries.useProgress.mockReturnValue({
      data: {
        projectId: 1,
        projectName: "Aqua City",
        totalTasks: 100,
        completedTasks: 75,
        completionRate: 75,
        zonesProgress: [
          {
            zoneId: 10,
            zoneName: "Phân khu 1",
            totalTasks: 50,
            completedTasks: 40,
            completionRate: 80,
          },
        ],
      },
      isLoading: false,
    })

    mockReportQueries.useOverdue.mockReturnValue({
      data: [],
      isLoading: false,
    })
  })

  it("renders correct KPI totals based on meta.totalElements (16 for checklists, 12 for projects, 32 for users, 14 for roles)", () => {
    render(<DashboardSuperAdmin />)

    // Check project total (12, not data.length 1)
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByText("Tổng Dự án")).toBeTruthy()

    // Check user total (32)
    expect(screen.getByText("32")).toBeTruthy()
    expect(screen.getByText("Tổng Nhân sự")).toBeTruthy()

    // Check checklist total (16, not data.length 1 or default pagination 10)
    expect(screen.getByText("16")).toBeTruthy()
    expect(screen.getByText("Biểu mẫu Checklist")).toBeTruthy()

    // Check role total (14)
    expect(screen.getByText("14")).toBeTruthy()
    expect(screen.getByText("Chức danh Chuyên môn")).toBeTruthy()
  })

  it("passes limit: 1 parameter to list queries for optimal metadata fetching", () => {
    render(<DashboardSuperAdmin />)

    expect(mockProjectQueries.useList).toHaveBeenCalledWith({ limit: 1 })
    expect(mockUserQueries.useList).toHaveBeenCalledWith({ limit: 1 })
    expect(mockChecklistQueries.useList).toHaveBeenCalledWith({ limit: 1 })
    expect(mockRoleQueries.useList).toHaveBeenCalledWith({ limit: 1 })
  })

  it("renders project progress and overdue SLA section correctly", () => {
    render(<DashboardSuperAdmin />)

    expect(
      screen.getByText("Tiến độ Hoàn thành theo Dự án & Phân khu"),
    ).toBeTruthy()
    expect(screen.getByText("Toàn dự án (Aqua City)")).toBeTruthy()
    expect(screen.getByText("Phân khu 1")).toBeTruthy()
    expect(
      screen.getByText("✓ Hiện không có thẻ việc nào bị trễ hạn SLA."),
    ).toBeTruthy()
  })
})
