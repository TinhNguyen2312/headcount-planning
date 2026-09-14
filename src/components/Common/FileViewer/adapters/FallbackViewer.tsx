import { Button } from "antd"
import { Download, ExternalLink, FileQuestion } from "lucide-react"
import type { FileViewerRenderProps } from "../types"

export function FallbackViewer({
  url,
  fileName,
  extension,
}: FileViewerRenderProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-muted/10 py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="size-10 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <span className="font-semibold text-base text-foreground">
          {fileName}
        </span>
        <span className="text-xs text-muted-foreground">
          {extension
            ? `Định dạng .${extension.toUpperCase()} chưa có trình xem trực tiếp.`
            : "Tệp tin đính kèm"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="primary"
          icon={<Download className="size-4" />}
          href={url}
          target="_blank"
          download
        >
          Tải tệp tin về máy
        </Button>
        <Button
          icon={<ExternalLink className="size-4" />}
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          Mở trong tab mới
        </Button>
      </div>
    </div>
  )
}
