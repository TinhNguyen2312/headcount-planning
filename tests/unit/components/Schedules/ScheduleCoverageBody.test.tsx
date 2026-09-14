import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ScheduleCoverageBody from "@/components/Schedules/ScheduleCoverageBody"
import type { ScheduleMatrixResponse } from "@/types"

vi.mock("@/hooks/useUI", () => ({
  useUI: vi.fn(() => ({
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  })),
}))

// Task-items in these tests have no checklist requirement.
vi.mock("@/services/checklists", () => ({
  ChecklistsAPI: {
    getAll: vi.fn().mockResolvedValue({ code: 0, message: "", result: [] }),
  },
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useZones: vi.fn(() => ({
      data: [
        { id: 10, name: "Khu A" },
        { id: 11, name: "Khu B" },
      ],
    })),
    useUsers: vi.fn(() => ({ data: [] })),
  },
  zoneQueries: {
    useList: vi.fn(() => ({
      data: [
        { id: 10, name: "Khu A" },
        { id: 11, name: "Khu B" },
      ],
      items: [
        { id: 10, name: "Khu A" },
        { id: 11, name: "Khu B" },
      ],
      isFetching: false,
    })),
    useDetail: vi.fn((id) => ({
      data: id === 10 ? { id: 10, name: "Khu A" } : { id: 11, name: "Khu B" },
      isFetching: false,
    })),
  },
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: {
    useList: vi.fn(() => ({
      data: [
        { id: 5, name: "Kỹ sư ATLĐ" },
        { id: 6, name: "Kỹ sư ME" },
      ],
      items: [
        { id: 5, name: "Kỹ sư ATLĐ" },
        { id: 6, name: "Kỹ sư ME" },
      ],
      isFetching: false,
    })),
    useDetail: vi.fn((id) => ({
      data:
        id === 5 ? { id: 5, name: "Kỹ sư ATLĐ" } : { id: 6, name: "Kỹ sư ME" },
      isFetching: false,
    })),
  },
}))

vi.mock("@/hooks/server/taskItems", () => ({
  taskItemQueries: {
    useTree: vi.fn(() => ({
      data: [
        {
          id: 10,
          title: "Kiểm soát an toàn",
          children: [
            {
              id: 101,
              title: "Kiểm tra hồ sơ thanh toán",
              children: [],
            },
          ],
        },
      ],
      isLoading: false,
    })),
  },
}))

const futureISODate = (offsetDays: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const makeItem = (
  overrides: Partial<ScheduleMatrixResponse>,
): ScheduleMatrixResponse => ({
  projectId: 1,
  taskItemId: 101,
  taskItemTitle: "Kiểm tra hồ sơ thanh toán",
  taskGroupId: 10,
  taskGroupName: "Kiểm soát an toàn",
  zoneId: 10,
  zoneName: "Khu A",
  roleId: 5,
  roleName: "Kỹ sư ATLĐ",
  roles: [{ roleId: 5, roleName: "Kỹ sư ATLĐ" }],
  scheduledDates: [],
  availableUsers: [
    { userId: 1, id: 1, fullName: "Nguyễn Văn A", phone: "0901234567" },
  ],
  ...overrides,
})

const itemA = makeItem({
  taskItemId: 101,
  taskItemTitle: "Kiểm tra hồ sơ thanh toán",
  zoneId: 10,
  zoneName: "Khu A",
})

const itemB = makeItem({
  taskItemId: 102,
  taskItemTitle: "Kiểm tra hiện trường",
  taskGroupId: null,
  taskGroupName: null,
  zoneId: 11,
  zoneName: "Khu B",
  roleId: 6,
  roleName: "Kỹ sư ME",
  roles: [{ roleId: 6, roleName: "Kỹ sư ME" }],
})

let queryClient: QueryClient
const renderBody = (onChange: (items: ScheduleMatrixResponse[]) => void) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ScheduleCoverageBody
        matrixRows={[itemA, itemB]}
        isLoading={false}
        weekStart={futureISODate(0)}
        onChange={onChange}
      />
    </QueryClientProvider>,
  )

describe("ScheduleCoverageBody Component", () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ""
  })

  it("editing a visible row while another row is hidden by a filter still emits the full row set", async () => {
    const handleChange = vi.fn()
    renderBody(handleChange)

    // Both rows visible before filtering.
    expect(screen.getByText("Kiểm tra hồ sơ thanh toán")).toBeTruthy()
    expect(screen.getByText("Kiểm tra hiện trường")).toBeTruthy()

    // Filter down to zone "Khu A" only — hides itemB from the table.
    // Combobox order in the filter bar: TaskTreeSelect, zone, role.
    const comboboxes = screen.getAllByRole("combobox")
    const zoneSelect = comboboxes[1]
    fireEvent.mouseDown(zoneSelect)
    const zoneOptions = await screen.findAllByText("Khu A")
    fireEvent.click(zoneOptions[zoneOptions.length - 1])

    expect(screen.getByText("Kiểm tra hồ sơ thanh toán")).toBeTruthy()
    expect(screen.queryByText("Kiểm tra hiện trường")).toBeNull()

    // Tick itemA's first cell (single candidate -> auto-assigned).
    const checkboxes = screen.getAllByRole("checkbox")
    fireEvent.click(checkboxes[0])

    await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(1))
    const updatedItems: ScheduleMatrixResponse[] = handleChange.mock.calls[0][0]

    // itemB must still be present and untouched even though it was hidden by the filter.
    expect(updatedItems).toHaveLength(2)
    const updatedItemB = updatedItems.find((r) => r.taskItemId === 102)
    expect(updatedItemB).toBeTruthy()
    expect(updatedItemB?.scheduledDates).toHaveLength(0)

    const updatedItemA = updatedItems.find((r) => r.taskItemId === 101)
    expect(
      updatedItemA?.scheduledDates.some(
        (sd) => sd.workDate === futureISODate(0),
      ),
    ).toBe(true)
    expect(updatedItemA?.scheduledDates[0].assigned[0].id).toBe(1)
  })

  it("renders TaskTreeSelect without free-text search input", () => {
    const handleChange = vi.fn()
    renderBody(handleChange)

    // Free-text search input should NOT exist
    expect(
      screen.queryByPlaceholderText(
        "Tìm kiếm nghiệp vụ, phân khu, chức danh...",
      ),
    ).toBeNull()

    // TaskTreeSelect should be rendered
    expect(screen.getByText("Tất cả nghiệp vụ / nhóm...")).toBeTruthy()
  })

  it("filters visible rows when selecting a role via InfiniteSelect", async () => {
    const handleChange = vi.fn()
    renderBody(handleChange)

    expect(screen.getByText("Kiểm tra hồ sơ thanh toán")).toBeTruthy()
    expect(screen.getByText("Kiểm tra hiện trường")).toBeTruthy()

    // Combobox order: 0: task, 1: zone, 2: role
    const comboboxes = screen.getAllByRole("combobox")
    const roleSelect = comboboxes[2]
    fireEvent.mouseDown(roleSelect)
    const roleOptions = await screen.findAllByText("Kỹ sư ATLĐ")
    fireEvent.click(roleOptions[roleOptions.length - 1])

    expect(screen.getByText("Kiểm tra hồ sơ thanh toán")).toBeTruthy()
    expect(screen.queryByText("Kiểm tra hiện trường")).toBeNull()
  })
})
