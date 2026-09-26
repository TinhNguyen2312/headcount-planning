/* eslint-disable @typescript-eslint/no-explicit-any */
import { Upload as AntUpload, Button, Form, Input, Modal, message } from "antd"
import { Camera, ExternalLink, Eye, Link2, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  FileViewerModal,
  getFileIconForUrl,
} from "@/components/Common/FileViewer"
import { formatAttachmentInfo, isWebUrl } from "@/lib/utils"
import type { Requirement, TaskInstanceResponse } from "@/types"

interface RequirementSectionProps {
  task?: TaskInstanceResponse
  editable: boolean
  requirements: Requirement[]
  uploading: boolean
  onUploadFile: (file: File) => void
  onAddLink: (url: string, title?: string) => void
  onRemove: (index: number) => void
}

export default function RequirementSection({
  editable,
  uploading,
  onUploadFile,
  onAddLink,
  onRemove,
  requirements,
}: RequirementSectionProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState<string>("")
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkForm] = Form.useForm<{ url: string; title?: string }>()
  const handleAddLinkSubmit = async () => {
    try {
      const values = await linkForm.validateFields()
      const url = values.url.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        message.warning("Đường dẫn phải bắt đầu bằng http:// hoặc https://")
        return
      }
      onAddLink(url, values.title)
      linkForm.resetFields()
      setIsLinkModalOpen(false)
    } catch {}
  }

  if (!editable && requirements.length === 0) return null
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-base uppercase tracking-wider text-muted-foreground">
          Minh chứng
        </h4>
        {requirements.length > 0 && (
          <span className="text-base text-muted-foreground">
            {requirements.length} mục đã đính kèm
          </span>
        )}
      </div>

      {requirements.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {requirements.map((link: Requirement, index: any) => {
            const isLink =
              link.type === "LINK" ||
              (isWebUrl(link.url) && !link.url.includes("/data/uploads/"))
            const displayName =
              link.title || formatAttachmentInfo(link.url, index).label

            return (
              <div
                key={`${link.url}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/40 px-3 py-1.5"
              >
                {isLink ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 max-w-xs truncate text-base font-medium text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-emerald-100 hover:underline cursor-pointer text-left"
                  >
                    <ExternalLink className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{displayName}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setViewerUrl(link.url)
                      setViewerTitle(displayName)
                    }}
                    className="flex items-center gap-1.5 max-w-xs truncate text-base font-medium text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-emerald-100 hover:underline cursor-pointer text-left"
                  >
                    {getFileIconForUrl(link.url)}
                    <span className="truncate">{displayName}</span>
                    <Eye className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-0.5" />
                  </button>
                )}
                {editable && (
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<Trash2 className="size-3.5 text-red-500" />}
                    onClick={() => onRemove(index)}
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
        <div className="flex flex-wrap items-center gap-2">
          <AntUpload
            customRequest={({ file }) => onUploadFile(file as File)}
            showUploadList={false}
            disabled={uploading}
          >
            <Button
              size="middle"
              icon={<Camera className="size-4" />}
              loading={uploading}
              className="gap-1 text-base"
            >
              Tải ảnh / Tệp minh chứng
            </Button>
          </AntUpload>

          <Button
            size="middle"
            icon={<Link2 className="size-4" />}
            onClick={() => setIsLinkModalOpen(true)}
            className="gap-1 text-base"
          >
            Thêm liên kết
          </Button>
        </div>
      )}

      <Modal
        title="Thêm liên kết minh chứng"
        open={isLinkModalOpen}
        onOk={handleAddLinkSubmit}
        onCancel={() => {
          linkForm.resetFields()
          setIsLinkModalOpen(false)
        }}
        okText="Thêm liên kết"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={linkForm} layout="vertical" className="mt-4">
          <Form.Item
            name="url"
            label="Đường dẫn liên kết (URL)"
            rules={[
              { required: true, message: "Vui lòng nhập đường dẫn liên kết" },
              {
                type: "url",
                message:
                  "Vui lòng nhập URL hợp lệ (bắt đầu bằng http:// hoặc https://)",
              },
            ]}
          >
            <Input placeholder="https://acc.autodesk.com/... hoặc link tài liệu khác" />
          </Form.Item>
          <Form.Item
            name="title"
            label="Tiêu đề / Tên mô tả liên kết (Tùy chọn)"
          >
            <Input placeholder="Ví dụ: Bản vẽ thiết kế ACC, Báo cáo hiện trường Google Drive..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
