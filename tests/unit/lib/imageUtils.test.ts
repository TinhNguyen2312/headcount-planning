import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  getFileUrl,
  getImageDimensions,
  MAX_4K_HEIGHT,
  MAX_4K_WIDTH,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  resizeTo4K,
} from "@/lib/imageUtils"

vi.mock("@/lib/config", () => ({
  API_V1: "/api",
  getConfig: () => ({ apiUrl: "http://localhost:8080" }),
}))

describe("imageUtils", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("exports correct size and dimension constants", () => {
    expect(MAX_FILE_SIZE_MB).toBe(100)
    expect(MAX_FILE_SIZE_BYTES).toBe(100 * 1024 * 1024)
    expect(MAX_4K_WIDTH).toBe(4096)
    expect(MAX_4K_HEIGHT).toBe(2160)
  })

  it("formats file URL with /api prefix correctly", () => {
    expect(getFileUrl("")).toBe("")
    expect(getFileUrl(null)).toBe("")
    expect(getFileUrl(undefined)).toBe("")

    // Absolute URLs
    expect(getFileUrl("https://minio.example.com/gms/img.jpg")).toBe(
      "https://minio.example.com/gms/img.jpg",
    )
    expect(getFileUrl("http://example.com/pic.png")).toBe(
      "http://example.com/pic.png",
    )
    expect(getFileUrl("blob:http://localhost:3000/123-456")).toBe(
      "blob:http://localhost:3000/123-456",
    )

    // Relative path without /api
    expect(getFileUrl("uploads/thumb.jpg")).toBe(
      "http://localhost:8080/api/uploads/thumb.jpg",
    )
    expect(getFileUrl("/uploads/thumb.jpg")).toBe(
      "http://localhost:8080/api/uploads/thumb.jpg",
    )

    // Relative path already containing /api
    expect(getFileUrl("/api/uploads/thumb.jpg")).toBe(
      "http://localhost:8080/api/uploads/thumb.jpg",
    )
    expect(getFileUrl("api/uploads/thumb.jpg")).toBe(
      "http://localhost:8080/api/uploads/thumb.jpg",
    )
  })

  it("returns image dimensions when loaded successfully", async () => {
    const originalImage = window.Image
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL

    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url")
    URL.revokeObjectURL = vi.fn()

    class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      naturalWidth = 1920
      naturalHeight = 1080
      set src(_value: string) {
        setTimeout(() => {
          this.onload?.()
        }, 0)
      }
    }
    window.Image = MockImage as any

    const testFile = new File(["dummy content"], "test.jpg", {
      type: "image/jpeg",
    })
    const dimensions = await getImageDimensions(testFile)

    expect(dimensions).toEqual({ width: 1920, height: 1080 })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")

    window.Image = originalImage
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it("rejects when image loading fails", async () => {
    const originalImage = window.Image
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL

    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url")
    URL.revokeObjectURL = vi.fn()

    class MockImageError {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) {
        setTimeout(() => {
          this.onerror?.()
        }, 0)
      }
    }
    window.Image = MockImageError as any

    const testFile = new File(["corrupt content"], "broken.jpg", {
      type: "image/jpeg",
    })
    await expect(getImageDimensions(testFile)).rejects.toThrow(
      "Unable to read image dimensions",
    )

    window.Image = originalImage
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it("returns the original file when dimensions are within max bounds", async () => {
    const originalImage = window.Image
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL

    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url")
    URL.revokeObjectURL = vi.fn()

    class MockImageSmall {
      onload: (() => void) | null = null
      naturalWidth = 800
      naturalHeight = 600
      set src(_value: string) {
        setTimeout(() => {
          this.onload?.()
        }, 0)
      }
    }
    window.Image = MockImageSmall as any

    const testFile = new File(["small image"], "small.jpg", {
      type: "image/jpeg",
    })
    const result = await resizeTo4K(testFile)

    expect(result).toBe(testFile)

    window.Image = originalImage
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })
})
