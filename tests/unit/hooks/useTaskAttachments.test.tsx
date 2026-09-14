import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useTaskAttachments } from "@/components/AdhocTask/useTaskAttachments"
import { UploadsAPI } from "@/services/uploads"

vi.mock("@/services/uploads", () => ({
  UploadsAPI: {
    uploadFile: vi.fn(),
  },
}))

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>()
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

describe("useTaskAttachments Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes with empty attachedFiles by default", () => {
    const { result } = renderHook(() => useTaskAttachments())
    expect(result.current.attachedFiles).toEqual([])
    expect(result.current.isUploading).toBe(false)
  })

  it("uploads file successfully and appends to attachedFiles", async () => {
    const mockFile = new File(["dummy"], "photo.png", { type: "image/png" })
    vi.mocked(UploadsAPI.uploadFile).mockResolvedValue({
      code: 200,
      message: "Success",
      result: {
        fileUrl: "https://minio.example.com/photo.png",
        originalFileName: "photo.png",
        storedFileName: "photo.png",
        contentType: "image/png",
        size: 5000,
      },
    } as any)

    const { result } = renderHook(() => useTaskAttachments())

    await act(async () => {
      await result.current.handleUploadFile(mockFile)
    })

    expect(UploadsAPI.uploadFile).toHaveBeenCalledWith(mockFile)
    expect(result.current.attachedFiles).toHaveLength(1)
    expect(result.current.attachedFiles[0]).toMatchObject({
      name: "photo.png",
      url: "https://minio.example.com/photo.png",
      size: 5000,
    })
    expect(result.current.attachedFiles[0].uid).toBeTruthy()
    expect(result.current.isUploading).toBe(false)
  })

  it("removes attached file by uid", async () => {
    const initialFiles = [
      { uid: "uid-1", name: "f1.png", url: "https://minio.example.com/f1.png" },
      { uid: "uid-2", name: "f2.png", url: "https://minio.example.com/f2.png" },
    ]
    const { result } = renderHook(() => useTaskAttachments(initialFiles))

    expect(result.current.attachedFiles).toHaveLength(2)

    act(() => {
      result.current.handleRemoveAttachedFile("uid-1")
    })

    expect(result.current.attachedFiles).toHaveLength(1)
    expect(result.current.attachedFiles[0].uid).toBe("uid-2")
  })

  it("clears all attachments", () => {
    const initialFiles = [
      { uid: "uid-1", name: "f1.png", url: "https://minio.example.com/f1.png" },
    ]
    const { result } = renderHook(() => useTaskAttachments(initialFiles))

    act(() => {
      result.current.clearAttachments()
    })

    expect(result.current.attachedFiles).toEqual([])
  })
})
