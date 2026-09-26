import { Upload as AntUpload, Button } from "antd"
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MinusCircle,
  Paperclip,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import {
  FileViewerModal,
  getFileIconForUrl,
} from "@/components/Common/FileViewer"
import type {
  ChecklistInstanceItemTreeNodeResponse,
  ChecklistItemStatus,
} from "@/types"

const RESULT_LABEL: Record<ChecklistItemStatus, string> = {
  PENDING: "Chưa kiểm tra",
  ACCEPTED: "Đạt",
  REJECTED: "Không đạt",
  NA: "N/A",
}

const RESULT_OPTIONS: ChecklistItemStatus[] = ["ACCEPTED", "REJECTED", "NA"]

interface ChecklistItemNodeProps {
  item: ChecklistInstanceItemTreeNodeResponse
  editable: boolean
  uploadingItemId: number | null
  onStatusChange: (
    item: ChecklistInstanceItemTreeNodeResponse,
    status: ChecklistItemStatus,
  ) => void
  onOpenEditReason: (item: ChecklistInstanceItemTreeNodeResponse) => void
  onUploadFile: (
    item: ChecklistInstanceItemTreeNodeResponse,
    file: File,
  ) => void
  onRemoveFile: (
    item: ChecklistInstanceItemTreeNodeResponse,
    index: number,
  ) => void
}

export function ChecklistItemNode({
  item,
  editable,
  uploadingItemId,
  onStatusChange,
  onOpenEditReason,
  onUploadFile,
  onRemoveFile,
}: ChecklistItemNodeProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState<string>("")
  if (item.children && item.children.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-bold text-base text-foreground">
          {item.checklistItem.title}
        </span>
        <div className="pl-3 border-l border-muted">
          {item.children.map((child) => (
            <ChecklistItemNode
              key={child.id}
              item={child}
              editable={editable}
              uploadingItemId={uploadingItemId}
              onStatusChange={onStatusChange}
              onOpenEditReason={onOpenEditReason}
              onUploadFile={onUploadFile}
              onRemoveFile={onRemoveFile}
            />
          ))}
        </div>
      </div>
    )
  }

  const currentStatus = item.status
  const currentReason = item.reasonDescription ?? ""
  const itemRequirements = item.requirements ?? []

  const borderClass =
    currentStatus === "REJECTED"
      ? "border-red-300"
      : currentStatus === "ACCEPTED"
        ? "border-emerald-300"
        : currentStatus === "NA"
          ? "border-slate-300"
          : "border-border"

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-2xs ${borderClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-base text-foreground">
          {item.checklistItem.title}
        </span>
        <div className="flex items-center gap-1">
          {RESULT_OPTIONS.map((status) => {
            const isSelected = currentStatus === status
            return (
              <Button
                key={status}
                size="small"
                disabled={!editable}
                danger={isSelected && status === "REJECTED"}
                type={isSelected ? "primary" : "default"}
                className={
                  isSelected && status === "ACCEPTED"
                    ? "bg-emerald-600!"
                    : isSelected && status === "NA"
                      ? "bg-slate-600!"
                      : ""
                }
                icon={
                  status === "ACCEPTED" ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : status === "REJECTED" ? (
                    <XCircle className="size-3.5" />
                  ) : (
                    <MinusCircle className="size-3.5" />
                  )
                }
                onClick={() => onStatusChange(item, status)}
              >
                {RESULT_LABEL[status]}
              </Button>
            )
          })}
        </div>
      </div>

      {currentStatus === "REJECTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-red-700 font-bold text-base">
              <AlertTriangle className="size-3.5" />
              <span>
                Lý do không đạt <span className="text-red-500">*</span>
              </span>
            </div>
            {editable && (
              <Button
                size="small"
                type="text"
                className="text-red-700"
                icon={<Pencil className="size-3" />}
                onClick={() => onOpenEditReason(item)}
              >
                Sửa lý do
              </Button>
            )}
          </div>
          <p className="text-base text-foreground">
            {currentReason || "Chưa có giải trình lý do"}
          </p>
        </div>
      )}

      {currentStatus === "ACCEPTED" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="size-3.5" />
              <span>Kết quả: Đạt tiêu chí</span>
            </div>
            {editable && (
              <Button
                size="small"
                type="text"
                className="text-emerald-800"
                onClick={() => onOpenEditReason(item)}
              >
                {currentReason ? "Sửa ghi chú" : "+ Thêm ghi chú"}
              </Button>
            )}
          </div>
          {currentReason && (
            <p className="text-base text-foreground">{currentReason}</p>
          )}
        </div>
      )}

      {currentStatus === "NA" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base">
              <MinusCircle className="size-3.5" />
              <span>Kết quả: Không áp dụng (N/A)</span>
            </div>
            {editable && (
              <Button
                size="small"
                type="text"
                className="text-slate-700"
                icon={<Pencil className="size-3" />}
                onClick={() => onOpenEditReason(item)}
              >
                {currentReason ? "Sửa lý do" : "Thêm lý do"}
              </Button>
            )}
          </div>
          {currentReason && (
            <p className="text-base text-foreground">{currentReason}</p>
          )}
        </div>
      )}

      {itemRequirements.length > 0 && (
        <div className="flex flex-col gap-2">
          {itemRequirements.map((url, index) => {
            const fileName = url.split("/").pop() || `Tệp ${index + 1}`
            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setViewerUrl(url)
                    setViewerTitle(fileName)
                  }}
                  className="flex items-center gap-1.5 flex-1 truncate text-base font-medium text-primary hover:underline cursor-pointer text-left group"
                >
                  {getFileIconForUrl(url)}
                  <span className="truncate">{fileName}</span>
                  <Eye className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-0.5" />
                </button>
                {editable && (
                  <Button
                    size="small"
                    type="text"
                    icon={<Trash2 className="size-3.5 text-red-500" />}
                    onClick={() => onRemoveFile(item, index)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <FileViewerModal
        open={Boolean(viewerUrl)}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerUrl(null)}
      />

      {editable && (
        <div className="w-full flex justify-between">
          <p className="w-3/4">{item.checklistItem.checkingMethod}</p>
          <AntUpload
            customRequest={({ file }) => onUploadFile(item, file as File)}
            showUploadList={false}
            disabled={uploadingItemId === item.id}
          >
            <Button
              size="small"
              icon={<Paperclip className="size-3.5" />}
              loading={uploadingItemId === item.id}
            >
              Đính kèm tệp / hình ảnh
            </Button>
          </AntUpload>
        </div>
      )}
    </div>
  )
}
