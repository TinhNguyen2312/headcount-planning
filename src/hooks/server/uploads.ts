import { useMutation } from "@tanstack/react-query"
import { extractApiErrorMessage } from "@/lib/errors"
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  resizeTo4K,
} from "@/lib/imageUtils"
import { UploadsAPI } from "@/services/uploads"
import type { FileUploadResponse, ItemResponse, ListResponse } from "@/types"
import { useUI } from "../useUI"

export const uploadMutations = {
  useUploadFile: () => {
    const { hideLoading, showLoading, message } = useUI()

    return useMutation<ItemResponse<FileUploadResponse>, Error, File>({
      mutationFn: async (file: File) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          message.warning(
            `Tệp "${file.name}" vượt quá ${MAX_FILE_SIZE_MB}MB. Vui lòng chọn tệp nhỏ hơn.`,
          )
          throw new Error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`)
        }

        try {
          showLoading("Đang tải lên...")
          const finalFile = file.type.startsWith("image/")
            ? await resizeTo4K(file)
            : file
          return await UploadsAPI.uploadFile(finalFile)
        } catch (error) {
          message.error(
            extractApiErrorMessage(
              error,
              "Tải lên thất bại. Vui lòng thử lại.",
            ),
          )
          throw error
        } finally {
          hideLoading()
        }
      },
    })
  },

  useUploadFiles: () => {
    const { hideLoading, showLoading, message } = useUI()

    return useMutation<ListResponse<FileUploadResponse>, Error, File[]>({
      mutationFn: async (files: File[]) => {
        for (const file of files) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            message.warning(
              `Tệp "${file.name}" vượt quá ${MAX_FILE_SIZE_MB}MB. Vui lòng chọn tệp nhỏ hơn.`,
            )
            throw new Error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`)
          }
        }

        try {
          showLoading("Đang tải lên các tệp...")
          const processedFiles = await Promise.all(
            files.map(async (file) =>
              file.type.startsWith("image/") ? await resizeTo4K(file) : file,
            ),
          )
          return await UploadsAPI.uploadMultipleFiles(processedFiles)
        } catch (error) {
          message.error(
            extractApiErrorMessage(
              error,
              "Tải lên thất bại. Vui lòng thử lại.",
            ),
          )
          throw error
        } finally {
          hideLoading()
        }
      },
    })
  },
}
