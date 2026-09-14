import { NextResponse } from "next/server"

export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  total?: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export function createPaginationMeta(
  page: number = 0,
  size: number = 20,
  totalElements: number = 0,
): PaginationMeta {
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / size) : 0
  return {
    page,
    size,
    totalElements,
    total: totalElements,
    totalPages,
    hasNext: page + 1 < totalPages,
    hasPrevious: page > 0,
  }
}

export function apiSuccess<T>(
  result: T,
  message: string = "Success",
  meta?: PaginationMeta | null,
) {
  return NextResponse.json({
    code: 1000,
    message,
    result,
    data: result, // Alias for frontend compatibility
    meta: meta || undefined,
  })
}

export function apiError(
  message: string,
  status: number = 400,
  code: number = 400,
  detail?: any,
) {
  return NextResponse.json(
    {
      code,
      message,
      detail: detail || message,
    },
    { status },
  )
}
