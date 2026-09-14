import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { taskItemQueries } from "@/hooks/server/taskItems"
import { useBusinessMatrixEditor } from "@/hooks/useBusinessMatrixEditor"
import type { BusinessMatrixResponse } from "@/types"

vi.mock("@/hooks/server/taskItems", () => ({
  taskItemQueries: {
    useCreate: vi.fn(),
    useUpdate: vi.fn(),
    useDelete: vi.fn(),
  },
}))

const mockChildItem: BusinessMatrixResponse = {
  id: 208,
  parentTaskId: 200,
  title: "Giám sát hoàn thiện",
  workType: null,
  taskType: "FREQUENCY",
  approvalLevel: 1,
  slaHours: 24,
  escalateLevel: "HIGH",
  requirementType: "IMAGE",
  label: "Ảnh hiện trường",
  roles: [{ roleId: 1, roleName: "GĐ/PGĐ" }],
  requirements: [{ requirementType: "IMAGE", label: "Ảnh hiện trường" }],
  children: [],
}

const mockRootItem: BusinessMatrixResponse = {
  id: 200,
  parentTaskId: null,
  title: "Giai đoạn Thi công",
  workType: null,
  taskType: null,
  approvalLevel: 0,
  slaHours: null,
  escalateLevel: null,
  requirementType: null,
  label: null,
  roles: [],
  requirements: [],
  children: [mockChildItem],
}

describe("useBusinessMatrixEditor", () => {
  const mockMutateAsyncUpdate = vi.fn().mockResolvedValue({})
  const mockMutateAdd = vi.fn()
  const mockMutateDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(taskItemQueries.useUpdate).mockReturnValue({
      mutateAsync: mockMutateAsyncUpdate,
    } as any)
    vi.mocked(taskItemQueries.useCreate).mockReturnValue({
      mutate: mockMutateAdd,
      isPending: false,
    } as any)
    vi.mocked(taskItemQueries.useDelete).mockReturnValue({
      mutate: mockMutateDelete,
    } as any)
  })

  it("saves a child task item", async () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    act(() => {
      result.current.handleEdit(mockChildItem)
    })

    await act(async () => {
      result.current.form.setFieldsValue({
        title: "Giám sát hoàn thiện (Cập nhật)",
        taskType: "ADHOC",
        approvalLevel: 1,
        slaHours: 48,
        escalateLevel: "HIGH",
        requirementType: "IMAGE",
        roleIds: [1],
      })
      await result.current.handleSave(mockChildItem)
    })

    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 208,
        data: expect.objectContaining({
          parentTaskId: 200,
          title: "Giám sát hoàn thiện (Cập nhật)",
          taskType: "ADHOC",
          approvalLevel: 1,
          slaHours: 48,
          escalateLevel: "HIGH",
          requirementType: "IMAGE",
          roleIds: [1],
        }),
      }),
    )
  })

  it("overwrites partial updates onto base record and sends complete payload", async () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    await act(async () => {
      result.current.form.setFieldsValue({
        ...mockChildItem,
        roleIds: [1],
        accCondition: 'submittal[type="Thi công"]',
      })
      await result.current.handleSave(mockChildItem)
    })

    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 208,
        data: expect.objectContaining({
          parentTaskId: 200,
          title: "Giám sát hoàn thiện",
          accCondition: 'submittal[type="Thi công"]',
          roleIds: [1],
        }),
      }),
    )
  })

  it("saves a root task item", async () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    act(() => {
      result.current.handleEdit(mockRootItem)
    })

    await act(async () => {
      result.current.form.setFieldsValue({
        title: "Giai đoạn Thi công (Mới)",
        approvalLevel: 0,
        slaHours: null,
        escalateLevel: "none" as any,
        requirementType: "none" as any,
        roleIds: [],
      })
      await result.current.handleSave(mockRootItem)
    })

    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 200,
        data: expect.objectContaining({
          parentTaskId: null,
          title: "Giai đoạn Thi công (Mới)",
          roleIds: [],
        }),
      }),
    )
  })

  it("adds new tasks", () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    act(() => {
      result.current.handleAddRoot()
    })
    expect(mockMutateAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nhóm nghiệp vụ mới",
        parentTaskId: null,
      }),
    )

    act(() => {
      result.current.handleAddChild(mockRootItem)
    })
    expect(mockMutateAdd).toHaveBeenCalledWith(
      expect.objectContaining({ parentTaskId: 200 }),
    )

    act(() => {
      result.current.handleAddSibling(mockChildItem)
    })
    expect(mockMutateAdd).toHaveBeenCalledWith(
      expect.objectContaining({ parentTaskId: 200 }),
    )
  })

  it("handles records with null/undefined escalateLevel and defaults to HIGH", () => {
    const itemWithoutEscalate: BusinessMatrixResponse = {
      ...mockRootItem,
      escalateLevel: null,
      taskType: null,
      requirementType: null,
      roles: undefined as any,
      children: undefined as any,
    }
    const { result } = renderHook(() => useBusinessMatrixEditor([itemWithoutEscalate]))

    act(() => {
      result.current.handleEdit(itemWithoutEscalate)
    })

    expect(result.current.editingId).toBe(itemWithoutEscalate.id)
    const formVals = result.current.form.getFieldsValue(true)
    expect(formVals.escalateLevel).toBe("HIGH")
    expect(formVals.taskType).toBe("none")
    expect(formVals.requirementType).toBe("none")
    expect(formVals.roleIds).toEqual([])
  })

  it("ensures escalateLevel in mutation payload is always valid enum (LOW, MEDIUM, HIGH) and never null or none", async () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    act(() => {
      result.current.handleEdit(mockChildItem)
    })

    await act(async () => {
      result.current.form.setFieldsValue({
        taskType: "none" as any,
        escalateLevel: "none" as any,
        requirementType: "none" as any,
      })
      await result.current.handleSave(mockChildItem)
    })

    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 208,
        data: expect.objectContaining({
          taskType: null,
          escalateLevel: "HIGH",
          requirementType: null,
        }),
      }),
    )
  })

  it("resets editing state if the deleted item is currently being edited", () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    act(() => {
      result.current.handleEdit(mockChildItem)
    })
    expect(result.current.editingId).toBe(mockChildItem.id)

    act(() => {
      result.current.handleDelete(mockChildItem.id)
    })
    expect(result.current.editingId).toBeNull()
    expect(mockMutateDelete).toHaveBeenCalledWith(mockChildItem.id)
  })

  it("handles add child when record.children is undefined", () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([]))
    const itemWithoutChildren: BusinessMatrixResponse = {
      ...mockRootItem,
      children: undefined as any,
    }

    act(() => {
      result.current.handleAddChild(itemWithoutChildren)
    })
    expect(mockMutateAdd).toHaveBeenCalledWith(
      expect.objectContaining({ parentTaskId: itemWithoutChildren.id, orderIndex: 0 }),
    )
  })

  it("handles cancel properly by resetting editingId and form", () => {
    const { result } = renderHook(() => useBusinessMatrixEditor([mockRootItem]))

    act(() => {
      result.current.handleEdit(mockChildItem)
    })
    expect(result.current.editingId).toBe(mockChildItem.id)

    act(() => {
      result.current.handleCancel()
    })
    expect(result.current.editingId).toBeNull()
  })
})
