import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CreateTemplateDialog from "@/components/Checklists/CreateTemplateDialog"

const mockMutate = vi.fn()

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true, hasProjectRole: () => true }),
}))

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: {
    useCreate: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
  },
}))

const mockTreeData = [
  {
    id: 1,
    title: "1. Nhóm Công tác thi công",
    parentTaskId: null,
    children: [
      {
        id: 10,
        title: "1.1. Công tác giàn giáo",
        parentTaskId: 1,
        children: [
          {
            id: 101,
            title: "1.1.1. Nghiệm thu lắp dựng giàn giáo",
            parentTaskId: 10,
            children: [],
          },
        ],
      },
    ],
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

describe("CreateTemplateDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders trigger button and opens modal when clicked", () => {
    render(<CreateTemplateDialog />)

    const openBtn = screen.getByText("Tạo mẫu mới")
    expect(openBtn).toBeTruthy()

    fireEvent.click(openBtn)
    expect(screen.getByText("Tạo Mẫu Checklist Mới")).toBeTruthy()
    expect(screen.getByText("Nghiệp vụ áp dụng *")).toBeTruthy()
    expect(screen.getByText("Mã biểu mẫu *")).toBeTruthy()
    expect(screen.getByText("Tên biểu mẫu *")).toBeTruthy()
  })

  it("disables submit button when required fields are missing", () => {
    render(<CreateTemplateDialog />)

    fireEvent.click(screen.getByText("Tạo mẫu mới"))

    const submitBtn = screen.getByRole("button", { name: "Xác nhận" })
    expect(submitBtn.hasAttribute("disabled")).toBe(true)
  })
})
