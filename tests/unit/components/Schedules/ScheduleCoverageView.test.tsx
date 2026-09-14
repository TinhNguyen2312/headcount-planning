import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { projectQueries, zoneQueries } from "@/hooks/server/projects"
import { roleQueries } from "@/hooks/server/roles"
import { scheduleQueries } from "@/hooks/server/schedules"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import ScheduleCoverageView from "@/pages/ScheduleCoveragePage"

// Mock router hooks
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
  useParams: () => ({ projectId: "1" }),
}))

// Mock API hooks
vi.mock("@/hooks/useProjectAuth")
vi.mock("@/hooks/server/projects")
vi.mock("@/hooks/server/roles")
vi.mock("@/hooks/server/schedules")

// Task-items in these tests have no checklist requirement.
vi.mock("@/services/checklists", () => ({
  ChecklistsAPI: {
    getAll: vi.fn().mockResolvedValue({ code: 0, message: "", result: [] }),
  },
}))

const mockErrorMessage = vi.fn()
vi.mock("@/hooks/useUI", () => ({
  useUI: () => ({
    message: {
      success: vi.fn(),
      error: mockErrorMessage,
      warning: vi.fn(),
    },
  }),
}))

const mockSaveMutation = {
  mutateAsync: vi.fn().mockResolvedValue({ message: "Lưu thành công" }),
  isPending: false,
}

const mockCopyMutation = {
  mutate: vi.fn(),
  isPending: false,
}

const mockGenerateMutation = {
  mutate: vi.fn(),
  isPending: false,
}

const mockMatrixData = [
  {
    projectId: 1,
    taskItemId: 101,
    taskItemTitle: "Kiểm tra hồ sơ ATLĐ",
    taskGroupId: null,
    taskGroupName: null,
    zoneId: 10,
    zoneName: "Khu Valencia",
    roleId: 5,
    roleName: "Kỹ sư ATLĐ",
    roles: [{ roleId: 5, roleName: "Kỹ sư ATLĐ" }],
    scheduledDates: [],
    availableUsers: [
      { id: 1, userId: 1, fullName: "Nguyễn Văn A", phone: "0901234567" },
    ],
  },
]

let queryClient: QueryClient
const renderView = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <ScheduleCoverageView />
    </QueryClientProvider>,
  )

describe("ScheduleCoverageView Component", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
    vi.mocked(useProjectAuth).mockReturnValue({
      user: { id: 1, full_name: "Admin" },
      isSuperUser: true,
      projectRole: "PROJECT_ADMIN",
      isProjectAdmin: true,
      isInspector: true,
      isExecutor: false,
      canEditSchedule: true,
      hasProjectRole: () => true,
      isAssignedToZone: () => true,
    } as any)
    vi.mocked(projectQueries.useDetail).mockReturnValue({
      data: { id: 1, name: "Aqua City" },
      isLoading: false,
    } as any)
    vi.mocked(projectQueries.useList).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(zoneQueries.useList).mockReturnValue({
      data: [{ id: 10, name: "Khu Valencia" }],
      items: [{ id: 10, name: "Khu Valencia" }],
      isLoading: false,
      isFetching: false,
    } as any)
    vi.mocked(zoneQueries.useDetail).mockReturnValue({
      data: { id: 10, name: "Khu Valencia" },
      isLoading: false,
      isFetching: false,
    } as any)
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: [{ id: 5, name: "Kỹ sư ATLĐ" }],
      items: [{ id: 5, name: "Kỹ sư ATLĐ" }],
      isLoading: false,
      isFetching: false,
    } as any)
    vi.mocked(roleQueries.useDetail).mockReturnValue({
      data: { id: 5, name: "Kỹ sư ATLĐ" },
      isLoading: false,
      isFetching: false,
    } as any)
    vi.mocked(scheduleQueries.useScheduleMatrix).mockReturnValue({
      data: mockMatrixData,
      isLoading: false,
      refetch: vi.fn(),
    } as any)

    vi.mocked(scheduleQueries.useSaveZoneCoverage).mockReturnValue(
      mockSaveMutation as any,
    )
    vi.mocked(scheduleQueries.useCopyScheduleWeek).mockReturnValue(
      mockCopyMutation as any,
    )
    vi.mocked(scheduleQueries.useGenerateWeekInstances).mockReturnValue(
      mockGenerateMutation as any,
    )
  })

  it("shows Access Denied message when canEditSchedule is false", () => {
    vi.mocked(useProjectAuth).mockReturnValue({
      user: { id: 1, full_name: "Admin" },
      isSuperUser: false,
      projectRole: "VIEWER",
      isProjectAdmin: false,
      isInspector: false,
      isExecutor: false,
      canEditSchedule: false,
      hasProjectRole: () => false,
      isAssignedToZone: () => true,
    } as any)

    renderView()

    expect(
      screen.getByText("Bạn không có quyền truy cập trang này."),
    ).toBeTruthy()
  })

  it("renders page header, title, and initial disabled Save button", () => {
    renderView()

    expect(screen.getByText(/Lịch làm việc - Aqua City/)).toBeTruthy()
    expect(screen.getByText("Sao chép sang tuần sau")).toBeTruthy()

    // Save button should be disabled initially (not dirty)
    const saveButton = screen.getByRole("button", {
      name: /Lưu thay đổi/,
    }) as HTMLButtonElement
    expect(saveButton.disabled).toBe(true)
  })

  it("enables Save button when cell is modified and submits batch on click", async () => {
    renderView()

    const checkboxes = screen.getAllByRole("checkbox")
    const activeCheckbox =
      checkboxes.find((cb) => !(cb as HTMLInputElement).disabled) ??
      checkboxes[checkboxes.length - 1]

    // Tick active cell -> makes state dirty
    fireEvent.click(activeCheckbox)

    // Save button becomes enabled
    const saveButton = screen.getByRole("button", {
      name: /Lưu thay đổi/,
    }) as HTMLButtonElement
    await waitFor(() => expect(saveButton.disabled).toBe(false))

    // Click Save
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(mockSaveMutation.mutateAsync).toHaveBeenCalledTimes(1),
    )
    const payload = mockSaveMutation.mutateAsync.mock.calls[0][0]
    expect(payload.schedules).toHaveLength(1)
    expect(payload.schedules[0].zoneId).toBe(10)
    expect(payload.schedules[0].taskItemId).toBe(101)
    expect(payload.schedules[0].assignments).toEqual([
      expect.objectContaining({ userId: 1 }),
    ])
  })

  it("warns user when trying to copy empty schedule without tasks", () => {
    vi.mocked(scheduleQueries.useScheduleMatrix).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)

    renderView()

    const copyButton = screen.getByText("Sao chép sang tuần sau")
    fireEvent.click(copyButton)

    const confirmButton = screen.getByRole("button", { name: "Sao chép" })
    fireEvent.click(confirmButton)

    expect(mockErrorMessage).toHaveBeenCalledWith(
      "Tuần hiện tại chưa có lịch làm việc nào để sao chép.",
    )
    expect(mockCopyMutation.mutate).not.toHaveBeenCalled()
  })
})
