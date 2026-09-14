"use client"

import { useRouter } from "next/navigation"
import { Button, Space } from "antd"
import axios from "axios"

export interface ErrorComponentProps {
  error?: unknown
  resetErrorBoundary?: () => void
  reset?: () => void
}

interface ErrorDisplayMeta {
  title: string
  message: string
}

const ERROR_STRATEGY_MAP: Record<number, ErrorDisplayMeta> = {
  403: {
    title: "403 - Không có quyền truy cập",
    message: "Bạn không có quyền thực hiện thao tác hoặc xem tài nguyên này.",
  },
  404: {
    title: "404 - Không tìm thấy dữ liệu",
    message: "Dữ liệu hoặc trang bạn yêu cầu không tồn tại hoặc đã bị xóa.",
  },
}

const DEFAULT_ERROR_META: ErrorDisplayMeta = {
  title: "Có lỗi xảy ra!",
  message:
    "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay lại trang trước.",
}

function extractErrorInfo(error: unknown): {
  statusCode: number | null
  detail?: string
} {
  if (axios.isAxiosError(error) && error.response) {
    return {
      statusCode: error.response.status,
      detail: error.response.data?.detail
        ? String(error.response.data.detail)
        : undefined,
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("404")) return { statusCode: 404 }
    if (error.message.includes("403")) return { statusCode: 403 }
    if (error.message.includes("500")) return { statusCode: 500 }
  }

  return { statusCode: null }
}

function resolveErrorDisplay(
  statusCode: number | null,
  detail?: string,
): ErrorDisplayMeta {
  if (statusCode && ERROR_STRATEGY_MAP[statusCode]) {
    return ERROR_STRATEGY_MAP[statusCode]
  }

  if (statusCode && statusCode >= 500) {
    return {
      title: "500 - Lỗi máy chủ",
      message: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.",
    }
  }

  return {
    title: DEFAULT_ERROR_META.title,
    message: detail || DEFAULT_ERROR_META.message,
  }
}

const ErrorComponent = ({
  error,
  resetErrorBoundary,
  reset,
}: ErrorComponentProps) => {
  const router = useRouter()

  const { statusCode, detail } = extractErrorInfo(error)
  const { title, message } = resolveErrorDisplay(statusCode, detail)

  const handleReset = () => {
    resetErrorBoundary?.()
    reset?.()
    router.refresh()
  }

  const handleGoBack = () => {
    handleReset()
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/projects")
    }
  }

  const handleGoHome = () => {
    handleReset()
    router.push("/projects")
  }

  return (
    <div
      className="flex min-h-[60vh] items-center justify-center flex-col p-4 w-full"
      data-testid="error-component"
    >
      <div className="flex flex-col items-center justify-center p-4 max-w-md text-center">
        <span className="text-5xl md:text-7xl font-bold leading-none mb-3 text-destructive">
          {statusCode ?? "Lỗi"}
        </span>
        <span className="text-xl font-bold mb-2 text-foreground">{title}</span>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>

        <Space size="middle">
          <Button onClick={handleReset}>Thử lại</Button>
          <Button onClick={handleGoBack}>Quay lại</Button>
          <Button type="primary" onClick={handleGoHome}>
            Về trang chủ
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default ErrorComponent
