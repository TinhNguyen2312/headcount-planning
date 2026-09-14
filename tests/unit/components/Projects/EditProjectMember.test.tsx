import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditProjectMember from "@/components/Projects/EditProjectMember"
import { projectQueries } from "@/hooks/server/projects"
import { mockProjectMember, mockZones } from "./setup"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useUsers: vi.fn(),
    useAddUser: vi.fn(),
    useUpdateUserRole: vi.fn(),
    useRemoveUser: vi.fn(),
    useZones: () => ({ data: mockZones }),
  },
  zoneQueries: {
    useList: () => ({ data: { result: mockZones }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

describe("EditProjectMember Component", () => {
  const mockAddRole = vi.fn()
  const mockUpdateRole = vi.fn()
  const mockRemoveRole = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: [mockProjectMember] as any,
    } as any)
    vi.mocked(projectQueries.useAddUser).mockReturnValue({
      mutateAsync: mockAddRole,
      isPending: false,
    } as any)
    vi.mocked(projectQueries.useUpdateUserRole).mockReturnValue({
      mutateAsync: mockUpdateRole,
      isPending: false,
    } as any)
    vi.mocked(projectQueries.useRemoveUser).mockReturnValue({
      mutateAsync: mockRemoveRole,
      isPending: false,
    } as any)
  })

  it("renders modal with current assigned zones and member details", () => {
    render(
      <EditProjectMember
        projectId={1}
        member={mockProjectMember}
        open={true}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText("Sửa khu vực phụ trách")).toBeTruthy()
    expect(screen.getByDisplayValue("Kỹ sư QLXD")).toBeTruthy()
    expect(screen.getAllByText("Zone 1").length).toBeGreaterThanOrEqual(1)
  })
})
