import type { FileViewerRenderProps } from "../types"

export function PdfViewer({ url, fileName }: FileViewerRenderProps) {
  return (
    <div className="h-[74vh] w-full overflow-hidden rounded-lg border bg-white shadow-xs">
      <iframe
        src={`${url}#toolbar=1`}
        className="h-full w-full border-0"
        title={fileName}
      />
    </div>
  )
}
