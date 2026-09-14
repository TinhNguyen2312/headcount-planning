import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProjectUserActionsMenu from "@/components/Projects/ProjectUserActionsMenu"
import { projectQueries } from "@/hooks/server/projects"
import { userQueries } from "@/hooks/server/users"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import type { UserProjectRoleDetailResponse } from "@/types"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useRemoveUser: vi.fn(),
    useZones: () => ({ data: [] }),
    useUsers: () => ({ data: [] }),
    useUpdateUserRole: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAddUser: () => ({ mutateAsync: vi.fn(), isPending: false }),
  },
  userProjectRoleQueries: {
    useList: () => ({ data: [], items: [] }),
    useDetail: () => ({ data: undefined }),
  },
  zoneQueries: {
    useList: () => ({ data: { result: [] }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: { useList: () => ({ data: [] }) },
}))

vi.mock("@/hooks/server/users", () => ({
  userQueries: {
    useCancelReplacement: vi.fn(),
    useAssignReplacement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  },
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: vi.fn(),
  MANAGER_PROJECT_ROLES: ["PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR"],
}))

const mockMember: UserProjectRoleDetailResponse = {
  id: 1,
  userId: 10,
  projectId: 1,
  zoneId: null,
  roleId: 2,
  projectRole: "TASK_EXECUTOR",
  isPrimary: true,
  effectiveFrom: null,
  effectiveTo: null,
  status: "ACTIVE",
  replacementUserId: null,
  replacementFrom: null,
  replacementTo: null,
  createdBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  userFullName: "Nguyễn Văn A",
  roleName: "Chỉ huy trưởng",
  projectName: "Aqua City",
}

describe("ProjectUserActionsMenu (SCRUM-109)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useRemoveUser).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(userQueries.useCancelReplacement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useProjectAuth).mockReturnValue({ canEditSchedule: true } as any)
  })

  it("renders menu with label 'Sửa phân công khu vực' and opens edit modal on click", () => {
    render(<ProjectUserActionsMenu projectId={1} member={mockMember} />)

    const menuTrigger = screen.getByRole("button")
    fireEvent.click(menuTrigger)

    const editItem = screen.getByText("Sửa phân công khu vực")
    expect(editItem).toBeTruthy()

    fireEvent.click(editItem)
    expect(screen.getByText("Sửa phân công khu vực")).toBeTruthy()
  })
})
