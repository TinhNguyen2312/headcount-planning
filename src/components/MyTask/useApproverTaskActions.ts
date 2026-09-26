import { message } from "antd"
import { taskInstanceQueries } from "@/hooks/server/taskInstances"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import type { TaskInstanceResponse } from "@/types"

export const useApproverTaskActions = (
  activeTask: TaskInstanceResponse | undefined,
  userId: number | undefined,
) => {
  const { hasPermission } = useProjectAuth(activeTask?.instance?.projectId)
  const taskId = activeTask?.id ?? 0
  const approveMutation = taskInstanceQueries.useApprove(taskId)
  const rejectMutation = taskInstanceQueries.useUpdateStatus(taskId)

  const currentStep = activeTask?.approvalStep ?? 0
  const totalLevel = activeTask?.approvalLevel ?? 1

  const hasStepPermission =
    currentStep === 0
      ? hasPermission("APPROVE_LEVEL_1") || hasPermission("APPROVE_LEVEL_2")
      : hasPermission("APPROVE_LEVEL_2")

  const alreadyApprovedByMe =
    currentStep > 0 &&
    activeTask?.reviewerUserId != null &&
    activeTask.reviewerUserId === userId

  const canReview =
    activeTask?.stageStatus === "IN_REVIEW" &&
    hasStepPermission &&
    !alreadyApprovedByMe

  const handleApprove = async (note?: string) => {
    try {
      const defaultNote =
        totalLevel > 1 ? `Duyệt cấp ${currentStep + 1} đạt` : "Duyệt đạt"
      await approveMutation.mutateAsync(note?.trim() || defaultNote)
    } catch {
      message.error("Duyệt thất bại!")
    }
  }

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({
        stageStatus: "TODO",
        note: `Từ chối: ${reason}`,
      })
    } catch {
      message.error("Từ chối thất bại!")
    }
  }

  return {
    canReview,
    alreadyApprovedByMe,
    currentStep,
    totalLevel,
    isPending: approveMutation.isPending || rejectMutation.isPending,
    handleApprove,
    handleReject,
  }
}
