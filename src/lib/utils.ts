/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  OFFICE_EXTENSIONS,
  SPREADSHEET_EXTENSIONS,
  TEXT_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from "@/constants/fileAdapter"
import { getConfig } from "./config"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const isWebUrl = (url?: string | null): boolean => {
  if (!url) return false
  const trimmed = url.trim().toLowerCase()
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
}

export const isAccUrl = (url?: string | null): boolean => {
  if (!url) return false
  return isWebUrl(url) && url.toLowerCase().includes("acc.autodesk.com")
}

export interface AttachmentInfo {
  url: string
  label: string
  isWebLink: boolean
  isAcc: boolean
}

export const formatAttachmentInfo = (
  url: string,
  index = 0,
): AttachmentInfo => {
  const isAcc = isAccUrl(url)
  const isWeb = isWebUrl(url)

  if (isAcc) {
    if (url.includes("/submittals/")) {
      return {
        url,
        label: "Autodesk ACC - Hồ sơ đệ trình (Submittal)",
        isWebLink: true,
        isAcc: true,
      }
    }
    if (url.includes("/rfis/")) {
      return {
        url,
        label: "Autodesk ACC - Yêu cầu thông tin (RFI)",
        isWebLink: true,
        isAcc: true,
      }
    }
    if (url.includes("/issues/")) {
      return {
        url,
        label: "Autodesk ACC - Vấn đề (Issue)",
        isWebLink: true,
        isAcc: true,
      }
    }
    return {
      url,
      label: "Autodesk Construction Cloud (ACC)",
      isWebLink: true,
      isAcc: true,
    }
  }

  if (isWeb) {
    const cleanUrl = url.split("?")[0].split("#")[0]
    const lastSegment = cleanUrl.split("/").filter(Boolean).pop() || ""
    const parts = lastSegment.split(".")
    const hasExt = parts.length > 1 && (parts.pop()?.length ?? 0) <= 5

    if (!hasExt) {
      try {
        const parsed = new URL(url)
        return {
          url,
          label: `${parsed.hostname}${parsed.pathname.length > 1 ? `${parsed.pathname.slice(0, 24)}...` : ""}`,
          isWebLink: true,
          isAcc: false,
        }
      } catch {
        return {
          url,
          label: `Liên kết web ${index + 1}`,
          isWebLink: true,
          isAcc: false,
        }
      }
    }
  }

  const fileName = url.split("/").pop() || `Tệp đính kèm ${index + 1}`
  return {
    url,
    label: fileName,
    isWebLink: false,
    isAcc: false,
  }
}

export const detectMediaType = (
  url: string,
): "IMAGE" | "FILE" | "VIDEO" | "LINK" => {
  if (!url) return "IMAGE"
  const cleanUrl = url.split("?")[0].split("#")[0].trim()
  const ext = cleanUrl.split(".").pop()?.toLowerCase() || ""

  if (IMAGE_EXTENSIONS.has(ext) || cleanUrl.startsWith("data:image/")) {
    return "IMAGE"
  }
  if (VIDEO_EXTENSIONS.has(ext) || cleanUrl.startsWith("data:video/")) {
    return "VIDEO"
  }
  if (
    AUDIO_EXTENSIONS.has(ext) ||
    SPREADSHEET_EXTENSIONS.has(ext) ||
    OFFICE_EXTENSIONS.has(ext) ||
    TEXT_EXTENSIONS.has(ext) ||
    ["pdf", "zip", "rar", "7z", "tar", "dwg", "dxf"].includes(ext) ||
    cleanUrl.startsWith("data:application/") ||
    cleanUrl.startsWith("data:audio/")
  ) {
    return "FILE"
  }
  if (isWebUrl(cleanUrl)) {
    return "LINK"
  }
  return "IMAGE"
}

export const parseTaskMetadata = <T = Record<string, any>>(
  metadata: unknown,
): T | null => {
  if (!metadata) return null
  if (typeof metadata === "object") return metadata as T
  if (typeof metadata !== "string") return null

  const trimmed = metadata.trim()
  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "{}"
  ) {
    return null
  }

  try {
    const parsed = JSON.parse(trimmed)
    return typeof parsed === "object" && parsed !== null ? (parsed as T) : null
  } catch {
    return null
  }
}

export const stringifyTaskMetadata = (metadata: unknown): string => {
  if (!metadata) return "{}"
  if (typeof metadata === "string") return metadata
  try {
    return JSON.stringify(metadata)
  } catch {
    return "{}"
  }
}

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return ""
  const trimmed = url.trim()
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed
  }

  const rawApiUrl = getConfig().apiUrl?.trim() || ""
  const defaultBase =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : ""
  const base = (rawApiUrl || defaultBase).replace(/\/+$/, "")
  const serverOrigin = base.replace(/\/api\/?$/, "")
  const apiBase = base.endsWith("/api") ? base : `${base}/api`

  // Absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const urlObj = new URL(trimmed)
      // Normalize localhost/127.0.0.1 to serverOrigin if configured
      if (
        (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") &&
        serverOrigin
      ) {
        const originObj = new URL(serverOrigin)
        urlObj.protocol = originObj.protocol
        urlObj.hostname = originObj.hostname
        urlObj.port = originObj.port
      }
      // Ensure /data/uploads has /api/ prefix if missing
      if (
        urlObj.pathname.startsWith("/data/uploads") &&
        !urlObj.pathname.startsWith("/api/")
      ) {
        urlObj.pathname = `/api${urlObj.pathname}`
      }
      return urlObj.toString()
    } catch {}
    return trimmed
  }

  // Relative path
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`

  if (serverOrigin) {
    if (normalizedPath.startsWith("/api/")) {
      return `${serverOrigin}${normalizedPath}`
    }
    return `${apiBase}${normalizedPath}`
  }

  if (normalizedPath.startsWith("/api/")) {
    return normalizedPath
  }

  return `/api${normalizedPath}`
}

export const formatRoleDepartment = (
  roleName: string,
  departmentName?: string | null,
): string => (departmentName ? `${roleName} - ${departmentName}` : roleName)

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
