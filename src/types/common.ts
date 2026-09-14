export interface IBaseQuery {
  page?: number | string
  limit?: number | string
  pageSize?: number | string
  skip?: number
  sortBy?: string
  order?: "asc" | "desc" | "ASC" | "DESC"
  keyword?: string
  search?: string
  [key: string]: unknown
}

export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ListResponse<T> {
  code?: number | string
  message?: string
  meta: PaginationMeta
  result: T[]
  data?: T[]
}

export interface ItemResponse<T> {
  code?: number | string
  message?: string
  meta?: PaginationMeta | string
  result: T
}

export interface SortState {
  sortBy: string
  order: "ASC" | "DESC"
}

export interface SortConfig<TExtra = object> {
  sort: SortState
  extra?: TExtra
}

export interface SortOption {
  label: string
  sortBy: string
  order: "ASC" | "DESC"
}

export interface MessageResponse {
  message: string
}

export interface ApiValidationError {
  loc: (string | number)[]
  msg: string
  message?: string
  type: string
}

export interface ApiErrorBody {
  code?: number | string
  message?: string
  error?: string
  errorMessage?: string
  result?: Record<string, unknown> | string | unknown
  detail?: string | ApiValidationError[]
}

export interface UploadResponse {
  url: string
  filename: string
  content_type: string | null
}
