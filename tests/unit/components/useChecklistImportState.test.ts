import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useChecklistImportState } from "@/components/Checklists/Import/useChecklistImportState"
import type { ParsedChecklistTemplate } from "@/types"

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

describe("useChecklistImportState", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const sampleTemplates: ParsedChecklistTemplate[] = [
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
    {
      sheetName: "F1.2.02",
      code: "F1.2.02",
      name: "Kiểm tra Kế hoạch tuần",
      description: "KSCC Giám sát",
      taskItemId: null,
      items: [
        {
          id: "item-2",
          orderIndex: 1,
          title: "Đánh giá tiến độ tuần",
          checkingMethod: "File tracking",
          requirementType: "FILE",
        },
      ],
    },
  ]

  it("should initialize with empty state and load parsed templates", () => {
    const { result } = renderHook(() => useChecklistImportState())

    expect(result.current.templates).toEqual([])
    expect(result.current.validationStatus.isAllValid).toBe(false)

    act(() => {
      result.current.loadParsedTemplates("test.xlsx", sampleTemplates)
    })

    expect(result.current.templates).toHaveLength(2)
    expect(result.current.fileName).toBe("test.xlsx")
    expect(result.current.activeTemplate?.code).toBe("F1.2.01")
    expect(result.current.validationStatus.validCount).toBe(0)
    expect(result.current.validationStatus.isAllValid).toBe(false)
  })

  it("should update active template fields and recalculate validation", () => {
    const { result } = renderHook(() => useChecklistImportState())

    act(() => {
      result.current.loadParsedTemplates("test.xlsx", sampleTemplates)
    })

    act(() => {
      result.current.updateActiveTemplate({ taskItemId: 100 })
    })

    expect(result.current.templates[0].taskItemId).toBe(100)
    expect(result.current.validationStatus.validCount).toBe(1)
  })

  it("should batch apply taskItemId to all sheets", () => {
    const { result } = renderHook(() => useChecklistImportState())

    act(() => {
      result.current.loadParsedTemplates("test.xlsx", sampleTemplates)
    })

    act(() => {
      result.current.applyTaskItemToAll(200)
    })

    expect(result.current.templates[0].taskItemId).toBe(200)
    expect(result.current.templates[1].taskItemId).toBe(200)
    expect(result.current.validationStatus.validCount).toBe(2)
    expect(result.current.validationStatus.isAllValid).toBe(true)
  })

  it("should add, update and delete items", () => {
    const { result } = renderHook(() => useChecklistImportState())

    act(() => {
      result.current.loadParsedTemplates("test.xlsx", sampleTemplates)
    })

    // Add item
    act(() => {
      result.current.addItem()
    })
    expect(result.current.activeTemplate?.items).toHaveLength(2)

    // Update item
    act(() => {
      result.current.updateItem("item-1", { title: "Tiêu đề mới" })
    })
    expect(result.current.activeTemplate?.items[0].title).toBe("Tiêu đề mới")

    // Delete item
    act(() => {
      result.current.deleteItem("item-1")
    })
    expect(result.current.activeTemplate?.items).toHaveLength(1)
  })
})
