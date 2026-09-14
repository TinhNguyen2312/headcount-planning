import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { userScheduleQueries } from "@/hooks/server/userSchedules"
import { userQueries } from "@/hooks/server/users"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import SchedulePersonalCoverageView from "@/pages/PersonalScheduleCoveragePage"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
  useParams: () => ({ projectId: "1", userId: "5" }),
}))

vi.mock("@/hooks/useProjectAuth")
vi.mock("@/hooks/server/users")
vi.mock("@/hooks/server/userSchedules")

// Task-items in these tests have no checklist requirement.
vi.mock("@/services/checklists", () => ({
  ChecklistsAPI: {
    getAll: vi.fn().mockResolvedValue({ code: 0, message: "", result: [] }),
  },
}))

const futureISODate = (offsetDays: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const mockPageData = {
  projectId: 1,
  user: { id: 5, fullName: "Nguyễn Văn A" },
  roleId: 2,
  roleName: "Kỹ sư ATLĐ",
  zones: [],
  tasks: [],
}

const mockCoverage = {
  projectId: 1,
  weekStart: futureISODate(0),
  weekEnd: futureISODate(6),
  rows: [
    {
      taskItemId: 101,
      taskTitle: "Kiểm tra hồ sơ",
      groupPath: [],
      zoneId: 10,
      zoneName: "Khu Valencia",
      roleId: 2,
      roleName: "Kỹ sư ATLĐ",
      roleNames: ["Kỹ sư ATLĐ"],
      staffed: true,
      days: Array.from({ length: 7 }, (_, i) => ({
        date: futureISODate(i),
        weekday: i,
        scheduled: false,
        assignedUserIds: [],
        assignedUserNames: [],
        candidates: [
          { userId: 5, fullName: "Nguyễn Văn A", phone: "0900000000" },
        ],
      })),
    },
  ],
}

const mockMutateAsync = vi.fn().mockResolvedValue({ message: "Lưu thành công" })

let queryClient: QueryClient
const renderView = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <SchedulePersonalCoverageView />
    </QueryClientProvider>,
  )

describe("SchedulePersonalCoverageView", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
    vi.mocked(userQueries.useDetail).mockReturnValue({
      data: mockPageData.user,
      isLoading: false,
    } as any)
    vi.mocked(userScheduleQueries.usePersonalCoverageMatrix).mockReturnValue({
      data: mockCoverage,
      isLoading: false,
    } as any)
    vi.mocked(userScheduleQueries.useSavePersonalCoverage).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it("shows unauthorized access when canViewPersonalSchedule is false", () => {
    vi.mocked(useProjectAuth).mockReturnValue({
      canViewPersonalSchedule: false,
      canManagePersonalSchedule: false,
    } as any)

    renderView()

    expect(
      screen.getByText("Bạn không có quyền truy cập trang này."),
    ).toBeTruthy()
  })

  it("renders read-only matrix without a Save button for view-only roles", () => {
    vi.mocked(useProjectAuth).mockReturnValue({
      canViewPersonalSchedule: true,
      canManagePersonalSchedule: false,
      isSuperUser: false,
      isProjectAdmin: false,
      hasProjectRole: () => false,
      isAssignedToZone: () => true,
    } as any)

    renderView()

    expect(screen.getByText("Kiểm tra hồ sơ")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Lưu thay đổi/ })).toBeNull()

    const checkboxes = screen.getAllByRole("checkbox")
    fireEvent.click(checkboxes[0])
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it("lets a manager toggle a day and save, pinned to the target user", async () => {
    vi.mocked(useProjectAuth).mockReturnValue({
      canViewPersonalSchedule: true,
      canManagePersonalSchedule: true,
      isSuperUser: false,
      isProjectAdmin: false,
      hasProjectRole: () => false,
      isAssignedToZone: () => true,
    } as any)

    renderView()

    const checkboxes = screen.getAllByRole("checkbox")
    fireEvent.click(checkboxes[0])

    const saveButton = screen.getByRole("button", {
      name: /Lưu thay đổi/,
    }) as HTMLButtonElement
    await waitFor(() => expect(saveButton.disabled).toBe(false))

    fireEvent.click(saveButton)

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1))
    const payload = mockMutateAsync.mock.calls[0][0]
    expect(payload.schedules).toHaveLength(1)
    expect(payload.schedules[0].zoneId).toBe(10)
    expect(payload.schedules[0].taskItemId).toBe(101)
    // Personal page always assigns to the target user, regardless of candidates.
    expect(payload.schedules[0].assignedUserIds).toEqual([5])
  })
})
