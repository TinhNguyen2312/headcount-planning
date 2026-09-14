/* eslint-disable react-hooks/preserve-manual-memoization */
import { Button, Modal, Tag, Tooltip } from "antd"
import { Copy, Download, ExternalLink } from "lucide-react"
import { useMemo } from "react"
import { toast } from "sonner"
import { resolveMediaUrl } from "@/lib/utils"
import { extractExtension, resolveViewerAdapter } from "./adapterRegistry"
import type { FileViewerRenderProps } from "./types"

export interface FileViewerModalProps {
  open: boolean
  url: string | null
  title?: string
  onClose: () => void
}

export function FileViewerModal({
  open,
  url,
  title,
  onClose,
}: FileViewerModalProps) {
  const resolvedUrl = url ? resolveMediaUrl(url) : ""
  const extension = resolvedUrl ? extractExtension(resolvedUrl) : ""
  const fileName =
    title || (resolvedUrl ? resolvedUrl.split("/").pop() : "") || "Tệp đính kèm"

  const adapter = useMemo(() => {
    return resolveViewerAdapter(resolvedUrl)
  }, [resolvedUrl])

  const handleCopyLink = () => {
    if (!resolvedUrl) return
    navigator.clipboard.writeText(resolvedUrl)
    toast.success("Đã sao chép liên kết tệp")
  }

  if (!open || !url) return null

  const renderProps: FileViewerRenderProps = {
    url: resolvedUrl,
    fileName,
    extension,
    onClose,
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={adapter.modalWidth || "850px"}
      style={{ maxWidth: "1200px", top: 24 }}
      styles={{
        body: {
          maxHeight: "calc(100vh - 120px)",
          overflow: "auto",
          padding: "16px",
        },
      }}
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-2 min-w-0">
            {adapter.getIcon?.()}
            <span className="truncate font-semibold text-base text-foreground max-w-sm sm:max-w-md">
              {fileName}
            </span>
            {extension && (
              <Tag className="text-[10px] font-bold uppercase tracking-wider">
                {extension}
              </Tag>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Tooltip title="Sao chép liên kết">
              <Button
                size="small"
                type="text"
                icon={<Copy className="size-3.5 text-muted-foreground" />}
                onClick={handleCopyLink}
              />
            </Tooltip>
            <Tooltip title="Mở trong tab mới">
              <Button
                size="small"
                type="text"
                icon={
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                }
                href={resolvedUrl}
                target="_blank"
                rel="noreferrer"
              />
            </Tooltip>
            <Tooltip title="Tải về máy">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<Download className="size-3.5" />}
                href={resolvedUrl}
                target="_blank"
                download
              >
                Tải về
              </Button>
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className="mt-2 flex w-full flex-col items-center justify-center">
        {adapter.render(renderProps)}
      </div>
    </Modal>
  )
}

export default FileViewerModal
