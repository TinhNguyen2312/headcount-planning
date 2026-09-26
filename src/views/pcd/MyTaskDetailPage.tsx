import { Button } from "antd"
import { FileText, Send } from "lucide-react"

import PageContainer from "@/components/Common/PageContainer"
import UnauthorizedAccess from "@/components/Common/UnauthorizedAccess"
import { ApprovalStepsSidebar } from "@/components/MyTask/ApprovalStepsSidebar"
import { ChecklistEvaluationSection } from "@/components/MyTask/ChecklistEvaluationSection"
import RequirementSection from "@/components/MyTask/RequirementSection"
import { TaskReviewActions } from "@/components/MyTask/TaskReviewActions"
import { TaskSummaryCard } from "@/components/MyTask/TaskSummaryCard"
import { useApproverTaskActions } from "@/components/MyTask/useApproverTaskActions"
import { useExecutorTaskActions } from "@/components/MyTask/useExecutorTaskActions"
import { useTaskInstanceContext } from "@/components/MyTask/useTaskInstanceContext"

interface MyTaskDetailPageProps {
  taskInstanceId: number
  onBack: () => void
}

export default function MyTaskDetailPage({
  taskInstanceId,
  onBack,
}: MyTaskDetailPageProps) {
  const ctx = useTaskInstanceContext(taskInstanceId)
  const executor = useExecutorTaskActions(
    ctx.activeTask,
    ctx.isAssignedToMe,
    onBack,
  )
  const approver = useApproverTaskActions(ctx.activeTask, ctx.user?.id)

  if (ctx.user?.systemRole === "SUPER_ADMIN") {
    return <UnauthorizedAccess />
  }

  if (!ctx.instance) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border rounded-xl">
        <FileText className="size-12 text-muted-foreground" />
        <h3 className="font-bold text-lg">Không tìm thấy công việc</h3>
        <Button onClick={onBack}>Quay lại</Button>
      </div>
    )
  }

  console.log(ctx.activeTask?.requirements)
  return (
    <PageContainer
      title={ctx.activeTask?.taskItemTitle}
      onBack={onBack}
      rightSlot={
        executor.canSubmit ? (
          <Button
            type="primary"
            variant="solid"
            size="middle"
            icon={<Send className="size-4" />}
            loading={executor.isSubmitting}
            onClick={executor.submitEvidence}
          >
            Nộp minh chứng
          </Button>
        ) : approver.canReview ? (
          <TaskReviewActions
            isPending={approver.isPending}
            onApprove={approver.handleApprove}
            onReject={approver.handleReject}
          />
        ) : null
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <TaskSummaryCard
            instance={ctx.activeTask?.instance || undefined}
            taskInstance={ctx.activeTask}
          />

          <ChecklistEvaluationSection
            taskInstanceId={ctx.activeTask?.id || 0}
            taskItemId={ctx.activeTask?.taskItemId || 0}
            editable={executor.canEditChecklist}
          />

          <RequirementSection
            task={ctx.activeTask}
            editable={executor.canSubmit}
            requirements={executor.requirements}
            uploading={executor.uploading}
            onUploadFile={executor.handleUploadFile}
            onAddLink={executor.handleAddLink}
            onRemove={executor.handleRemoveRequirement}
          />
        </div>

        <div className="flex flex-col gap-6">
          {ctx.activeTask && (
            <ApprovalStepsSidebar
              steps={ctx.steps}
              currentStepIndex={ctx.currentStepIndex}
              stageStatus={ctx.activeTask.stageStatus}
              stageLogs={ctx.stageLogs}
            />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
