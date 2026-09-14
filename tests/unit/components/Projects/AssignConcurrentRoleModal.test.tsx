import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AssignConcurrentRoleModal from "@/components/Projects/AssignConcurrentRoleModal"
import { projectQueries } from "@/hooks/server/projects"
import { mockProjectMember, mockRoles, mockZones } from "./setup"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useUsers: vi.fn(),
    useAddUser: vi.fn(),
    useRemoveUser: vi.fn(),
    useZones: () => ({ data: mockZones }),
  },
  zoneQueries: {
    useList: () => ({ data: { result: mockZones }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: {
    useList: () => ({ data: { result: mockRoles }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

describe("AssignConcurrentRoleModal Component", () => {
  const mockAddUser = vi.fn()
  const mockRemoveUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: [mockProjectMember] as any,
    } as any)
    vi.mocked(projectQueries.useAddUser).mockReturnValue({
      mutateAsync: mockAddUser,
      isPending: false,
    } as any)
    vi.mocked(projectQueries.useRemoveUser).mockReturnValue({
      mutate: mockRemoveUser,
      isPending: false,
    } as any)
  })

  it("renders modal with member name and current role in table", () => {
    render(
      <AssignConcurrentRoleModal
        projectId={1}
        member={mockProjectMember}
        open={true}
        onCancel={vi.fn()}
      />,
    )
    expect(
      screen.getByText(
        `Kiêm nhiệm chức danh - ${mockProjectMember.userFullName}`,
      ),
    ).toBeTruthy()
    expect(screen.getByText("Kỹ sư QLXD")).toBeTruthy()
  })

  it("renders role select and zone select fields", () => {
    render(
      <AssignConcurrentRoleModal
        projectId={1}
        member={mockProjectMember}
        open={true}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText("Chức danh kiêm nhiệm")).toBeTruthy()
    expect(
      screen.getByText(/Khu vực phụ trách \(có thể chọn nhiều\)/i),
    ).toBeTruthy()
  })
})
