import type { FileViewerRenderProps } from "../types"

export function ImageViewer({ url, fileName }: FileViewerRenderProps) {
  return (
    <div className="flex w-full min-h-300px items-center justify-center rounded-lg bg-muted/10 p-2">
      <img
        src={url}
        alt={fileName}
        className="max-h-[72vh] max-w-full rounded-md object-contain shadow-xs"
      />
    </div>
  )
}
