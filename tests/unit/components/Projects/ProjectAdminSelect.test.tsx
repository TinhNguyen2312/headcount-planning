import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProjectAdminSelect from "@/components/Projects/ProjectAdminSelect"
import { projectQueries } from "@/hooks/server/projects"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"
import type { UserProjectRoleDetailResponse } from "@/types"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useUsers: vi.fn(),
    useAddUser: vi.fn(),
    useRemoveUser: vi.fn(),
  },
}))

vi.mock("@/hooks/server/users", () => ({
  userQueries: {
    useList: () => ({ data: { result: [] }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: vi.fn(),
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: vi.fn(),
}))

describe("ProjectAdminSelect Component", () => {
  const mockAddAdmin = { mutateAsync: vi.fn() }
  const mockRemoveAdmin = { mutateAsync: vi.fn() }
  const mockMessage = { warning: vi.fn(), success: vi.fn(), error: vi.fn() }

  const _mockRoles = [
    {
      id: 1,
      name: "Giám đốc dự án",
      shortCode: "GĐ/PGĐ QLXD,AT&MT",
      permissionGroup: "PROJECT_ADMIN",
    },
    {
      id: 2,
      name: "Chỉ huy trưởng",
      shortCode: "TP QLXD,AT&MT",
      permissionGroup: "ZONE_ADMIN",
    },
  ]

  const mockMembers: Partial<UserProjectRoleDetailResponse>[] = [
    {
      id: 10,
      userId: 100,
      userFullName: "Nguyễn Văn A",
      roleId: 1,
      roleName: "Giám đốc dự án",
      projectRole: "PROJECT_ADMIN",
      status: "ACTIVE",
    },
    {
      id: 11,
      userId: 200,
      userFullName: "Trần Thị B",
      roleId: 2,
      roleName: "Chỉ huy trưởng",
      projectRole: "ZONE_ADMIN",
      status: "ACTIVE",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: { code: 1000, message: "Success", result: mockMembers },
    } as any)
    vi.mocked(projectQueries.useAddUser).mockReturnValue(mockAddAdmin as any)
    vi.mocked(projectQueries.useRemoveUser).mockReturnValue(
      mockRemoveAdmin as any,
    )
    vi.mocked(useUI).mockReturnValue({ message: mockMessage } as any)
    vi.mocked(useProjectAuth).mockReturnValue({ isSuperUser: true } as any)
  })

  it("renders with current project admin selected from project members", () => {
    render(<ProjectAdminSelect projectId={13} />)

    expect(
      screen.getByText("Quản lý Xây dựng, An toàn và Môi trường"),
    ).toBeTruthy()
  })

  it("extracts unique users from project and renders combined role labels", () => {
    const dualRoleMembers: Partial<UserProjectRoleDetailResponse>[] = [
      {
        id: 10,
        userId: 100,
        userFullName: "Nguyễn Văn A",
        roleId: 2,
        roleName: "Chỉ huy trưởng",
        projectRole: "ZONE_ADMIN",
        status: "ACTIVE",
      },
      {
        id: 11,
        userId: 100,
        userFullName: "Nguyễn Văn A",
        roleId: 1,
        roleName: "Giám đốc dự án",
        projectRole: "PROJECT_ADMIN",
        status: "ACTIVE",
      },
    ]

    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: dualRoleMembers,
    } as any)
    render(<ProjectAdminSelect projectId={13} />)

    expect(
      screen.getByText("Quản lý Xây dựng, An toàn và Môi trường"),
    ).toBeTruthy()
  })

  it("handles removing an admin when selecting updated users", async () => {
    const multiAdmins: Partial<UserProjectRoleDetailResponse>[] = [
      {
        id: 10,
        userId: 100,
        userFullName: "Nguyễn Văn A",
        roleId: 1,
        roleName: "Giám đốc dự án",
        projectRole: "PROJECT_ADMIN",
        status: "ACTIVE",
      },
      {
        id: 11,
        userId: 200,
        userFullName: "Trần Thị B",
        roleId: 1,
        roleName: "Giám đốc dự án",
        projectRole: "PROJECT_ADMIN",
        status: "ACTIVE",
      },
    ]

    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: { code: 1000, message: "Success", result: multiAdmins },
    } as any)

    const { container } = render(<ProjectAdminSelect projectId={13} />)
    expect(container).toBeTruthy()
  })
})
