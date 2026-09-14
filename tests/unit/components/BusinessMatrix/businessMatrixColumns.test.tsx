import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createBusinessMatrixColumns } from "@/components/BusinessMatrix/businessMatrixColumns"
import type { BusinessMatrixResponse } from "@/types"

vi.mock("@/hooks/useProjectAuth", () => ({
  useProjectAuth: () => ({ isSuperUser: true }),
  MANAGER_PROJECT_ROLES: ["PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR"],
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: { useList: () => ({ items: [] }) },
}))

vi.mock("@/hooks/server/checklists", () => ({
  checklistQueries: { useList: () => ({ items: [] }) },
}))

const mockParent: BusinessMatrixResponse = {
  id: 1,
  parentTaskId: null,
  title: "Giai đoạn 1",
  workType: null,
  approvalLevel: 0,
  slaHours: null,
  escalateLevel: null,
  requirementType: null,
  label: null,
  roles: [],
  requirements: [],
  children: [],
}

const mockChildFrequency: BusinessMatrixResponse = {
  id: 2,
  parentTaskId: 1,
  title: "Nghiệp vụ định kỳ",
  workType: null,
  taskType: "FREQUENCY",
  accCondition: 'submittal[type="Thi công"]',
  approvalLevel: 1,
  slaHours: 24,
  escalateLevel: "HIGH",
  requirementType: "IMAGE",
  label: "Ảnh hiện trường",
  roles: [],
  requirements: [],
  children: [],
}

const mockChildAdhoc: BusinessMatrixResponse = {
  id: 3,
  parentTaskId: 1,
  title: "Nghiệp vụ đột xuất",
  workType: null,
  taskType: "ADHOC",
  accCondition: null,
  approvalLevel: 0,
  slaHours: 12,
  escalateLevel: "LOW",
  requirementType: "FILE",
  label: "Biên bản",
  roles: [],
  requirements: [],
  children: [],
}

describe("businessMatrixColumns", () => {
  const mockForm = {
    setFieldsValue: vi.fn(),
    setFieldValue: vi.fn(),
    getFieldsValue: vi.fn().mockReturnValue({}),
    resetFields: vi.fn(),
  } as any

  const defaultParams = {
    form: mockForm,
    editingId: null,
    isSaving: false,
    onStartEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onAddChild: vi.fn(),
    onAddSibling: vi.fn(),
    onDelete: vi.fn(),
  }

  it("defines all 10 columns including taskType and accCondition", () => {
    const columns = createBusinessMatrixColumns(defaultParams)
    expect(columns).toHaveLength(10)

    const keys = columns.map((col) => col.key)
    expect(keys).toContain("taskType")
    expect(keys).toContain("accCondition")

    const taskTypeCol = columns.find((c) => c.key === "taskType")
    expect(taskTypeCol?.title).toBe("LOẠI CÔNG VIỆC")

    const accConditionCol = columns.find((c) => c.key === "accCondition")
    expect(accConditionCol?.title).toBe("CẤU HÌNH ACC")
  })

  it("renders taskType tags properly for child tasks and null for parent", () => {
    const columns = createBusinessMatrixColumns(defaultParams)
    const taskTypeCol = columns.find((c) => c.key === "taskType")!

    // Parent task -> null
    const parentRender = (taskTypeCol.render as any)(null, mockParent)
    expect(parentRender).toBeNull()

    // FREQUENCY
    const { container: freqContainer } = render(
      <div>{(taskTypeCol.render as any)(null, mockChildFrequency)}</div>,
    )
    expect(freqContainer.textContent).toContain("Thường xuyên")

    // ADHOC
    const { container: adhocContainer } = render(
      <div>{(taskTypeCol.render as any)(null, mockChildAdhoc)}</div>,
    )
    expect(adhocContainer.textContent).toContain("Đột xuất")
  })

  it("renders ACC configuration cell, opens modal, and triggers onSave with accCondition", async () => {
    const onSave = vi.fn()
    const columns = createBusinessMatrixColumns({
      ...defaultParams,
      onSave,
    })
    const accConditionCol = columns.find((c) => c.key === "accCondition")!

    // Parent task -> null
    expect((accConditionCol.render as any)(null, mockParent)).toBeNull()

    // Child task -> renders button
    render(
      <div>{(accConditionCol.render as any)(null, mockChildFrequency)}</div>,
    )
    const button = screen.getByRole("button", { name: "Cấu hình ACC" })
    expect(button).toBeTruthy()

    fireEvent.click(button)

    // Modal opens
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(screen.getByDisplayValue("Thi công")).toBeTruthy()

    // Clicking save calls onSave with record and accCondition override
    const saveButton = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(saveButton)

    expect(mockForm.setFieldsValue).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockChildFrequency,
        accCondition: 'submittal[type="Thi công"]',
      }),
    )
    expect(onSave).toHaveBeenCalledWith(mockChildFrequency)
  })
})
