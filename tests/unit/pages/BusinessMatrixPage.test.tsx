import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import BusinessMatrixPage from "@/pages/BusinessMatrixPage"
import type { BusinessMatrixResponse } from "@/types"

let mockMatrixResult: any = { code: 1000, message: "Success", result: [] }

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true, hasProjectRole: () => true }),
  MANAGER_PROJECT_ROLES: ["PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR"],
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: {
    useList: vi.fn(() => ({
      data: {
        code: 1000,
        message: "Success",
        result: [{ id: 1, name: "GĐ/PGĐ" }],
      },
    })),
  },
}))

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: {
    useList: vi.fn(() => ({
      data: {
        code: 1000,
        message: "Success",
        result: [
          { id: 10, code: "CK-01", name: "Checklist 01", taskItemId: null },
        ],
      },
    })),
  },
}))

vi.mock("@/hooks/server/taskItems", () => ({
  taskItemQueries: {
    useSuspenseBusinessMatrix: vi.fn(() => ({ data: mockMatrixResult })),
    useCreate: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdate: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useDelete: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  },
}))

const mockData: BusinessMatrixResponse[] = [
  {
    id: 1,
    parentTaskId: null,
    title: "Giai đoạn Chuẩn bị",
    workType: null,
    approvalLevel: 0,
    slaHours: null,
    escalateLevel: null,
    requirementType: null,
    label: null,
    roles: [],
    requirements: [],
    children: [
      {
        id: 2,
        parentTaskId: 1,
        title: "Khảo sát mặt bằng",
        workType: null,
        approvalLevel: 1,
        slaHours: 24,
        escalateLevel: "HIGH",
        requirementType: "IMAGE",
        label: "Ảnh hiện trạng",
        roles: [{ roleId: 1, roleName: "GĐ/PGĐ" }],
        requirements: [{ requirementType: "IMAGE", label: "Ảnh hiện trạng" }],
        children: [],
      },
    ],
  },
]

describe("BusinessMatrixPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMatrixResult = { code: 1000, message: "Success", result: [] }
  })

  it("renders empty state when no data", () => {
    mockMatrixResult = { code: 1000, message: "Success", result: [] }

    render(<BusinessMatrixPage />)
    expect(
      screen.getByText("Chưa có bộ công việc nào được thiết lập."),
    ).toBeTruthy()
  })

  it("renders tree items with custom expand/collapse icon and toggles child rows", () => {
    mockMatrixResult = { code: 1000, message: "Success", result: mockData }

    render(<BusinessMatrixPage />)

    expect(screen.getByText(/Giai đoạn Chuẩn bị/)).toBeTruthy()
    expect(screen.getByText(/Khảo sát mặt bằng/)).toBeTruthy()

    const collapseButtons = screen.getAllByRole("button", { name: "Thu gọn" })
    expect(collapseButtons.length).toBe(1)

    fireEvent.click(collapseButtons[0])

    const expandButtons = screen.getAllByRole("button", { name: "Mở rộng" })
    expect(expandButtons.length).toBe(1)

    fireEvent.click(expandButtons[0])
    expect(screen.getAllByRole("button", { name: "Thu gọn" }).length).toBe(1)
  })
})
