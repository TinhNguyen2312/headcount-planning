import {
  ExternalLink,
  FileCode,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Film,
  Image as ImageIcon,
  Music,
} from "lucide-react"
import type React from "react"
import {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  OFFICE_EXTENSIONS,
  SPREADSHEET_EXTENSIONS,
  TEXT_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from "@/constants/fileAdapter"
import { FallbackViewer } from "./adapters/FallbackViewer"
import { ImageViewer } from "./adapters/ImageViewer"
import { AudioViewer, VideoViewer } from "./adapters/MediaViewer"
import { OfficeViewer } from "./adapters/OfficeViewer"
import { PdfViewer } from "./adapters/PdfViewer"
import { SpreadsheetViewer } from "./adapters/SpreadsheetViewer"
import { TextViewer } from "./adapters/TextViewer"
import { WebLinkViewer } from "./adapters/WebLinkViewer"
import type { FileViewerAdapter } from "./types"

export const SpreadsheetAdapter: FileViewerAdapter = {
  id: "spreadsheet",
  name: "Spreadsheet Viewer (Excel / CSV)",
  priority: 20,
  canHandle: (_url: string, ext: string) =>
    SPREADSHEET_EXTENSIONS.has(ext.toLowerCase()),
  getIcon: () => <FileSpreadsheet className="size-4 text-emerald-600" />,
  modalWidth: "95vw",
  render: (props) => <SpreadsheetViewer {...props} />,
}

export const PdfAdapter: FileViewerAdapter = {
  id: "pdf",
  name: "PDF Viewer",
  priority: 10,
  canHandle: (url: string, ext: string) =>
    ext.toLowerCase() === "pdf" || url.startsWith("data:application/pdf"),
  getIcon: () => <FileText className="size-4 text-red-500" />,
  modalWidth: "92vw",
  render: (props) => <PdfViewer {...props} />,
}

export const ImageAdapter: FileViewerAdapter = {
  id: "image",
  name: "Image Viewer",
  priority: 10,
  canHandle: (url: string, ext: string) =>
    IMAGE_EXTENSIONS.has(ext.toLowerCase()) || url.startsWith("data:image/"),
  getIcon: () => <ImageIcon className="size-4 text-blue-500" />,
  modalWidth: "800px",
  render: (props) => <ImageViewer {...props} />,
}

export const VideoAdapter: FileViewerAdapter = {
  id: "video",
  name: "Video Player",
  priority: 15,
  canHandle: (_url: string, ext: string) =>
    VIDEO_EXTENSIONS.has(ext.toLowerCase()),
  getIcon: () => <Film className="size-4 text-purple-500" />,
  modalWidth: "800px",
  render: (props) => <VideoViewer {...props} />,
}

export const AudioAdapter: FileViewerAdapter = {
  id: "audio",
  name: "Audio Player",
  priority: 15,
  canHandle: (_url: string, ext: string) =>
    AUDIO_EXTENSIONS.has(ext.toLowerCase()),
  getIcon: () => <Music className="size-4 text-pink-500" />,
  modalWidth: "600px",
  render: (props) => <AudioViewer {...props} />,
}

export const TextAdapter: FileViewerAdapter = {
  id: "text",
  name: "Text / Code Viewer",
  priority: 15,
  canHandle: (_url: string, ext: string) =>
    TEXT_EXTENSIONS.has(ext.toLowerCase()),
  getIcon: () => <FileCode className="size-4 text-amber-500" />,
  modalWidth: "850px",
  render: (props) => <TextViewer {...props} />,
}

export const OfficeAdapter: FileViewerAdapter = {
  id: "office",
  name: "Office Document Viewer",
  priority: 15,
  canHandle: (_url: string, ext: string) =>
    OFFICE_EXTENSIONS.has(ext.toLowerCase()),
  getIcon: () => <FileText className="size-4 text-blue-600" />,
  modalWidth: "90vw",
  render: (props) => <OfficeViewer {...props} />,
}

export const WebLinkAdapter: FileViewerAdapter = {
  id: "weblink",
  name: "Web Link Viewer",
  priority: 5,
  canHandle: (url: string, ext: string) => {
    if (!url) return false
    const isHttp = url.startsWith("http://") || url.startsWith("https://")
    return isHttp && (!ext || ext.length > 6)
  },
  getIcon: () => <ExternalLink className="size-4 text-blue-500" />,
  modalWidth: "600px",
  render: (props) => <WebLinkViewer {...props} />,
}

export const FallbackAdapter: FileViewerAdapter = {
  id: "fallback",
  name: "Default Download Viewer",
  priority: 0,
  canHandle: () => true,
  getIcon: () => <FileQuestion className="size-4 text-muted-foreground" />,
  modalWidth: "600px",
  render: (props) => <FallbackViewer {...props} />,
}

// Registry danh sách ưu tiên
const registry: FileViewerAdapter[] = [
  SpreadsheetAdapter,
  PdfAdapter,
  ImageAdapter,
  VideoAdapter,
  AudioAdapter,
  TextAdapter,
  OfficeAdapter,
  WebLinkAdapter,
  FallbackAdapter,
]

export const registerAdapter = (adapter: FileViewerAdapter) => {
  registry.unshift(adapter)
  registry.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}

export const extractExtension = (url?: string | null): string => {
  if (!url) return ""
  const cleanUrl = url.split("?")[0].split("#")[0]
  const lastSegment = cleanUrl.split("/").filter(Boolean).pop() || ""
  const parts = lastSegment.split(".")
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : ""
}

export const resolveViewerAdapter = (
  url?: string | null,
): FileViewerAdapter => {
  if (!url) return FallbackAdapter
  const ext = extractExtension(url)

  for (const adapter of registry) {
    if (adapter.canHandle(url, ext)) {
      return adapter
    }
  }

  return FallbackAdapter
}

export const getFileIconForUrl = (url?: string | null): React.ReactNode => {
  const adapter = resolveViewerAdapter(url)
  return adapter.getIcon ? adapter.getIcon() : FallbackAdapter.getIcon?.()
}
