import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TaskTreeSelect, {
  sanitizeTaskItemTree,
} from "@/components/Common/TaskTreeSelect"
import type { BusinessMatrixResponse } from "@/types"

const mockTreeData: any[] = [
  {
    id: 208,
    parentTaskId: null,
    title: "Quản lý tiến độ thi công dự án",
    children: [
      {
        id: 215,
        parentTaskId: 208,
        title:
          "Phê duyệt tiến độ thi công tổng thể/chi tiết của gói thầu/hạng mục",
        children: [],
      },
    ],
  },
  // Leaked child node at root level (the bug reported by user)
  {
    id: 215,
    parentTaskId: 208,
    title: "Phê duyệt tiến độ thi công tổng thể/chi tiết của gói thầu/hạng mục",
    children: [],
  },
  {
    id: 209,
    parentTaskId: null,
    title: "Kiểm soát an toàn lao động, vệ sinh môi trường",
    children: [],
  },
  // Another leaked child node at root level
  {
    id: 216,
    parentTaskId: 208,
    title:
      "Kiểm tra nhân lực, máy móc, vật tư, thiết bị thực tế của Nhà thầu so với kế hoạch",
    children: [],
  },
]

vi.mock("@/hooks/server/taskItems", () => ({
  taskItemQueries: {
    useTree: () => ({
      data: mockTreeData,
      isLoading: false,
    }),
  },
}))

describe("TaskTreeSelect", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  it("renders with placeholder and handles value selection", () => {
    const handleChange = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <TaskTreeSelect
          placeholder="Chọn nghiệp vụ..."
          value={null}
          onChange={handleChange}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByText("Chọn nghiệp vụ...")).toBeDefined()
  })

  describe("sanitizeTaskItemTree", () => {
    it("filters out leaked child tasks from root level while preserving children inside parents", () => {
      const sanitized = sanitizeTaskItemTree(
        mockTreeData as BusinessMatrixResponse[],
      )

      // Root level must only contain nodes without parentTaskId
      expect(sanitized).toHaveLength(2)
      expect(sanitized.map((n) => n.id)).toEqual([208, 209])

      // Parent 208 must have both child 215 and child 216
      const parent208 = sanitized.find((n) => n.id === 208)
      expect(parent208?.children).toHaveLength(2)
      expect(parent208?.children.map((c) => c.id)).toContain(215)
      expect(parent208?.children.map((c) => c.id)).toContain(216)
    })

    it("reconstructs tree from a completely flat list", () => {
      const flatList: any[] = [
        { id: 1, parentTaskId: null, title: "Parent 1", children: [] },
        { id: 2, parentTaskId: 1, title: "Child 1.1", children: [] },
        { id: 3, parentTaskId: 1, title: "Child 1.2", children: [] },
        { id: 4, parentTaskId: null, title: "Parent 2", children: [] },
      ]

      const sanitized = sanitizeTaskItemTree(
        flatList as BusinessMatrixResponse[],
      )
      expect(sanitized).toHaveLength(2)
      expect(sanitized.map((n) => n.id)).toEqual([1, 4])
      expect(sanitized[0].children).toHaveLength(2)
      expect(sanitized[0].children.map((c) => c.id)).toEqual([2, 3])
    })

    it("returns clean tree untouched when no child tasks are at root level", () => {
      const cleanTree: any[] = [
        {
          id: 1,
          parentTaskId: null,
          title: "Parent 1",
          children: [
            { id: 2, parentTaskId: 1, title: "Child 1.1", children: [] },
          ],
        },
      ]

      const sanitized = sanitizeTaskItemTree(
        cleanTree as BusinessMatrixResponse[],
      )
      expect(sanitized).toBe(cleanTree)
    })
  })
})
