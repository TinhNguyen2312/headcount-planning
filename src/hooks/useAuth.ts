import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"

import { extractApiErrorMessage } from "@/lib/errors"
import { clearSession, isLoggedIn, setSessionActive } from "@/lib/token"
import { authStore } from "@/stores/authStore"
import type {
  ChangePasswordRequest,
  LocalLoginRequest,
  UserMeResponse,
} from "@/types"
import { isSuperAdminUser } from "@/types"
import { AuthAPI } from "@/services/auth"
import { authQueries } from "./server/auth"
import { useUI } from "./useUI"

const useAuth = () => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useUI()

  const { data: rawUser, isLoading } = authQueries.useMe()

  const currentProject = authStore((s) => s.currentProject)
  const role = authStore((s) => s.role)
  const setUser = authStore((s) => s.setUser)
  const clearAuth = authStore((s) => s.clearAuth)

  const prevUserIdRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (rawUser && prevUserIdRef.current !== rawUser.id) {
      prevUserIdRef.current = rawUser.id
      setUser(rawUser)
    }
  }, [rawUser, setUser])

  const user: UserMeResponse | undefined = useMemo(
    () => (rawUser ? { ...rawUser, currentProject, role } : undefined),
    [rawUser, currentProject, role],
  )

  const isSuperUser = isSuperAdminUser(user) || role === "SUPER_ADMIN"

  const fetchAndStoreUser =
    useCallback(async (): Promise<UserMeResponse | null> => {
      try {
        setSessionActive(true)
        const fetchedUser = await queryClient.fetchQuery(authQueries.me())
        setUser(fetchedUser)
        return fetchedUser
      } catch {
        clearSession()
        queryClient.removeQueries({ queryKey: authQueries.me().queryKey })
        return null
      }
    }, [queryClient, setUser])

  const loginMutation = useMutation({
    mutationFn: async (data: LocalLoginRequest) => {
      const response = await AuthAPI.loginLocal(data)
      setSessionActive(true)
      queryClient.clear()
      return response
    },
    onError: (error) => {
      showError(extractApiErrorMessage(error, "Đăng nhập thất bại"))
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => AuthAPI.changePassword(data),
    onSuccess: () => {
      showSuccess("Đổi mật khẩu thành công")
    },
    onError: (error) => {
      showError(extractApiErrorMessage(error, "Đổi mật khẩu thất bại"))
    },
  })

  const logout = async () => {
    try {
      await AuthAPI.logout()
    } catch {
      // ignore
    }
    clearAuth()
    clearSession()
    queryClient.clear()
    window.location.href = "/login"
  }

  return {
    loginMutation,
    changePasswordMutation,
    logout,
    fetchAndStoreUser,
    user,
    currentProject,
    isSuperUser,
    isLoading,
    isAuthenticated: isLoggedIn(),
  }
}

export { isLoggedIn }
export default useAuth
