import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { AppError, ValidationError } from "./errors"
import type { PaginationMeta } from "./pagination"

export interface ApiSuccessResponse<T> {
  code: number
  message: string
  result: T
  data: T
  meta?: PaginationMeta
}

export function apiSuccess<T>(
  result: T,
  message: string = "Thành công",
  meta?: PaginationMeta | null,
  status: number = 200,
) {
  const body: ApiSuccessResponse<T> = {
    code: 1000,
    message,
    result,
    data: result,
    meta: meta || undefined,
  }

  return NextResponse.json(body, { status })
}

export function formatErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const valErr = new ValidationError("Dữ liệu gửi lên không hợp lệ", error)
    return NextResponse.json(
      {
        code: valErr.statusCode,
        errorCode: valErr.errorCode,
        message: valErr.message,
        detail: valErr.errors,
        errors: valErr.errors,
      },
      { status: valErr.statusCode },
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        code: error.statusCode,
        errorCode: error.errorCode,
        message: error.message,
        detail: error.detail || error.message,
        ...(error instanceof ValidationError ? { errors: error.errors } : {}),
      },
      { status: error.statusCode },
    )
  }

  // Lỗi ngoại lệ chưa được kiểm soát
  console.error("Unhandled API Error:", error)
  const isDev = process.env.NODE_ENV === "development"
  const errMsg = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống"

  return NextResponse.json(
    {
      code: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau",
      detail: isDev ? errMsg : "Internal Server Error",
    },
    { status: 500 },
  )
}
