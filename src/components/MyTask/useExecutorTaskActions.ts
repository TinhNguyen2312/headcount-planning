/* eslint-disable react-hooks/set-state-in-effect */
import { message } from "antd"
import { useEffect, useState } from "react"
import { taskInstanceQueries } from "@/hooks/server/taskInstances"
import { parseRequirements } from "@/lib/utils"
import { UploadsAPI } from "@/services/uploads"
import type { Requirement, TaskInstanceResponse } from "@/types"

export const useExecutorTaskActions = (
  activeTask: TaskInstanceResponse | undefined,
  isAssignedToMe: boolean,
  onSubmitted: () => void,
) => {
  const [requirements, setRequirements] = useState<Requirement[]>(
    parseRequirements(activeTask?.requirements || []),
  )
  console.log(activeTask)
  const [uploading, setUploading] = useState(false)
  const updateStatusMutation = taskInstanceQueries.useUpdateStatus(
    activeTask?.id ?? 0,
  )
  useEffect(() => {
    setRequirements(parseRequirements(activeTask?.requirements || []))
  }, [activeTask?.requirements])
  const canSubmit =
    isAssignedToMe &&
    (activeTask?.stageStatus === "TODO" ||
      activeTask?.stageStatus === "REJECTED")
  const canEditChecklist =
    isAssignedToMe &&
    (activeTask?.stageStatus === "TODO" ||
      activeTask?.stageStatus === "REJECTED")
  const hasEvidence = requirements.length > 0

  const handleUploadFile = async (file: File) => {
    setUploading(true)
    try {
      const res = await UploadsAPI.uploadFile(file)
      console.log(res)
      const url = res.result?.url
      if (url) {
        const isVideo = file.type.startsWith("video/")
        const isImg = file.type.startsWith("image/")
        const type = isVideo ? "VIDEO" : isImg ? "IMAGE" : "FILE"
        setRequirements((prev) => [...prev, { type, url, title: file.name }])
        message.success("Đã tải tệp minh chứng thành công!")
      }
    } catch {
      message.error("Tải tệp thất bại!")
    } finally {
      setUploading(false)
    }
  }

  const handleAddLink = (url: string, title?: string) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return
    setRequirements((prev) => [
      ...prev,
      {
        type: "LINK",
        url: trimmedUrl,
        title: title?.trim() || undefined,
      },
    ])
    message.success("Đã thêm liên kết minh chứng thành công!")
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index))
  }

  const submitEvidence = async () => {
    if (requirements.length === 0) {
      message.error("Chưa đình kèm minh chứng")
      return
    }
    if (!activeTask) return
    try {
      await updateStatusMutation.mutateAsync({
        stageStatus: "IN_REVIEW",
        requirements: requirements.map((x) => x.url),
      })
      onSubmitted()
    } catch {
      message.error("Nộp minh chứng thất bại!")
    }
  }

  return {
    requirements,
    uploading,
    handleUploadFile,
    handleAddLink,
    handleRemoveRequirement,
    submitEvidence,
    isSubmitting: updateStatusMutation.isPending,
    canSubmit,
    canEditChecklist,
    hasEvidence,
  }
}
