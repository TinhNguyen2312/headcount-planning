import { message } from "antd"
import { useCallback, useState } from "react"
import { UploadsAPI } from "@/services/uploads"
export interface TaskAttachment {
  uid: string
  name: string
  url: string
  size?: number
}

export const useTaskAttachments = (initialFiles: TaskAttachment[] = []) => {
  const [attachedFiles, setAttachedFiles] =
    useState<TaskAttachment[]>(initialFiles)
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadFile = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      const res = await UploadsAPI.uploadFile(file)
      const fileUrl = res.result.fileUrl || res.result.url || ""
      const uid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      const newFile: TaskAttachment = {
        uid,
        name: res.result.originalFileName || file.name,
        url: fileUrl,
        size: res.result.size || file.size,
      }

      setAttachedFiles((prev) => [...prev, newFile])
      message.success(`Đã tải lên: ${newFile.name}`)
    } catch {
      message.error("Tải tệp lên thất bại. Vui lòng thử lại!")
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleRemoveAttachedFile = useCallback((uid: string) => {
    setAttachedFiles((prev) => prev.filter((item) => item.uid !== uid))
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachedFiles([])
  }, [])

  return {
    attachedFiles,
    isUploading,
    handleUploadFile,
    handleRemoveAttachedFile,
    clearAttachments,
  }
}

export default useTaskAttachments
