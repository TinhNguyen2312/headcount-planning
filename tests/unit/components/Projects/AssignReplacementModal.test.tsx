import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AssignReplacementModal from "@/components/Projects/AssignReplacementModal"
import { userProjectRoleQueries } from "@/hooks/server/projects"
import { userQueries } from "@/hooks/server/users"
import type { UserProjectRoleDetailResponse } from "@/types"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: { useUsers: vi.fn() },
  userProjectRoleQueries: {
    useList: vi.fn(),
  },
}))

vi.mock("@/hooks/server/users", () => ({
  userQueries: {
    useAssignReplacement: vi.fn(),
    useList: vi.fn(),
    useDetail: vi.fn(() => ({
      data: undefined,
      isFetching: false,
      isLoading: false,
    })),
  },
}))

const mockMember: UserProjectRoleDetailResponse = {
  id: 1,
  userId: 10,
  projectId: 1,
  zoneId: null,
  roleId: 5,
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
  userFullName: "Bùi Thiên Phú",
  roleName: "Kỹ sư Giám sát Xây dựng",
  projectName: "Aqua City",
}

const mockProjectMembers = [
  {
    id: 10,
    userId: 10,
    fullName: "Bùi Thiên Phú",
    userFullName: "Bùi Thiên Phú",
    roleId: 5,
    roleName: "Kỹ sư Giám sát Xây dựng",
    status: "ACTIVE",
  },
  {
    id: 20,
    userId: 20,
    fullName: "Trần Văn Đồng Nghiệp",
    userFullName: "Trần Văn Đồng Nghiệp",
    roleId: 5,
    roleName: "Kỹ sư Giám sát Xây dựng",
    status: "ACTIVE",
  },
  {
    id: 30,
    userId: 30,
    fullName: "Lê Văn Thư Ký",
    userFullName: "Lê Văn Thư Ký",
    roleId: 99,
    roleName: "Thư ký Công trường",
    status: "ACTIVE",
  },
]

describe("AssignReplacementModal (SCRUM-76)", () => {
  let queryClient: QueryClient
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.mocked(userProjectRoleQueries.useList).mockReturnValue({
      data: { result: mockProjectMembers },
      isFetching: false,
    } as any)
    vi.mocked(userQueries.useDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any)
    vi.mocked(userQueries.useAssignReplacement).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it("filters replacement options to only include active members with matching roleId and projectId", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AssignReplacementModal
          projectId={1}
          member={mockMember}
          open={true}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByText(/Gán Nhân sự Thay thế Tạm thời/)).toBeTruthy()
    expect(screen.getByText("Bùi Thiên Phú")).toBeTruthy()
    expect(userProjectRoleQueries.useList).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 1,
        roleId: 5,
        status: "ACTIVE",
      }),
      expect.anything(),
    )

    // Open combobox
    fireEvent.mouseDown(screen.getByRole("combobox"))

    // Eligible member with same roleId and different userId should appear
    expect(screen.getByText(/Trần Văn Đồng Nghiệp/)).toBeTruthy()

    // The member himself should NOT appear as an option in the list
    expect(
      screen.queryByText(/Bùi Thiên Phú \(Kỹ sư Giám sát Xây dựng\)/),
    ).toBeNull()

    // Member with different roleId (99) should NOT appear
    expect(screen.queryByText(/Lê Văn Thư Ký/)).toBeNull()
  })
})
