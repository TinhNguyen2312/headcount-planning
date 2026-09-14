import type React from "react"

export interface FileViewerRenderProps {
  url: string
  fileName: string
  extension: string
  onClose?: () => void
}

export interface FileViewerAdapter {
  id: string
  name: string
  priority?: number
  canHandle: (url: string, extension: string) => boolean
  render: (props: FileViewerRenderProps) => React.ReactNode
  getIcon?: () => React.ReactNode
  modalWidth?: string | number
}
