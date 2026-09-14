import { Music } from "lucide-react"
import type { FileViewerRenderProps } from "../types"

export function VideoViewer({ url }: FileViewerRenderProps) {
  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-black/90 p-2">
      <video
        src={url}
        controls
        autoPlay={false}
        className="max-h-70vh max-w-full rounded-md"
      >
        Trình duyệt của bạn không hỗ trợ phát thẻ video này.
      </video>
    </div>
  )
}

export function AudioViewer({ url, fileName }: FileViewerRenderProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-muted/20 py-12">
      <div className="rounded-full bg-primary/10 p-4">
        <Music className="size-10 text-primary animate-pulse" />
      </div>
      <div className="text-center">
        <h4 className="font-semibold text-foreground text-sm max-w-sm truncate">
          {fileName}
        </h4>
      </div>
      <audio src={url} controls className="w-full max-w-md" />
    </div>
  )
}
