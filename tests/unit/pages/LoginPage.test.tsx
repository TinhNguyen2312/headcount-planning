import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Route } from "@/routes/login"

const mockNavigate = vi.fn()
const mockShowErrorToast = vi.fn()
const mockFetchAndStoreUser = vi.fn()
const mockLoginMutate = vi.fn()
const mockLoginMutateAsync = vi.fn()

let mockSearch: { callback?: string } = {}

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    createFileRoute: () => (config: any) => ({
      ...config,
      useSearch: () => mockSearch,
    }),
  }
})

vi.mock("@/hooks/useCustomToast", () => ({
  default: () => ({
    showErrorToast: mockShowErrorToast,
  }),
}))

vi.mock("@/hooks/useUI", () => ({
  useUI: () => ({
    showError: mockShowErrorToast,
    showSuccess: vi.fn(),
    message: { error: mockShowErrorToast, success: vi.fn(), warning: vi.fn() },
  }),
}))

const mockUseAuth = vi.fn(() => ({
  loginMutation: {
    mutate: mockLoginMutate,
    mutateAsync: mockLoginMutateAsync,
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null as any,
  },
  fetchAndStoreUser: mockFetchAndStoreUser,
  isAuthenticated: false,
}))

vi.mock("@/hooks/useAuth", () => ({
  default: () => mockUseAuth(),
  isLoggedIn: () => false,
}))

vi.mock("@/services/auth", () => ({
  AuthAPI: {
    azureLoginUrl: () => "/api/auth/login/azure",
  },
}))

describe("Login Route & SAML Callback", () => {
  const LoginComponent = (Route as any).component

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch = {}
    mockUseAuth.mockReturnValue({
      loginMutation: {
        mutate: mockLoginMutate,
        mutateAsync: mockLoginMutateAsync,
        reset: vi.fn(),
        isPending: false,
        isError: false,
        error: null as any,
      },
      fetchAndStoreUser: mockFetchAndStoreUser,
      isAuthenticated: false,
    })
  })

  it("renders login form elements when no callback is present", () => {
    render(<LoginComponent />)

    expect(screen.getByText("Đăng nhập Quản trị viên")).toBeTruthy()
    expect(screen.getByTestId("identifier-input")).toBeTruthy()
    expect(screen.getByTestId("password-input")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeTruthy()
    expect(
      screen.getByRole("button", { name: /Đăng nhập bằng O365/i }),
    ).toBeTruthy()
  })

  it("redirects to Azure SSO endpoint when clicking O365 login button", () => {
    const originalLocation = window.location
    // Mock window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    })

    render(<LoginComponent />)
    const o365Btn = screen.getByRole("button", { name: /Đăng nhập bằng O365/i })
    fireEvent.click(o365Btn)

    expect(window.location.href).toBe("/api/auth/login/azure")
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    })
  })

  it("processes SAML callback successfully and redirects to home", async () => {
    mockSearch = { callback: "1" }
    mockFetchAndStoreUser.mockResolvedValueOnce({
      id: 1,
      fullName: "Test User",
      email: "test@example.com",
      projects: [],
    })

    render(<LoginComponent />)

    expect(screen.getByText("Đang xác thực tài khoản O365...")).toBeTruthy()

    await waitFor(() => {
      expect(mockFetchAndStoreUser).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/", replace: true })
    })
  })

  it("handles SAML callback failure and displays error toast", async () => {
    mockSearch = { callback: "1" }
    mockFetchAndStoreUser.mockResolvedValueOnce(null)

    render(<LoginComponent />)

    await waitFor(() => {
      expect(mockFetchAndStoreUser).toHaveBeenCalledTimes(1)
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Đăng nhập O365 thất bại. Vui lòng thử lại.",
      )
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/login",
        search: {},
        replace: true,
      })
    })
  })

  it("submits login form, then redirects home when the account has a single project/role", async () => {
    const originalLocation = window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    })

    mockLoginMutateAsync.mockResolvedValueOnce({
      result: { id: 1, projects: [] },
    })

    render(<LoginComponent />)

    fireEvent.change(screen.getByTestId("identifier-input"), {
      target: { value: "user@example.com" },
    })
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }))

    await waitFor(() => {
      expect(mockLoginMutateAsync).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      })
      expect(window.location.href).toBe("/")
    })

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    })
  })

  it("shows the project picker instead of redirecting when the account has 2+ projects", async () => {
    mockLoginMutateAsync.mockResolvedValueOnce({
      result: {
        id: 1,
        projects: [
          {
            id: 1,
            name: "Project A",
            roleId: 1,
            roleName: "R1",
            projectRole: "TASK_EXECUTOR",
          },
          {
            id: 2,
            name: "Project B",
            roleId: 2,
            roleName: "R2",
            projectRole: "ZONE_ADMIN",
          },
        ],
      },
    })

    render(<LoginComponent />)

    fireEvent.change(screen.getByTestId("identifier-input"), {
      target: { value: "user@example.com" },
    })
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }))

    await waitFor(() => {
      expect(screen.getByText("Chọn dự án làm việc")).toBeTruthy()
      expect(screen.getByText("Project A")).toBeTruthy()
      expect(screen.getByText("Project B")).toBeTruthy()
    })
  })

  it("renders inline error Alert when loginMutation has an error", () => {
    mockUseAuth.mockReturnValue({
      loginMutation: {
        mutate: mockLoginMutate,
        mutateAsync: mockLoginMutateAsync,
        reset: vi.fn(),
        isPending: false,
        isError: true,
        error: {
          response: {
            data: {
              detail: "Sai tài khoản hoặc mật khẩu",
            },
          },
        } as any,
      },
      fetchAndStoreUser: mockFetchAndStoreUser,
      isAuthenticated: false,
    })

    render(<LoginComponent />)

    expect(screen.getByText("Sai tài khoản hoặc mật khẩu")).toBeTruthy()
  })
})
