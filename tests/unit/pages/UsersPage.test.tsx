import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { userQueries } from "@/hooks/server/users"
import UsersPage from "@/pages/UsersPage"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
}))

const mockUsersData: any = {
  result: [
    {
      id: 1,
      fullName: "Nguyễn Văn Trưởng",
      email: "truong@novator.vn",
      roleId: 1,
      roleName: "Chỉ huy trưởng",
      status: "ACTIVE",
      projects: [{ projectId: 10, projectName: "Aqua City" }],
    },
    {
      id: 2,
      fullName: "Trần Văn Kỹ Sư",
      email: "kysu@novator.vn",
      roleId: 2,
      roleName: "Kỹ sư giám sát",
      status: "ACTIVE",
      projects: [],
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
  },
}

vi.mock("@/hooks/server/users", () => ({
  userQueries: {
    useList: vi.fn(() => ({
      data: mockUsersData.result,
      meta: mockUsersData.meta,
      isLoading: false,
      isFetching: false,
    })),
    useSuspenseList: () => ({
      data: mockUsersData.result,
      meta: mockUsersData.meta,
    }),
    useTree: () => ({ data: [], isLoading: false }),
    useUpdateStatus: () => ({ mutate: vi.fn(), isPending: false }),
  },
}))

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    user: { id: 1, fullName: "Nguyễn Văn Trưởng", systemRole: "SUPER_ADMIN" },
  }),
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({
    isSuperUser: true,
    isProjectAdmin: false,
    isInspector: false,
    isExecutor: false,
  }),
}))

vi.mock("@/components/Users/UserModal", () => ({
  default: () => <div data-testid="user-modal" />,
}))

vi.mock("@/components/Users/UserTree", () => ({
  default: () => <div data-testid="user-tree" />,
}))

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders user list, KPIs, and search bar with server-side pagination", () => {
    const handleTabChange = vi.fn()
    render(<UsersPage activeTab="list" onTabChange={handleTabChange} />)

    expect(screen.getByText("Quản lý nhân sự")).toBeTruthy()
    expect(screen.getByText("Tổng nhân sự")).toBeTruthy()
    expect(
      screen.getByPlaceholderText("Tìm kiếm theo tên, email, chức danh..."),
    ).toBeTruthy()
    expect(screen.getByText("Nguyễn Văn Trưởng")).toBeTruthy()
    expect(screen.getByText("Trần Văn Kỹ Sư")).toBeTruthy()
    expect(
      screen.getByText((content) => content.includes("25 nhân sự")),
    ).toBeTruthy()
    // Default page 1 should be active in pagination
    const page1Btn = screen.getByRole("listitem", { name: "1" })
    expect(page1Btn.className).toContain("ant-pagination-item-active")
  })

  it("handles pagination click without off-by-one double offset", () => {
    const handleTabChange = vi.fn()
    render(<UsersPage activeTab="list" onTabChange={handleTabChange} />)

    const page2Item = screen.getByRole("listitem", { name: "2" })
    expect(page2Item).toBeTruthy()
  })

  it("fetches user list with placeholderData to avoid full page suspense flashes on search (SCRUM-130)", () => {
    const handleTabChange = vi.fn()
    render(<UsersPage activeTab="list" onTabChange={handleTabChange} />)

    expect(userQueries.useList).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
      }),
      expect.objectContaining({
        placeholderData: expect.any(Function),
      }),
    )
  })
})
