import { Tag } from "antd"
import { Building2, ExternalLink, Eye, Paperclip, User } from "lucide-react"
import { useState } from "react"
import {
  FileViewerModal,
  getFileIconForUrl,
} from "@/components/Common/FileViewer"
import SlaCountdown from "@/components/Common/SlaCountdown"
import { cn, formatAttachmentInfo, isEvidenceLocked } from "@/lib/utils"
import type { InstanceResponse, TaskInstanceResponse } from "@/types"
import { STAGE_STATUS_TAG } from "./taskStageStatus"

interface TaskSummaryCardProps {
  instance: InstanceResponse | undefined
  taskInstance: TaskInstanceResponse | undefined
}

export function TaskSummaryCard({
  instance,
  taskInstance,
}: TaskSummaryCardProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState<string>("")
  const metadata = taskInstance?.metadata
  const accData = metadata?.acc
  const statusTag = STAGE_STATUS_TAG[taskInstance?.stageStatus || "TODO"]

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col gap-3">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Nhân sự thực hiện:</span>
          <div className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <User className="size-4 text-primary shrink-0" />
            <span>{instance?.assignedUserName}</span>
            {instance?.roleName && (
              <span className="text-muted-foreground font-normal">
                - {instance.roleName}
              </span>
            )}
          </div>
          <Tag color={statusTag?.color}>{statusTag.label}</Tag>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dự án:</span>
        <div className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <Building2 className="size-4 text-primary shrink-0" />
          <span>{instance?.projectName}</span>
          {instance?.zoneName && (
            <span className="">- {instance.zoneName}</span>
          )}
        </div>
      </div>

      {taskInstance?.description && (
        <div className="text-base text-muted-foreground leading-relaxed">
          <ul>
            <li>Title: {taskInstance.title}</li>
            {accData?.packageTitle && <li>Package: {accData?.packageTitle}</li>}
            {accData?.typeName && <li>Type: {accData?.typeName}</li>}
            {accData?.specTitle && <li>Spec: {accData?.specTitle}</li>}
          </ul>
        </div>
      )}

      {taskInstance?.attachments && taskInstance.attachments.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Paperclip className="size-3.5 text-primary" />
            <span>Tài liệu & Tệp đính kèm khi giao việc</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {taskInstance.attachments.map((url, idx) => {
              const info = formatAttachmentInfo(url, idx)

              if (info.isWebLink) {
                return (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors group",
                      info.isAcc
                        ? "border-blue-300 bg-blue-50/80 hover:bg-blue-100 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300"
                        : "border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:text-sky-300",
                    )}
                  >
                    <ExternalLink className="size-3.5 shrink-0 text-current" />
                    <span className="max-w-340px truncate">{info.label}</span>
                  </a>
                )
              }

              return (
                <button
                  type="button"
                  key={`${url}-${idx}`}
                  onClick={() => {
                    setViewerUrl(url)
                    setViewerTitle(info.label)
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer text-left group"
                >
                  {getFileIconForUrl(url)}
                  <span className="max-w-220px truncate">{info.label}</span>
                  <Eye className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-0.5" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <FileViewerModal
        open={Boolean(viewerUrl)}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerUrl(null)}
      />

      <div className="flex flex-wrap items-center gap-4 pt-3 border-t text-base text-muted-foreground">
        {taskInstance?.slaDeadline && (
          <SlaCountdown
            slaDeadline={taskInstance.slaDeadline}
            locked={isEvidenceLocked(taskInstance.stageStatus)}
          />
        )}
      </div>
    </div>
  )
}
