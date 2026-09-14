/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  FileUploadResponse,
  ItemResponse,
  ListResponse,
  UploadResponse,
} from "@/types"

const normalizeUploadResponse = (
  raw: any,
  file: File,
): ItemResponse<FileUploadResponse> => {
  const resultData = raw?.result ?? raw?.data ?? raw
  const fileUrl =
    resultData?.fileUrl ??
    resultData?.url ??
    (typeof resultData === "string" ? resultData : "")
  const originalFileName =
    resultData?.originalFileName ?? resultData?.filename ?? file.name
  const storedFileName =
    resultData?.storedFileName ?? resultData?.filename ?? file.name
  const contentType =
    resultData?.contentType ?? resultData?.content_type ?? file.type
  const size = resultData?.size ?? file.size

  return {
    code: raw?.code ?? 200,
    message: raw?.message ?? "Tải tệp lên thành công",
    result: {
      fileUrl,
      originalFileName,
      storedFileName,
      contentType,
      size,
      url: fileUrl,
      filename: originalFileName,
      content_type: contentType,
    },
  }
}

export const UploadsAPI = {
  uploadFile: async (file: File): Promise<ItemResponse<FileUploadResponse>> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await apiClient.post<any>(`${API_V1}/upload`, formData)
      return normalizeUploadResponse(res, file)
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const res = await apiClient.post<any>(`${API_V1}/uploads`, formData)
        return normalizeUploadResponse(res, file)
      }
      throw err
    }
  },

  uploadMultipleFiles: async (
    files: File[],
  ): Promise<ListResponse<FileUploadResponse>> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const res = await apiClient.post<any>(
        `${API_V1}/upload/multiple`,
        formData,
      )
      const list = Array.isArray(res?.result) ? res.result : []
      const normalizedList = list.map((item: number) => {
        const file = files[item] || files[0]
        return normalizeUploadResponse(item, file).result
      })
      return {
        code: res?.code ?? 200,
        message: res?.message ?? "Tải các tệp lên thành công",
        result: normalizedList,
        meta: {
          page: 1,
          size: normalizedList.length,
          totalElements: normalizedList.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }
    } catch {
      const results: FileUploadResponse[] = []
      for (const file of files) {
        const single = await UploadsAPI.uploadFile(file)
        results.push(single.result)
      }
      return {
        code: 200,
        message: "Tải các tệp lên thành công",
        result: results,
        meta: {
          page: 1,
          size: results.length,
          totalElements: results.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }
    }
  },
}

export const UploadAPI = UploadsAPI
export type { UploadResponse }
