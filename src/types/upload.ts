import type { ItemResponse, ListResponse } from "./common"

export interface FileUploadResponse {
  originalFileName?: string
  storedFileName?: string
  fileUrl: string
  size?: number
  contentType?: string
  url?: string
  filename?: string
  content_type?: string | null
}

export type UploadSingleResponse = ItemResponse<FileUploadResponse>
export type UploadMultipleResponse = ListResponse<FileUploadResponse>
export type ApiResponseFileUploadResponse = ItemResponse<FileUploadResponse>
export type ApiResponseListFileUploadResponse = ItemResponse<
  FileUploadResponse[]
>
