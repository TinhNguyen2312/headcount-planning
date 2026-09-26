import { Form, message } from "antd"
import { useMemo, useState } from "react"
import { checklistQueries } from "@/hooks/server/checklists"
import { buildChecklistItemTree } from "@/lib/utils"
import { UploadsAPI } from "@/services/uploads"
import type {
  ChecklistInstanceItemTreeNodeResponse,
  ChecklistItemStatus,
} from "@/types"

export interface ChecklistEvalModalState {
  item: ChecklistInstanceItemTreeNodeResponse
  status: ChecklistItemStatus
}

export interface ChecklistEvalFormValues {
  reasonDescription: string
}

export const useChecklistEvaluation = (
  taskInstanceId: number,
  _taskItemId?: number,
) => {
  const {
    data: instance,
    isLoading: instanceLoading,
    isError: instanceError,
    refetch: refetchInstance,
  } = checklistQueries.useInstanceForTask(taskInstanceId)

  const { data: items = [], isLoading: itemsLoading } =
    checklistQueries.useInstanceItems(taskInstanceId, instance?.id)
  const checklistItemsTree = useMemo(
    () => buildChecklistItemTree(items),
    [items],
  )

  const updateItemMutation = checklistQueries.useUpdateInstanceItem(
    taskInstanceId,
    instance?.id,
  )

  const [evalForm] = Form.useForm<ChecklistEvalFormValues>()
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null)
  const [evalModalData, setEvalModalData] =
    useState<ChecklistEvalModalState | null>(null)

  const closeEvalModal = () => {
    setEvalModalData(null)
    evalForm.resetFields()
  }

  const handleStatusChange = (
    item: ChecklistInstanceItemTreeNodeResponse,
    status: ChecklistItemStatus,
  ) => {
    setEvalModalData({ item, status })
    evalForm.setFieldsValue({
      reasonDescription: item.reasonDescription ?? "",
    })
  }

  const handleOpenEditReason = (
    item: ChecklistInstanceItemTreeNodeResponse,
  ) => {
    const currentStatus = item.status === "PENDING" ? "ACCEPTED" : item.status
    setEvalModalData({ item, status: currentStatus })
    evalForm.setFieldsValue({
      reasonDescription: item.reasonDescription ?? "",
    })
  }

  const handleConfirmEval = async () => {
    if (!evalModalData) return
    try {
      const values = await evalForm.validateFields()
      const reason = values.reasonDescription?.trim() || ""
      const currentReqs = evalModalData.item.requirements ?? []
      await updateItemMutation.mutateAsync({
        id: evalModalData.item.id,
        data: {
          status: evalModalData.status,
          reasonDescription: reason || null,
          requirements: currentReqs,
        },
      })
      closeEvalModal()
    } catch {}
  }

  const handleUploadFile = async (
    item: ChecklistInstanceItemTreeNodeResponse,
    file: File,
  ) => {
    setUploadingItemId(item.id)
    try {
      const res = await UploadsAPI.uploadFile(file)
      const fileUrl = res.result?.url
      if (fileUrl) {
        const currentReqs = item.requirements ?? []
        await updateItemMutation.mutateAsync({
          id: item.id,
          data: {
            status: item.status ?? "PENDING",
            reasonDescription: item.reasonDescription ?? null,
            requirements: [...currentReqs, fileUrl],
          },
        })
        message.success("Đã tải tệp lên thành công!")
      }
    } catch {
      message.error("Tải tệp lên thất bại!")
    } finally {
      setUploadingItemId(null)
    }
  }

  const handleRemoveFile = async (
    item: ChecklistInstanceItemTreeNodeResponse,
    indexToRemove: number,
  ) => {
    const currentReqs = item.requirements ?? []
    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: {
          status: item.status ?? "PENDING",
          reasonDescription: item.reasonDescription ?? null,
          requirements: currentReqs.filter((_, idx) => idx !== indexToRemove),
        },
      })
    } catch {
      message.error("Xóa tệp thất bại!")
    }
  }

  return {
    instance,
    instanceLoading,
    instanceError,
    refetchInstance,
    itemsLoading,
    checklistItemsTree,
    uploadingItemId,
    evalModalData,
    evalModalItem: evalModalData?.item ?? null,
    evalModalStatus: evalModalData?.status ?? "ACCEPTED",
    evalForm,
    closeEvalModal,
    updateItemMutation,
    handleStatusChange,
    handleOpenEditReason,
    handleConfirmEval,
    handleUploadFile,
    handleRemoveFile,
  }
}
