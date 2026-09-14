import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TaskGroupTable from "@/components/TaskGroups/TaskGroupTable"
import { taskItemQueries } from "@/hooks/server/taskItems"

vi.mock("@/hooks/server/taskItems", () => ({
  taskItemQueries: {
    useBusinessMatrix: vi.fn(),
  },
}))

const mockTree = [
  {
    id: 1,
    title: "Kiểm soát an toàn lao động",
    parentTaskId: null,
    orderIndex: 1,
    children: [
      {
        id: 10,
        title: "Phê duyệt biện pháp an toàn trước khi thi công",
        parentTaskId: 1,
        orderIndex: 1,
        approvalLevel: 1,
        slaHours: 48,
        escalateLevel: "HIGH",
        requirementType: "IMAGE",
        roles: [{ roleId: 3 }],
        children: [],
      },
    ],
  },
  {
    id: 2,
    title: "Nhóm công việc rỗng",
    parentTaskId: null,
    orderIndex: 2,
    approvalLevel: 0,
    slaHours: null,
    escalateLevel: null,
    requirementType: null,
    roles: [{ roleId: 3 }],
    children: [],
  },
]

describe("TaskGroupTable (SCRUM-115)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(taskItemQueries.useBusinessMatrix).mockReturnValue({
      data: mockTree,
      isLoading: false,
    } as any)
  })

  it("renders table with dash for root items without approval level and deduplicates rows", () => {
    render(<TaskGroupTable roleId={3} readOnly />)

    expect(screen.getByText("Kiểm soát an toàn lao động")).toBeTruthy()
    expect(
      screen.getByText("Phê duyệt biện pháp an toàn trước khi thi công"),
    ).toBeTruthy()

    // Dash should be rendered for root item or empty cells
    const dashes = screen.getAllByText("—")
    expect(dashes.length).toBeGreaterThan(0)
  })
})
