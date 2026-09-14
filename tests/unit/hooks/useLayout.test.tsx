import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useAuth from "@/hooks/useAuth"
import { useLayout } from "@/hooks/useLayout"
import type { UserMeResponse } from "@/types"

const mockNavigate = vi.fn()
let mockPathname = "/my-task"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useRouterState: ({ select }: any) =>
    select({ location: { pathname: mockPathname } }),
}))

vi.mock("@/hooks/useAuth", () => ({
  default: vi.fn(),
}))

vi.mock("@/keyboard", () => ({
  useShortcuts: vi.fn(),
}))

describe("useLayout hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = "/my-task"
  })

  it("renders SUPER_ADMIN menu with 'Dự án' and without 'Công việc của tôi'", () => {
    const superUser: UserMeResponse = {
      id: 1,
      fullName: "Super Admin",
      email: "admin@novagroup.vn",
      phone: null,
      status: "ACTIVE",
      systemRole: "SUPER_ADMIN",
      perNumber: "SA01",
      novatorStatus: 1,
      departmentCode: "IT",
      divisionCode: "DIV1",
      managerPerNumber: null,
      provider: "LOCAL",
      createdAt: "2026-01-01T00:00:00Z",
      projects: [],
      currentProject: null,
      role: "SUPER_ADMIN",
    }

    vi.mocked(useAuth).mockReturnValue({
      user: superUser,
    } as any)

    const { result } = renderHook(() => useLayout())

    const topKeys = result.current.topMenuItems.map((item) => item.key)
    expect(topKeys).toContain("projects")
    expect(topKeys).not.toContain("my-task")

    const projectsItem = result.current.topMenuItems.find(
      (item) => item.key === "projects",
    )
    expect(projectsItem?.label).toBe("Dự án")

    result.current.navigateHome()
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" })
  })

  it("renders 'Dự án của tôi' for non-superadmin users with a pinned project", () => {
    const projectAdminUser: UserMeResponse = {
      id: 2,
      fullName: "Project Admin User",
      email: "pa@novagroup.vn",
      phone: null,
      status: "ACTIVE",
      systemRole: "USER",
      perNumber: "PA01",
      novatorStatus: 1,
      departmentCode: "QLDA",
      divisionCode: "DIV1",
      managerPerNumber: null,
      provider: "LOCAL",
      createdAt: "2026-01-01T00:00:00Z",
      projects: [
        {
          id: 42,
          name: "Aqua City",
          roleId: 1,
          roleName: "GĐDA",
          projectRole: "PROJECT_ADMIN",
        },
      ],
      currentProject: {
        id: 42,
        name: "Aqua City",
        roleId: 1,
        roleName: "GĐDA",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    }

    vi.mocked(useAuth).mockReturnValue({
      user: projectAdminUser,
    } as any)

    const { result } = renderHook(() => useLayout())

    const topKeys = result.current.topMenuItems.map((item) => item.key)
    expect(topKeys).toContain("my-task")
    expect(topKeys).toContain("projects")

    const projectsItem = result.current.topMenuItems.find(
      (item) => item.key === "projects",
    )
    expect(projectsItem?.label).toBe("Dự án của tôi")

    projectsItem?.onClick?.()
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/projects/$projectId/edit",
      params: { projectId: "42" },
    })
  })

  it("matches active item correctly when navigating inside /projects sub-routes", () => {
    const projectAdminUser: UserMeResponse = {
      id: 2,
      fullName: "Project Admin User",
      email: "pa@novagroup.vn",
      phone: null,
      status: "ACTIVE",
      systemRole: "USER",
      perNumber: "PA01",
      novatorStatus: 1,
      departmentCode: "QLDA",
      divisionCode: "DIV1",
      managerPerNumber: null,
      provider: "LOCAL",
      createdAt: "2026-01-01T00:00:00Z",
      projects: [
        {
          id: 42,
          name: "Aqua City",
          roleId: 1,
          roleName: "GĐDA",
          projectRole: "PROJECT_ADMIN",
        },
      ],
      currentProject: {
        id: 42,
        name: "Aqua City",
        roleId: 1,
        roleName: "GĐDA",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    }

    vi.mocked(useAuth).mockReturnValue({
      user: projectAdminUser,
    } as any)

    mockPathname = "/projects/42/users"

    const { result } = renderHook(() => useLayout())

    expect(result.current.activeKey).toBe("projects")
    // activeLabel reflects the static MENU_ITEMS label; only the rendered
    // menu item (topMenuItems/bottomMenuItems) gets the "của tôi" override
    expect(result.current.activeLabel).toBe("Dự án")
  })
})
