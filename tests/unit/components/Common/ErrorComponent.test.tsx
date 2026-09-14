import { useRouter } from "@tanstack/react-router"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ErrorComponent from "@/components/Common/ErrorComponent"

vi.mock("@tanstack/react-router", () => ({
  useRouter: vi.fn(),
}))

describe("ErrorComponent", () => {
  const mockNavigate = vi.fn()
  const mockBack = vi.fn()
  const mockInvalidate = vi.fn()
  const mockResetErrorBoundary = vi.fn()
  const mockReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      navigate: mockNavigate,
      history: {
        back: mockBack,
      },
      invalidate: mockInvalidate,
    } as any)
  })

  it("renders default error message when no error prop is passed", () => {
    render(<ErrorComponent />)

    expect(screen.getByText("Có lỗi xảy ra!")).toBeTruthy()
    expect(
      screen.getByText(
        "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay lại trang trước.",
      ),
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: /Thử lại/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /Quay lại/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /Về trang chủ/i })).toBeTruthy()
  })

  it("renders friendly 404 message when 404 error is encountered", () => {
    const error404 = {
      isAxiosError: true,
      response: { status: 404, data: {} },
    }
    render(<ErrorComponent error={error404} />)

    expect(screen.getByText("404 - Không tìm thấy dữ liệu")).toBeTruthy()
    expect(
      screen.getByText(
        "Dữ liệu hoặc trang bạn yêu cầu không tồn tại hoặc đã bị xóa.",
      ),
    ).toBeTruthy()
  })

  it("renders friendly 403 message when 403 error is encountered", () => {
    const error403 = {
      isAxiosError: true,
      response: { status: 403, data: {} },
    }
    render(<ErrorComponent error={error403} />)

    expect(screen.getByText("403 - Không có quyền truy cập")).toBeTruthy()
  })

  it("handles retry action by calling reset callbacks and router invalidation", () => {
    render(
      <ErrorComponent
        resetErrorBoundary={mockResetErrorBoundary}
        reset={mockReset}
      />,
    )

    const retryButton = screen.getByRole("button", { name: /Thử lại/i })
    fireEvent.click(retryButton)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(mockInvalidate).toHaveBeenCalledTimes(1)
  })

  it("handles back action with browser history when history length > 1", () => {
    Object.defineProperty(window, "history", {
      value: { length: 2 },
      writable: true,
    })

    render(
      <ErrorComponent
        resetErrorBoundary={mockResetErrorBoundary}
        reset={mockReset}
      />,
    )

    const backButton = screen.getByRole("button", { name: /Quay lại/i })
    fireEvent.click(backButton)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(mockInvalidate).toHaveBeenCalledTimes(1)
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  it("handles back action by fallback to home when history length <= 1", () => {
    Object.defineProperty(window, "history", {
      value: { length: 1 },
      writable: true,
    })

    render(
      <ErrorComponent
        resetErrorBoundary={mockResetErrorBoundary}
        reset={mockReset}
      />,
    )

    const backButton = screen.getByRole("button", { name: /Quay lại/i })
    fireEvent.click(backButton)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(mockInvalidate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" })
  })

  it("handles go home action by resetting and navigating to root", () => {
    render(
      <ErrorComponent
        resetErrorBoundary={mockResetErrorBoundary}
        reset={mockReset}
      />,
    )

    const homeButton = screen.getByRole("button", { name: /Về trang chủ/i })
    fireEvent.click(homeButton)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(mockInvalidate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" })
  })
})
