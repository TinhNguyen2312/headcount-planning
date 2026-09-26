import { taskInstanceQueries } from "@/hooks/server"
import { authQueries } from "@/hooks/server/auth"
import useAuth from "@/hooks/useAuth"

const approvalStepLabels = (approvalLevel: number): string[] => {
  if (approvalLevel === 0) return ["Nộp minh chứng"]
  if (approvalLevel === 1) return ["Nộp minh chứng", "QLTT duyệt"]
  return ["Nộp minh chứng", "QLTT duyệt", "QLTT+1 duyệt"]
}

export const useTaskInstanceContext = (taskInstanceId: number) => {
  const { user } = useAuth()

  const { data: activeTask } = taskInstanceQueries.useDetail(
    taskInstanceId || -1,
  )
  const instance = activeTask?.instance
  const stageLogs = activeTask?.histories || []

  const isAssignedToMe =
    !!instance && !!user && instance?.assignedUserId === user.id

  const { data: assignedUser } = authQueries.useMe()
  const steps = activeTask ? approvalStepLabels(activeTask.approvalLevel) : []
  const currentStepIndex = (() => {
    if (!activeTask) return 0
    if (activeTask.stageStatus === "TODO") return 0
    if (activeTask.stageStatus === "IN_REVIEW")
      return Math.min(1 + activeTask.approvalStep, steps.length - 1)
    return steps.length - 1
  })()

  return {
    user,
    instance,
    activeTask,
    stageLogs,
    isAssignedToMe,
    steps,
    currentStepIndex,
    assignedUser,
  }
}
