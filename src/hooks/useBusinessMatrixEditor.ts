import { Form } from "antd"
import { useState } from "react"

import { taskItemQueries } from "@/hooks/server/taskItems"
import type {
  BusinessMatrixResponse,
  EscalateLevel,
  RequirementType,
  TaskItemResponse,
  TaskItemUpdate,
  TaskType,
} from "@/types"

export const NONE = "none"

const BUSINESS_MATRIX_KEY = ["task-items", "business-matrix"]
const TASK_ITEMS_KEY = ["task-items"]
const RELATED_KEYS = [BUSINESS_MATRIX_KEY, TASK_ITEMS_KEY]

export const useBusinessMatrixEditor = (
  formattedData: BusinessMatrixResponse[] = [],
) => {
  const addTaskItemMutation = taskItemQueries.useCreate(RELATED_KEYS)
  const updateTaskItemMutation = taskItemQueries.useUpdate(RELATED_KEYS)
  const deleteTaskItemMutation = taskItemQueries.useDelete(RELATED_KEYS)

  const [form] = Form.useForm<TaskItemResponse>()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = (record: BusinessMatrixResponse) => {
    form.setFieldsValue({
      ...record,
      title: record.title ?? "",
      taskType: record.taskType,
      approvalLevel: record.approvalLevel ?? 0,
      slaHours: record.slaHours ?? null,
      escalateLevel:
        record.escalateLevel &&
        ["LOW", "MEDIUM", "HIGH"].includes(record.escalateLevel.toUpperCase())
          ? (record.escalateLevel.toUpperCase() as EscalateLevel)
          : "HIGH",
      requirementType: record.requirementType,
      roleIds: record.roles?.map((r) => r.roleId) ?? [],
    })
    setEditingId(record.id)
  }

  const handleCancel = () => {
    setEditingId(null)
    form.resetFields()
  }

  const handleSave = async (record: BusinessMatrixResponse) => {
    try {
      setIsSaving(true)

      let validatedValues: Partial<TaskItemResponse> = {}
      if (editingId === record.id) {
        try {
          validatedValues = await form.validateFields()
        } catch {}
      }

      const formValues = form.getFieldsValue(true)
      const values = { ...formValues, ...validatedValues }

      const trimmedTitle =
        typeof values.title === "string"
          ? values.title.trim()
          : (values.title ?? record.title ?? "")

      const rawTaskType =
        values.taskType === NONE || values.taskType === "none"
          ? null
          : (values.taskType ?? record.taskType ?? null)
      const taskType = rawTaskType
        ? (rawTaskType.toUpperCase() as TaskType)
        : null

      const rawEscalateLevel =
        values.escalateLevel &&
        values.escalateLevel !== NONE &&
        values.escalateLevel !== "none"
          ? values.escalateLevel
          : record.escalateLevel
      const escalateLevel: EscalateLevel =
        rawEscalateLevel &&
        ["LOW", "MEDIUM", "HIGH"].includes(rawEscalateLevel.toUpperCase())
          ? (rawEscalateLevel.toUpperCase() as EscalateLevel)
          : "HIGH"

      const rawRequirementType =
        values.requirementType === NONE || values.requirementType === "none"
          ? null
          : (values.requirementType ?? record.requirementType ?? null)
      const requirementType = rawRequirementType
        ? (rawRequirementType.toUpperCase() as RequirementType)
        : null

      const isChild = Boolean(record.parentTaskId || values.parentTaskId)

      const payload: TaskItemUpdate = {
        parentTaskId:
          values.parentTaskId !== undefined
            ? values.parentTaskId
            : (record.parentTaskId ?? null),
        title: trimmedTitle || record.title,
        roleIds:
          values.roleIds !== undefined
            ? values.roleIds
            : (record.roles?.map((r) => r.roleId) ?? []),
        ...(isChild
          ? {
              taskType,
              approvalLevel:
                values.approvalLevel !== undefined
                  ? values.approvalLevel
                  : (record.approvalLevel ?? 0),
              slaHours:
                values.slaHours !== undefined
                  ? values.slaHours
                  : (record.slaHours ?? null),
              escalateLevel,
              requirementType,
              accCondition:
                values.accCondition !== undefined
                  ? values.accCondition
                  : (record.accCondition ?? null),
            }
          : {
              ...(values.accCondition !== undefined
                ? { accCondition: values.accCondition }
                : record.accCondition !== undefined
                  ? { accCondition: record.accCondition }
                  : {}),
            }),
        ...(values.orderIndex !== undefined
          ? { orderIndex: values.orderIndex }
          : record.orderIndex !== undefined
            ? { orderIndex: record.orderIndex }
            : {}),
        ...(values.description !== undefined
          ? { description: values.description }
          : record.description !== undefined
            ? { description: record.description }
            : {}),
        ...(values.workType !== undefined
          ? { workType: values.workType }
          : record.workType !== undefined
            ? { workType: record.workType }
            : {}),
        ...(values.label !== undefined
          ? { label: values.label }
          : record.label !== undefined
            ? { label: record.label }
            : {}),
      }

      await updateTaskItemMutation.mutateAsync({
        id: record.id,
        data: payload,
      })

      setEditingId(null)
      form.resetFields()
    } catch (error) {
      console.error("Lỗi khi lưu nghiệp vụ:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRoot = () => {
    addTaskItemMutation.mutate({
      title: "Nhóm nghiệp vụ mới",
      parentTaskId: null,
      orderIndex: formattedData?.length ?? 0,
      escalateLevel: "HIGH",
    })
  }

  const handleAddChild = (record: BusinessMatrixResponse) => {
    addTaskItemMutation.mutate({
      title: "Nghiệp vụ mới",
      parentTaskId: record.id,
      orderIndex: record.children?.length ?? 0,
      escalateLevel: "HIGH",
    })
  }

  const handleAddSibling = (record: BusinessMatrixResponse) => {
    const sttPart = record.stt ? Number(record.stt.split(".").pop()) : NaN
    const orderIndex = Number.isFinite(sttPart)
      ? sttPart
      : (record.orderIndex ?? 0)
    addTaskItemMutation.mutate({
      title: "Nghiệp vụ mới",
      parentTaskId: record.parentTaskId ?? null,
      orderIndex,
      escalateLevel:
        record.escalateLevel &&
        ["LOW", "MEDIUM", "HIGH"].includes(record.escalateLevel.toUpperCase())
          ? (record.escalateLevel.toUpperCase() as EscalateLevel)
          : "HIGH",
    })
  }

  const handleDelete = (id: number) => {
    if (editingId === id) {
      setEditingId(null)
      form.resetFields()
    }
    deleteTaskItemMutation.mutate(id)
  }

  return {
    form,
    editingId,
    isSaving: isSaving || updateTaskItemMutation.isPending,
    isAddingRoot: addTaskItemMutation.isPending,
    handleEdit,
    handleCancel,
    handleSave,
    handleAddRoot,
    handleAddChild,
    handleAddSibling,
    handleDelete,
  }
}
