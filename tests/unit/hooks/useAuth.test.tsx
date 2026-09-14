import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { AxiosError } from "axios"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { clearSession, setSessionActive } from "@/lib/token"
import { AuthAPI } from "@/services/auth"
import { authStore } from "@/stores/authStore"
import type { UserMeResponse } from "@/types"

// Mock useUI
const mockShowError = vi.fn()
const mockShowSuccess = vi.fn()
vi.mock("@/hooks/useUI", () => ({
  useUI: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess,
    message: {
      error: mockShowError,
      success: mockShowSuccess,
      warning: vi.fn(),
    },
  }),
}))

// Mock AuthAPI
vi.mock("@/services/auth", () => ({
  AuthAPI: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    azureLoginUrl: () => "http://localhost:8080/api/auth/login/azure",
    azureLoginNewAccountUrl: () =>
      "http://localhost:8080/api/auth/login/azure/new-account",
  },
}))

describe("useAuth Hook & Session State", () => {
  let queryClient: QueryClient

  const mockUser: UserMeResponse = {
    id: 1,
    fullName: "Nguyen Van A",
    email: "vana@example.com",
    phone: "0901234567",
    status: "ACTIVE",
    systemRole: "SUPER_ADMIN",
    perNumber: "NV001",
    novatorStatus: 1,
    departmentCode: "IT",
    divisionCode: "DIV1",
    managerPerNumber: null,
    provider: "LOCAL",
    createdAt: "2026-01-01T00:00:00Z",
    projects: [],
    currentProject: null,
    role: null,
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    localStorage.clear()
    authStore.getState().clearAuth()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearSession()
  })

  it("returns null/undefined user when not logged in", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeUndefined()
    expect(result.current.isAuthenticated).toBe(false)
    expect(isLoggedIn()).toBe(false)
  })

  it("fetches current user profile when session is active", async () => {
    setSessionActive(true)
    vi.mocked(AuthAPI.me).mockResolvedValueOnce(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      // SUPER_ADMIN is pinned automatically: role resolves, currentProject stays null
      expect(result.current.user).toEqual({ ...mockUser, role: "SUPER_ADMIN" })
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(AuthAPI.me).toHaveBeenCalledTimes(1)
  })

  it("executes session login mutation successfully and navigates to home", async () => {
    vi.mocked(AuthAPI.login).mockResolvedValueOnce({
      code: 1000,
      message: "Success",
      result: mockUser,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.loginMutation.mutateAsync({
        email: "vana@example.com",
        password: "password123",
      })
    })

    expect(AuthAPI.login).toHaveBeenCalledWith({
      email: "vana@example.com",
      password: "password123",
    })
    // Navigation on successful login is now handled by the caller (login route),
    // not by the hook itself.
    expect(isLoggedIn()).toBe(true)
  })

  it("shows error toast when session login mutation fails", async () => {
    const axiosError = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        data: { detail: "Sai tài khoản hoặc mật khẩu" },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as any,
      },
    )
    vi.mocked(AuthAPI.login).mockRejectedValueOnce(axiosError)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.loginMutation.mutateAsync({
          email: "vana@example.com",
          password: "wrong-password",
        })
      } catch {}
    })

    expect(mockShowError).toHaveBeenCalledWith("Sai tài khoản hoặc mật khẩu")
    expect(isLoggedIn()).toBe(false)
  })

  it("executes logout and clears session state", async () => {
    setSessionActive(true)
    vi.mocked(AuthAPI.me).mockResolvedValueOnce(mockUser)
    vi.mocked(AuthAPI.logout).mockResolvedValueOnce({
      message: "Logged out",
    } as any)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(AuthAPI.logout).toHaveBeenCalledTimes(1)
    expect(isLoggedIn()).toBe(false)
    // Logout now does a hard redirect (window.location.href), not router navigate.
  })

  it("fetchAndStoreUser successfully activates session and returns user", async () => {
    vi.mocked(AuthAPI.me).mockResolvedValueOnce(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    let fetchedUser: UserMeResponse | null = null
    await act(async () => {
      fetchedUser = await result.current.fetchAndStoreUser()
    })

    expect(fetchedUser).toEqual(mockUser)
    expect(isLoggedIn()).toBe(true)
    expect(AuthAPI.me).toHaveBeenCalledTimes(1)
  })

  it("fetchAndStoreUser clears session and returns null on failure", async () => {
    vi.mocked(AuthAPI.me).mockRejectedValueOnce(new Error("Unauthorized"))

    const { result } = renderHook(() => useAuth(), { wrapper })

    let fetchedUser: UserMeResponse | null = null
    await act(async () => {
      fetchedUser = await result.current.fetchAndStoreUser()
    })

    expect(fetchedUser).toBeNull()
    expect(isLoggedIn()).toBe(false)
  })
})
