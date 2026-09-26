import { Button, Card, Tag } from "antd"
import {
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Eye,
  Paperclip,
  Shield,
  User,
} from "lucide-react"
import { useState } from "react"

import {
  FileViewerModal,
  getFileIconForUrl,
} from "@/components/Common/FileViewer"
import SlaCountdown from "@/components/Common/SlaCountdown"
import { STAGE_STATUS_TAG } from "@/components/MyTask/taskStageStatus"
import {
  TASK_INSTANCE_CATEGORY_COLOR,
  TASK_INSTANCE_CATEGORY_LABEL,
} from "@/constants"
import {
  cn,
  formatAttachmentInfo,
  isEvidenceLocked,
  parseRequirements,
} from "@/lib/utils"
import type { TaskInstanceResponse } from "@/types"

const WEEKDAY_LABELS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
]

export interface TaskInstanceCardProps {
  task: TaskInstanceResponse
  onPress?: (task: TaskInstanceResponse) => void
  onOpenDetail?: (task: TaskInstanceResponse) => void
  viewMode?: "grid" | "list"
  className?: string
}

export const TaskInstanceCard = ({
  task,
  onPress,
  onOpenDetail,
  viewMode = "grid",
  className,
}: TaskInstanceCardProps) => {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState<string>("")

  const handleOpen = () => {
    if (onOpenDetail) onOpenDetail(task)
    else if (onPress) onPress(task)
  }

  const statusTag = STAGE_STATUS_TAG[task.stageStatus] || STAGE_STATUS_TAG.TODO
  const metadata = task?.metadata
  const accData = metadata?.acc
  const title = task.taskItemTitle ?? task.title
  const links = parseRequirements(task.requirements ?? [])
  const isCompleted =
    task.stageStatus === "COMPLETED" || task.stageStatus === "APPROVED"

  const [y, m, d] = (task.instance?.workDate ?? "").split("-").map(Number)
  const weekday =
    y && m && d ? WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()] : ""
  const dateFormatted =
    d && m && y
      ? `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`
      : ""

  const categoryTag = task.category ? (
    <Tag
      color={
        TASK_INSTANCE_CATEGORY_COLOR[task.category] ??
        (task.category === "ADHOC" ? "orange" : "cyan")
      }
      className="m-0 font-medium"
    >
      {TASK_INSTANCE_CATEGORY_LABEL[task.category] ??
        (task.category === "ADHOC" ? "Phát sinh" : "Hàng ngày")}
    </Tag>
  ) : null

  const approvalTag =
    task.approvalLevel > 0 ? (
      <Tag
        color="purple"
        className="m-0 font-medium inline-flex items-center gap-1"
      >
        <Shield className="size-2.5" />
        <span>Duyệt C{task.approvalLevel}</span>
      </Tag>
    ) : null

  const evaluateTag = task.evaluate ? (
    <Tag
      color={task.evaluate === "PASS" ? "success" : "error"}
      className="m-0 font-medium"
    >
      {task.evaluate === "PASS" ? "Đạt" : "Không đạt"}
    </Tag>
  ) : null

  const stageTag = statusTag ? (
    <Tag color={statusTag.color} className="m-0 font-medium">
      {statusTag.label}
    </Tag>
  ) : null

  if (viewMode === "list") {
    return (
      <Card
        hoverable
        size="small"
        onClick={handleOpen}
        className={cn(
          "border-l-4! transition-all cursor-pointer",
          statusTag?.borderClass ?? "border-l-border!",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                isCompleted
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <ClipboardList className="size-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-base text-foreground truncate hover:text-primary transition-colors">
                  {title}
                </span>
                {dateFormatted && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {weekday}, {dateFormatted}
                  </span>
                )}
              </div>

              {task.title && task.title !== task.taskItemTitle && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {task.title}
                </p>
              )}

              <div className="mt-1.5 flex items-center gap-3.5 flex-wrap text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground truncate max-w-220px">
                  <User className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {task.instance?.assignedUserFullName ?? "Chưa phân công"}
                  </span>
                  {task.instance?.roleName && (
                    <span className="text-muted-foreground font-normal truncate">
                      ({task.instance.roleName})
                    </span>
                  )}
                </span>

                {(task.instance?.projectName || task.instance?.zoneName) && (
                  <span className="inline-flex items-center gap-1 truncate max-w-250px">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      {task.instance?.projectName ?? "—"}
                      {task.instance?.zoneName
                        ? ` - ${task.instance.zoneName}`
                        : ""}
                    </span>
                  </span>
                )}

                {accData?.packageTitle && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground/80 truncate max-w-220px">
                    <Tag className="m-0 text-[10px] px-1 py-0 border-primary/30 text-primary">
                      ACC
                    </Tag>
                    <span className="truncate">{accData.packageTitle}</span>
                  </span>
                )}

                {links.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                    <Camera className="size-3 text-primary" />
                    <span>{links.length} ảnh/tệp</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {categoryTag}
              {approvalTag}
              {evaluateTag}
              {stageTag}
            </div>

            {task.slaDeadline && (
              <SlaCountdown
                slaDeadline={task.slaDeadline}
                locked={isEvidenceLocked(task.stageStatus)}
              />
            )}
          </div>
        </div>

        <FileViewerModal
          open={Boolean(viewerUrl)}
          url={viewerUrl}
          title={viewerTitle}
          onClose={() => setViewerUrl(null)}
        />
      </Card>
    )
  }

  return (
    <Card
      hoverable
      size="small"
      onClick={handleOpen}
      className={cn(
        "border-l-4! transition-all h-full flex flex-col justify-between cursor-pointer",
        statusTag?.borderClass ?? "border-l-border!",
        className,
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          {dateFormatted ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span>
                {weekday}, {dateFormatted}
              </span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {categoryTag}
            {approvalTag}
            {evaluateTag}
            {stageTag}
          </div>
        </div>

        <div>
          <h4
            className="text-base font-bold text-foreground leading-snug hover:text-primary transition-colors line-clamp-2"
            title={title}
          >
            {title}
          </h4>
          {task.title && task.title !== task.taskItemTitle && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.title}
            </p>
          )}
        </div>

        {(accData?.packageTitle || accData?.typeName || accData?.specTitle) && (
          <div className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-2 rounded-md border border-border/40 space-y-0.5">
            {accData.packageTitle && (
              <div className="truncate">Gói thầu: {accData.packageTitle}</div>
            )}
            {accData.typeName && (
              <div className="truncate">Loại: {accData.typeName}</div>
            )}
            {accData.specTitle && (
              <div className="truncate">Quy cách: {accData.specTitle}</div>
            )}
          </div>
        )}

        {task.attachments && task.attachments.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Paperclip className="size-3.5 text-primary" />
              <span>Tài liệu đính kèm ({task.attachments.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {task.attachments.map((url, idx) => {
                const info = formatAttachmentInfo(url, idx)

                if (info.isWebLink) {
                  return (
                    <a
                      key={`${url}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-colors group",
                        info.isAcc
                          ? "border-blue-300 bg-blue-50/80 hover:bg-blue-100 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300"
                          : "border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:text-sky-300",
                      )}
                    >
                      <ExternalLink className="size-3.5 shrink-0 text-current" />
                      <span className="max-w-200px truncate">{info.label}</span>
                    </a>
                  )
                }

                return (
                  <button
                    type="button"
                    key={`${url}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setViewerUrl(url)
                      setViewerTitle(info.label)
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer text-left group"
                  >
                    {getFileIconForUrl(url)}
                    <span className="max-w-160px truncate">{info.label}</span>
                    <Eye className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-0.5" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-col gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <User className="size-3.5 text-primary shrink-0" />
          <span className="truncate font-medium text-foreground">
            {task.instance?.assignedUserFullName ?? "Chưa phân công"}
          </span>
          {task.instance?.roleName && (
            <span className="text-muted-foreground font-normal truncate">
              - {task.instance.roleName}
            </span>
          )}
        </div>

        {(task.instance?.projectName || task.instance?.zoneName) && (
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="size-3.5 text-primary shrink-0" />
            <span className="truncate">
              {task.instance?.projectName ?? "—"}
              {task.instance?.zoneName ? ` - ${task.instance.zoneName}` : ""}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 mt-1">
          {task.slaDeadline ? (
            <SlaCountdown
              slaDeadline={task.slaDeadline}
              locked={isEvidenceLocked(task.stageStatus)}
            />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {links.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0 bg-muted/60 px-1.5 py-0.5 rounded">
                <Camera className="size-3 text-primary" />
                <span>{links.length} ảnh/tệp</span>
              </div>
            )}

            <Button
              size="small"
              type="link"
              className="p-0 h-auto font-semibold text-xs"
              onClick={(e) => {
                e.stopPropagation()
                handleOpen()
              }}
            >
              Chi tiết →
            </Button>
          </div>
        </div>
      </div>

      <FileViewerModal
        open={Boolean(viewerUrl)}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerUrl(null)}
      />
    </Card>
  )
}

export default TaskInstanceCard
