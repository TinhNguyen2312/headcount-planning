import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ImportChecklistModal from "@/components/Checklists/Import/ImportChecklistModal"
import * as checklistParserModule from "@/lib/excel"

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true, hasProjectRole: () => true }),
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: () => ({
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  }),
}))

vi.mock("@/hooks/server/taskItems", () => ({
  taskItemQueries: {
    useTree: () => ({
      data: [
        {
          id: 101,
          title: "Kiểm tra hiện trường",
          children: [],
        },
      ],
      isLoading: false,
    }),
  },
}))

describe("ImportChecklistModal", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it("renders the Import Excel button and opens modal upon uploading a file", async () => {
    vi.spyOn(
      checklistParserModule,
      "parseChecklistExcel",
    ).mockResolvedValueOnce([
      {
        sheetName: "F1.2.01",
        code: "F1.2.01",
        name: "Kiểm tra Kế hoạch ngày",
        description: "KSCC Giám sát",
        taskItemId: null,
        items: [
          {
            id: "item-1",
            orderIndex: 1,
            title: "Rà soát danh mục nghiệm thu",
            checkingMethod: "Đối chiếu kế hoạch",
            requirementType: "none",
          },
        ],
      },
    ])

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ImportChecklistModal />
      </QueryClientProvider>,
    )

    const importBtn = screen.getByRole("button", { name: /Import Excel/i })
    expect(importBtn).toBeDefined()

    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).not.toBeNull()

    const file = new File(["dummy content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } })
    }

    await waitFor(() => {
      expect(screen.getByText("Import Checklist")).toBeDefined()
      expect(screen.getByText("Tìm thấy 1 checklist")).toBeDefined()
      expect(screen.getByText("F1.2.01")).toBeDefined()
    })
  })
})
