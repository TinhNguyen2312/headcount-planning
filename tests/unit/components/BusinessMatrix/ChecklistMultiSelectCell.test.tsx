import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ChecklistMultiSelectCell from "@/components/BusinessMatrix/ChecklistMultiSelectCell"
import { checklistQueries } from "@/hooks/server/checklists"

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: { useList: vi.fn() },
}))

const mockTemplates = [
  {
    id: 1,
    code: "CK-FREE",
    name: "Checklist Rảnh",
    taskItemId: null,
    createdAt: "2026-01-01",
  },
  {
    id: 2,
    code: "CK-MINE",
    name: "Checklist Của Task",
    taskItemId: 100,
    createdAt: "2026-01-01",
  },
  {
    id: 3,
    code: "CK-OTHER",
    name: "Checklist Task Khác",
    taskItemId: 999,
    createdAt: "2026-01-01",
  },
]

describe("ChecklistMultiSelectCell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checklistQueries.useList).mockReturnValue({
      items: mockTemplates,
      data: mockTemplates,
      isLoading: false,
    } as any)
  })

  it("renders empty dash in view mode when no checklist is assigned", () => {
    render(<ChecklistMultiSelectCell taskId={200} checklists={[]} />)
    expect(screen.getByText("—")).toBeTruthy()
  })

  it("renders checklist tags when direct checklists prop exists", () => {
    const checklists = [
      {
        id: 2,
        code: "CK-MINE",
        name: "Checklist Của Task",
        createdAt: "2026-01-01",
      },
    ]
    render(
      <ChecklistMultiSelectCell taskId={100} checklists={checklists as any} />,
    )
    expect(screen.getByText("CK-MINE")).toBeTruthy()
  })

  it("resolves assigned checklists from query data when taskId matches", () => {
    render(<ChecklistMultiSelectCell taskId={100} />)
    expect(screen.getByText("CK-MINE")).toBeTruthy()
  })
})
