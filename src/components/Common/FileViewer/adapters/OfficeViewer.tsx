import { Button } from "antd"
import { Download, ExternalLink, FileText } from "lucide-react"
import type { FileViewerRenderProps } from "../types"

export function OfficeViewer({
  url,
  fileName,
  extension,
}: FileViewerRenderProps) {
  const isPublicRemote =
    url.startsWith("https://") ||
    (url.startsWith("http://") &&
      !url.includes("localhost") &&
      !url.includes("127.0.0.1"))
  const officeViewerUrl = isPublicRemote
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    : null

  if (officeViewerUrl) {
    return (
      <div className="h-[74vh] w-full overflow-hidden rounded-lg border bg-white shadow-xs">
        <iframe
          src={officeViewerUrl}
          className="h-full w-full border-0"
          title={fileName}
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-muted/10 py-12 text-center">
      <div className="rounded-full bg-blue-100 p-4">
        <FileText className="size-10 text-blue-600" />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <span className="font-semibold text-base text-foreground">
          {fileName}
        </span>
        <span className="text-xs text-muted-foreground">
          Tài liệu Microsoft {extension.toUpperCase()} yêu cầu ứng dụng chuyên
          dụng hoặc tải về máy để xem đầy đủ định dạng.
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
          Mở trực tiếp
        </Button>
      </div>
    </div>
  )
}
