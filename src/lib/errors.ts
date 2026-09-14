import type { FormInstance } from "antd"
import axios from "axios"
import type { ApiErrorBody } from "@/types/common"

const formatValidationResult = (result: unknown): string | null => {
  if (typeof result === "string" && result.trim()) return result.trim()
  if (typeof result !== "object" || result === null) return null

  const messages = Object.values(result)
    .flatMap((val) => (Array.isArray(val) ? val : [val]))
    .map((val) => {
      if (typeof val === "string") return val.trim()
      if (typeof val === "object" && val !== null) {
        const item = val as Record<string, unknown>
        const msg = item.msg ?? item.message
        return typeof msg === "string" ? msg.trim() : null
      }
      return null
    })
    .filter((msg): msg is string => Boolean(msg))

  return messages.length > 0 ? messages.join(", ") : null
}

export const extractApiErrorMessage = (
  error: unknown,
  fallback = "Có lỗi xảy ra.",
): string => {
  if (!error) return fallback

  if (axios.isAxiosError<ApiErrorBody | string>(error)) {
    const data = error.response?.data
    if (typeof data === "string" && data.trim()) return data.trim()

    if (typeof data === "object" && data !== null) {
      if (String(data.code) === "1001" && data.result) {
        const resultMsg = formatValidationResult(data.result)
        if (resultMsg) return resultMsg
      }

      if (Array.isArray(data.detail) && data.detail.length > 0) {
        const first = data.detail[0]
        return first.msg || first.message || String(first)
      }

      if (typeof data.detail === "string" && data.detail.trim()) {
        return data.detail.trim()
      }

      const message = data.message || data.error || data.errorMessage
      if (typeof message === "string" && message.trim()) {
        return message.trim()
      }

      if (data.result) {
        const resultMsg = formatValidationResult(data.result)
        if (resultMsg) return resultMsg
      }
    }
  }

  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error.trim()) return error.trim()

  return fallback
}

export const extractApiFieldErrors = (
  error: unknown,
): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {}
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fieldErrors

  const data = error.response?.data
  if (typeof data !== "object" || data === null) return fieldErrors

  if (
    data.result &&
    typeof data.result === "object" &&
    !Array.isArray(data.result)
  ) {
    for (const [key, val] of Object.entries(data.result)) {
      const msgs = Array.isArray(val)
        ? val.map(String).filter(Boolean)
        : typeof val === "string" && val.trim()
          ? [val.trim()]
          : []
      if (msgs.length > 0) fieldErrors[key] = msgs
    }
  }

  if (Array.isArray(data.detail)) {
    for (const item of data.detail) {
      if (item && typeof item === "object") {
        const loc = item.loc
        const field =
          Array.isArray(loc) && loc.length > 0
            ? String(loc[loc.length - 1])
            : "global"
        const msg = item.msg || item.message || "Lỗi dữ liệu"
        ;(fieldErrors[field] ??= []).push(msg)
      }
    }
  }

  return fieldErrors
}

export const applyApiFieldErrors = <Values = unknown>(
  form: Pick<FormInstance<Values>, "setFields">,
  error: unknown,
): boolean => {
  const fieldErrors = extractApiFieldErrors(error)
  const entries = Object.entries(fieldErrors)
  if (entries.length === 0) return false

  form.setFields(
    entries.map(([name, errors]) => ({
      name: name as never,
      errors,
    })),
  )
  return true
}
