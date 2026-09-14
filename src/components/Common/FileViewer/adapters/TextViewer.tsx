import { useQuery } from "@tanstack/react-query"
import { Button, Spin } from "antd"
import axios from "axios"
import { Copy, FileCode, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { FileViewerRenderProps } from "../types"

export function TextViewer({ url }: FileViewerRenderProps) {
  const {
    data: content = "",
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["file-viewer", "text", url],
    queryFn: async ({ signal }) => {
      const res = await axios.get(url, { responseType: "text", signal })
      return typeof res.data === "string"
        ? res.data
        : JSON.stringify(res.data, null, 2)
    },
    enabled: Boolean(url),
    staleTime: 5 * 60 * 1000,
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Đã sao chép nội dung văn bản")
  }

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spin size="default" />
      </div>
    )
  }

  if (error) {
    const errorMessage =
      axios.isAxiosError(error) && error.message
        ? error.message
        : "Không thể tải nội dung tệp văn bản."

    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 p-6 text-center">
        <FileCode className="size-8 text-destructive" />
        <p className="text-sm text-destructive">{errorMessage}</p>
        <Button
          icon={<RefreshCw className="size-3.5" />}
          onClick={() => refetch()}
        >
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground font-mono">
          {content.split("\n").length} dòng • {content.length} ký tự
        </span>
        <Button
          size="small"
          icon={<Copy className="size-3" />}
          onClick={handleCopy}
          className="text-xs"
        >
          Sao chép nội dung
        </Button>
      </div>
      <div className="max-h-[70vh] w-full overflow-auto rounded-lg border bg-muted/20 p-4 font-mono text-xs leading-relaxed select-text whitespace-pre-wrap">
        {content}
      </div>
    </div>
  )
}
