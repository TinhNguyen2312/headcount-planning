export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export function createPaginationMeta(
  page: number = 0,
  size: number = 20,
  totalElements: number = 0,
): PaginationMeta {
  const safeSize = Math.max(1, size)
  const safeTotal = Math.max(0, totalElements)
  const totalPages = safeTotal > 0 ? Math.ceil(safeTotal / safeSize) : 0

  return {
    page,
    size: safeSize,
    totalElements: safeTotal,
    total: safeTotal,
    totalPages,
    hasNext: page + 1 < totalPages,
    hasPrevious: page > 0,
  }
}

export function calculatePagination(
  rawPage: number = 0,
  rawLimit: number = 20,
  maxLimit: number = 200,
) {
  const page = Math.max(0, isNaN(rawPage) ? 0 : rawPage)
  const limit = Math.min(
    maxLimit,
    Math.max(1, isNaN(rawLimit) ? 20 : rawLimit),
  )
  const offset = page * limit

  return {
    page,
    limit,
    offset,
  }
}
