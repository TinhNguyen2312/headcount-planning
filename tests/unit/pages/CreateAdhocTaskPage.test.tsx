import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CreateAdhocTaskPage from "@/pages/CreateAdhocTaskPage"

const { mockCreateAdhocMutateAsync, mockCreateAdhocMutate } = vi.hoisted(
  () => ({
    mockCreateAdhocMutateAsync: vi.fn(),
    mockCreateAdhocMutate: vi.fn(),
  }),
)

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    user: {
      id: 1,
      fullName: "Kỹ sư Nguyễn",
      projects: [{ id: 1, roleId: 10 }],
    },
    currentProject: { id: 1, roleId: 10 },
    isSuperUser: false,
  }),
}))

vi.mock("@/hooks/useProjectSelector", () => ({
  useProjectSelector: () => ({
    projects: [{ id: 1, name: "Aqua City", roleId: 10 }],
    selectedProjectId: 1,
    setSelectedProjectId: vi.fn(),
  }),
}))

vi.mock("@/hooks/useSubordinateAssignment", () => ({
  useSubordinateAssignment: () => ({
    canAssignOthers: false,
    isAssignableUser: () => true,
  }),
  default: () => ({
    canAssignOthers: false,
    isAssignableUser: () => true,
  }),
}))

vi.mock("@/hooks/useZoneAccess", () => ({
  useZoneAccess: () => ({
    hasFullProjectAccess: true,
    filterZone: () => true,
    isAssignableZone: () => true,
  }),
  default: () => ({
    hasFullProjectAccess: true,
    filterZone: () => true,
    isAssignableZone: () => true,
  }),
}))

vi.mock("@/hooks/server/taskInstances", () => ({
  taskInstanceQueries: {
    useCreateAdhoc: () => ({
      mutateAsync: mockCreateAdhocMutateAsync.mockResolvedValue({}),
      mutate: mockCreateAdhocMutate,
      isPending: false,
    }),
  },
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useList: () => ({
      data: [{ id: 1, name: "Aqua City" }],
      items: [{ id: 1, name: "Aqua City" }],
    }),
    useDetail: () => ({ data: { id: 1, name: "Aqua City" } }),
  },
  zoneQueries: {
    useList: () => ({ data: [], items: [] }),
    useDetail: () => ({ data: null }),
  },
}))

vi.mock("@/components/Common/InfiniteSelect", () => ({
  InfiniteSelect: () => <div data-testid="infinite-select" />,
  default: () => <div data-testid="infinite-select" />,
}))

vi.mock("@/components/Common/ProjectFilterSelect", () => ({
  default: () => <div data-testid="project-filter-select" />,
}))

vi.mock("@/components/Common/TaskTreeSelect", () => ({
  TaskTreeSelect: ({ value, onChange, placeholder }: any) => (
    <div
      data-testid="task-item-tree-select"
      onClick={() =>
        onChange?.(100, {
          title: "Nghiệp vụ Test",
          slaHours: 8,
          approvalLevel: 2,
        })
      }
    >
      {value ? `TaskItem: ${value}` : placeholder}
    </div>
  ),
}))

describe("CreateAdhocTaskPage (SCRUM-127)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders form with required markers on TaskItem, Title, and WorkDate", () => {
    render(<CreateAdhocTaskPage />)

    const titleLabel = screen.getByText(/Tiêu đề công việc/i)
    expect(
      titleLabel.closest("label")?.classList.contains("ant-form-item-required"),
    ).toBe(true)

    const taskItemLabel = screen.getByText(/Danh mục nghiệp vụ/i)
    expect(
      taskItemLabel
        .closest("label")
        ?.classList.contains("ant-form-item-required"),
    ).toBe(true)

    const workDateLabel = screen.getByText(/Ngày thực hiện/i)
    expect(
      workDateLabel
        .closest("label")
        ?.classList.contains("ant-form-item-required"),
    ).toBe(true)
  })

  it("validates taskItemId and title fields when submitted empty", async () => {
    render(<CreateAdhocTaskPage />)

    const submitButtons = screen.getAllByRole("button", { name: /Giao việc/i })
    fireEvent.click(submitButtons[0])

    await waitFor(() => {
      expect(screen.getByText("Vui lòng chọn danh mục nghiệp vụ")).toBeTruthy()
      expect(screen.getByText("Vui lòng nhập tiêu đề công việc")).toBeTruthy()
    })
    expect(mockCreateAdhocMutateAsync).not.toHaveBeenCalled()
  })

  it("submits successfully when taskItem and all required fields are provided", async () => {
    render(<CreateAdhocTaskPage />)

    // Select taskItem
    const taskItemTree = screen.getByTestId("task-item-tree-select")
    fireEvent.click(taskItemTree)

    // Submit form
    const submitButtons = screen.getAllByRole("button", { name: /Giao việc/i })
    fireEvent.click(submitButtons[0])

    await waitFor(() => {
      expect(mockCreateAdhocMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 1,
          assignedUserId: 1,
          title: "Nghiệp vụ Test",
          taskItemId: 100,
          roleId: 10,
        }),
      )
    })
  })

  it("automatically assigns to current user when cannot assign others and renders disabled input with full name", () => {
    render(<CreateAdhocTaskPage />)
    const input = screen.getByLabelText(
      /Nhân sự được giao việc/i,
    ) as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.disabled).toBe(true)
    expect(input.value).toBe("Kỹ sư Nguyễn (Chính mình)")
  })
})
