import { Button, Empty, Spin } from "antd"
import { FileCheck } from "lucide-react"
import { ChecklistEvalModal } from "./ChecklistEvalModal"
import { ChecklistItemNode } from "./ChecklistItemNode"
import { useChecklistEvaluation } from "./useChecklistEvaluation"

interface ChecklistEvaluationSectionProps {
  taskInstanceId: number
  taskItemId?: number
  editable: boolean
}

export function ChecklistEvaluationSection({
  taskInstanceId,
  taskItemId,
  editable,
}: ChecklistEvaluationSectionProps) {
  const checklist = useChecklistEvaluation(taskInstanceId, taskItemId)

  if (!checklist.instance && !checklist.instanceLoading) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-2 font-bold text-base">
        <FileCheck className="size-4 text-primary" />
        <span>
          {checklist.instance
            ? `Checklist: ${checklist.instance.checklist.name}`
            : "Nghiệm thu Checklist"}
        </span>
      </div>

      {checklist.instanceError ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-base text-muted-foreground">
            Không thể tải checklist. Vui lòng thử lại.
          </p>
          <Button size="small" onClick={() => checklist.refetchInstance()}>
            Thử lại
          </Button>
        </div>
      ) : checklist.instanceLoading ? (
        <div className="flex items-center justify-center py-6">
          <Spin size="small" />
        </div>
      ) : checklist.itemsLoading ? (
        <div className="flex items-center justify-center py-6">
          <Spin size="small" />
        </div>
      ) : checklist.checklistItemsTree.length > 0 ? (
        <div className="flex flex-col gap-2 pt-2">
          {checklist.checklistItemsTree.map((item) => (
            <ChecklistItemNode
              key={item.id}
              item={item}
              editable={editable}
              uploadingItemId={checklist.uploadingItemId}
              onStatusChange={checklist.handleStatusChange}
              onOpenEditReason={checklist.handleOpenEditReason}
              onUploadFile={checklist.handleUploadFile}
              onRemoveFile={checklist.handleRemoveFile}
            />
          ))}
        </div>
      ) : (
        <Empty description="Checklist chưa có tiêu chí" />
      )}

      <ChecklistEvalModal
        item={checklist.evalModalItem}
        status={checklist.evalModalStatus}
        form={checklist.evalForm}
        onCancel={checklist.closeEvalModal}
        onConfirm={checklist.handleConfirmEval}
        confirmLoading={checklist.updateItemMutation.isPending}
      />
    </div>
  )
}
