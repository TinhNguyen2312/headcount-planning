import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { uploadMutations } from "@/hooks/server/uploads"
import { useUI } from "@/hooks/useUI"
import { UploadsAPI } from "@/services/uploads"

vi.mock("@/services/uploads", () => ({
  UploadsAPI: {
    uploadFile: vi.fn(),
    uploadMultipleFiles: vi.fn(),
  },
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: vi.fn(),
}))

describe("useUploadFile & useUploadFiles Hook", () => {
  let queryClient: QueryClient
  const mockShowLoading = vi.fn()
  const mockHideLoading = vi.fn()
  const mockMessage = {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.mocked(useUI).mockReturnValue({
      showLoading: mockShowLoading,
      hideLoading: mockHideLoading,
      message: mockMessage,
    } as any)
  })

  it("uploads a valid file and triggers loading lifecycle", async () => {
    const mockFile = new File(["test-content"], "document.pdf", {
      type: "application/pdf",
    })
    const mockResponse = {
      code: 200,
      message: "Tải tệp lên thành công",
      result: {
        fileUrl: "https://minio.example.com/gms/document.pdf",
        originalFileName: "document.pdf",
        storedFileName: "document.pdf",
        contentType: "application/pdf",
        size: 1234,
      },
    }

    vi.mocked(UploadsAPI.uploadFile).mockResolvedValue(mockResponse as any)

    const { result } = renderHook(() => uploadMutations.useUploadFile(), {
      wrapper,
    })

    let uploadResult: any
    await waitFor(async () => {
      uploadResult = await result.current.mutateAsync(mockFile)
    })

    expect(mockShowLoading).toHaveBeenCalledWith("Đang tải lên...")
    expect(UploadsAPI.uploadFile).toHaveBeenCalledWith(mockFile)
    expect(uploadResult).toEqual(mockResponse)
    expect(mockHideLoading).toHaveBeenCalled()
  })

  it("rejects file exceeding max size limit", async () => {
    const oversizedFile = new File(["dummy"], "large.zip", {
      type: "application/zip",
    })
    Object.defineProperty(oversizedFile, "size", {
      value: 101 * 1024 * 1024,
    })

    const { result } = renderHook(() => uploadMutations.useUploadFile(), {
      wrapper,
    })

    await expect(result.current.mutateAsync(oversizedFile)).rejects.toThrow(
      "File size exceeds 100MB limit",
    )

    expect(mockMessage.warning).toHaveBeenCalledWith(
      expect.stringContaining("vượt quá 100MB"),
    )
    expect(UploadsAPI.uploadFile).not.toHaveBeenCalled()
  })

  it("uploads multiple files with useUploadFiles", async () => {
    const mockFiles = [
      new File(["content-1"], "file1.pdf", { type: "application/pdf" }),
      new File(["content-2"], "file2.pdf", { type: "application/pdf" }),
    ]

    const mockMultipleResponse = {
      code: 200,
      message: "Tải các tệp lên thành công",
      result: [
        {
          fileUrl: "https://minio.example.com/gms/file1.pdf",
          originalFileName: "file1.pdf",
        },
        {
          fileUrl: "https://minio.example.com/gms/file2.pdf",
          originalFileName: "file2.pdf",
        },
      ],
    }

    vi.mocked(UploadsAPI.uploadMultipleFiles).mockResolvedValue(
      mockMultipleResponse as any,
    )

    const { result } = renderHook(() => uploadMutations.useUploadFiles(), {
      wrapper,
    })

    let uploadResult: any
    await waitFor(async () => {
      uploadResult = await result.current.mutateAsync(mockFiles)
    })

    expect(mockShowLoading).toHaveBeenCalledWith("Đang tải lên các tệp...")
    expect(UploadsAPI.uploadMultipleFiles).toHaveBeenCalledWith(mockFiles)
    expect(uploadResult).toEqual(mockMultipleResponse)
    expect(mockHideLoading).toHaveBeenCalled()
  })
})
