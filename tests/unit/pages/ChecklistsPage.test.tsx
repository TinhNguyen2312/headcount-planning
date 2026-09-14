import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ChecklistsPage from "@/pages/ChecklistsPage"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

const mockChecklistsData: any = {
  result: [
    {
      id: 1,
      code: "NVLG-PCD-CHECKLIST - F1.1",
      name: "Kiểm tra nhân lực máy móc",
      custodianDepartment: "Ban QLXD",
      recipients: "BQLDA",
      taskItemId: 216,
      taskItemTitle: "Kiểm tra nhân lực",
      createdAt: "2026-08-22T00:00:00Z",
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 16,
    totalPages: 2,
  },
}

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: {
    useSuspenseList: () => ({ data: mockChecklistsData }),
    useUpdate: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useDelete: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  },
}))

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true }),
}))

vi.mock("@/components/Checklists/CreateTemplateDialog", () => ({
  default: () => <button type="button">Tạo biểu mẫu mới</button>,
}))

vi.mock("@/components/Checklists/Import/ImportChecklistModal", () => ({
  default: () => <button type="button">Import Excel</button>,
}))

vi.mock("@/components/Checklists/TemplateItemsDialog", () => ({
  default: () => <div>Template Items Dialog</div>,
}))

describe("ChecklistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders checklist items and pagination when data loaded", () => {
    render(<ChecklistsPage />)

    expect(screen.getByText("Quản lý Checklist")).toBeTruthy()
    expect(screen.getByText("NVLG-PCD-CHECKLIST - F1.1")).toBeTruthy()
    expect(screen.getByText("Kiểm tra nhân lực máy móc")).toBeTruthy()
    expect(
      screen.getByText((content) => content.includes("16 mẫu checklist")),
    ).toBeTruthy()
  })
})
