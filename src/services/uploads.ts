import { mockStore } from "@/mocks/store"
import type {
  FileUploadResponse,
  ItemResponse,
  ListResponse,
  UploadResponse,
} from "@/types"

export const UploadsAPI = {
  uploadFile: async (file: File): Promise<ItemResponse<FileUploadResponse>> => {
    const res = await mockStore.uploadFile(file)
    return {
      code: 200,
      message: "Tải tệp lên thành công",
      result: res,
    }
  },

  uploadMultipleFiles: async (
    files: File[],
  ): Promise<ListResponse<FileUploadResponse>> => {
    const results: FileUploadResponse[] = []
    for (const file of files) {
      const res = await mockStore.uploadFile(file)
      results.push(res)
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
  },
}

export const UploadAPI = UploadsAPI
export type { UploadResponse }
