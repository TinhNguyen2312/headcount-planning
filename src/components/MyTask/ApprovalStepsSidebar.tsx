import { Tag } from "antd"
import type {
  TaskInstanceHistoryResponse,
  TaskInstanceStageStatus,
} from "@/types"

interface ApprovalStepsSidebarProps {
  steps: string[]
  currentStepIndex: number
  stageStatus: TaskInstanceStageStatus
  stageLogs: TaskInstanceHistoryResponse[]
}

export function ApprovalStepsSidebar({
  steps,
  currentStepIndex,
  stageStatus,
  stageLogs,
}: ApprovalStepsSidebarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs sticky top-4">
      <h4 className="font-bold text-base uppercase tracking-wider text-muted-foreground">
        Quy trình Phê duyệt & Giai đoạn
      </h4>

      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => (
          <div
            key={step}
            className={`flex items-center justify-between p-3 rounded-lg border text-base font-semibold ${
              idx === currentStepIndex && stageStatus !== "REJECTED"
                ? ""
                : idx < currentStepIndex || stageStatus === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : stageStatus === "REJECTED" && idx === currentStepIndex
                    ? "bg-red-50 text-red-700 border-red-300"
                    : "bg-muted/40 text-muted-foreground border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{idx + 1}.</span>
              <span>{step}</span>
            </div>
            {idx === currentStepIndex && (
              <Tag color="orange" className="m-0 text-[10px]">
                Hiện tại
              </Tag>
            )}
          </div>
        ))}
      </div>

      {stageLogs.length > 0 && (
        <div className="mt-2 border-t pt-3 flex flex-col gap-2 text-base">
          <span className="font-bold text-foreground">Lịch sử công việc:</span>
          <div className="flex flex-col gap-1.5 overflow-y-auto">
            {stageLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-0.5 p-4 rounded bg-muted/40 text-muted-foreground"
              >
                <span className="font-mono text-[14px] font-bold">
                  {new Date(log.datelastmaint).toLocaleString("vi-VN")}
                </span>
                <span>{log.userFullName}</span>
                <span className="text-foreground font-medium">
                  {log.note || "Đã chuyển giai đoạn"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
