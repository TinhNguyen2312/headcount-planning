import { resolveMediaUrl } from "@/lib/utils"

export const MAX_FILE_SIZE_MB = 100
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_4K_WIDTH = 4096
export const MAX_4K_HEIGHT = 2160

export const getFileUrl = (urlOrPath?: string | null): string => {
  return resolveMediaUrl(urlOrPath)
}

export const getImageUrl = getFileUrl

export const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(objectUrl)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Unable to read image dimensions"))
    }
    image.src = objectUrl
  })

export const resizeImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
): Promise<File> => {
  const { width, height } = await getImageDimensions(file)
  if (width <= maxWidth && height <= maxHeight) {
    return file
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height)
  const targetWidth = Math.round(width * ratio)
  const targetHeight = Math.round(height * ratio)

  return new Promise((resolve, reject) => {
    const image = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const canvas = document.createElement("canvas")
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
      const mimeType = file.type || "image/jpeg"
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const resizedFile = new File([blob], file.name, {
            type: mimeType,
            lastModified: Date.now(),
          })
          resolve(resizedFile)
        },
        mimeType,
        0.92,
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to process image resizing"))
    }

    image.src = objectUrl
  })
}

export const resizeTo4K = async (file: File): Promise<File> => {
  const { width, height } = await getImageDimensions(file)
  const needResize = width > MAX_4K_WIDTH || height > MAX_4K_HEIGHT
  if (!needResize) return file
  return resizeImage(file, MAX_4K_WIDTH, MAX_4K_HEIGHT)
}
