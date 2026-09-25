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

  const supabaseUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    "https://aqcznssfntdqnttmmjsl.supabase.co"
  const bucketName =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET) ||
    "uploads"

  // 1. If it's already an absolute URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it contains legacy localhost:8080 from previous FastAPI setup
    if (
      trimmed.includes("localhost:8080") ||
      trimmed.includes("127.0.0.1:8080")
    ) {
      const fileName = trimmed.split("/").filter(Boolean).pop()
      if (fileName) {
        return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`
      }
    }
    return trimmed
  }

  // 2. Extract pure file name / subpath from relative paths (e.g. "/uploads/abc.jpg", "uploads/abc.jpg", "/api/uploads/abc.jpg")
  const cleanPath = trimmed
    .replace(/^\/+/, "")
    .replace(/^(api\/)?(uploads\/|data\/uploads\/)?/, "")

  // 3. Resolve directly to Supabase Storage CDN URL (bypassing backend completely)
  if (cleanPath && supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`
  }

  // 4. Local fallback (served by Next.js from public/ directory)
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
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

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return "-"
  return new Intl.NumberFormat("vi-VN").format(num)
}
