import { Button } from "antd"
import { ExternalLink, Globe } from "lucide-react"
import type { FileViewerRenderProps } from "../types"

export function WebLinkViewer({ url, fileName }: FileViewerRenderProps) {
  const isAcc = url.includes("acc.autodesk.com")
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-muted/10 py-10 px-4 text-center">
      <div className="rounded-full bg-blue-50 dark:bg-blue-950/40 p-4">
        <Globe className="size-10 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex flex-col gap-1.5 max-w-md">
        <span className="font-semibold text-base text-foreground">
          {fileName}
        </span>
        <span className="text-xs text-muted-foreground break-all">{url}</span>
        <p className="text-sm text-muted-foreground mt-2">
          {isAcc
            ? "Đây là liên kết trực tiếp tới hồ sơ trên nền tảng Autodesk Construction Cloud (ACC)."
            : "Đây là liên kết trang web hoặc tài nguyên trực tuyến."}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Button
          type="primary"
          icon={<ExternalLink className="size-4" />}
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {isAcc ? "Mở trên Autodesk ACC" : "Truy cập liên kết"}
        </Button>
      </div>
    </div>
  )
}
