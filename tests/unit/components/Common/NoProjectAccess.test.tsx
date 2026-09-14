import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import NoProjectAccess from "@/components/Common/NoProjectAccess"
import useAuth from "@/hooks/useAuth"

vi.mock("@/hooks/useAuth", () => ({
  default: vi.fn(),
}))

describe("NoProjectAccess Component", () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
    } as any)
  })

  it("renders default title and description", () => {
    render(<NoProjectAccess />)

    expect(screen.getByText("Chưa được phân công dự án")).toBeTruthy()
    expect(
      screen.getByText(
        "Tài khoản của bạn hiện chưa được gán vào dự án hoặc phân khu nào. Vui lòng liên hệ Quản trị viên (Admin) để được cấp quyền truy cập.",
      ),
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: /Tải lại trang/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /Đăng xuất/i })).toBeTruthy()
  })

  it("renders custom title and description when passed", () => {
    render(
      <NoProjectAccess
        title="Custom Title"
        description="Custom Description Text"
      />,
    )

    expect(screen.getByText("Custom Title")).toBeTruthy()
    expect(screen.getByText("Custom Description Text")).toBeTruthy()
  })
})
