const SESSION_ACTIVE_KEY = "tm_session_active"

// Check if an active authenticated session exists locally
export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SESSION_ACTIVE_KEY) === "true"
}

// Mark session as active or inactive
export const setSessionActive = (active: boolean) => {
  if (typeof window === "undefined") return
  if (active) {
    localStorage.setItem(SESSION_ACTIVE_KEY, "true")
  } else {
    localStorage.removeItem(SESSION_ACTIVE_KEY)
  }
}

// Clear all local session authentication flags
export const clearSession = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_ACTIVE_KEY)
}

// Legacy alias for clearSession
export const clearTokens = () => {
  clearSession()
}

// Legacy compatibility helper
export const getAccessToken = (): string | null => null

// Legacy compatibility helper
export const getRefreshToken = (): string | null => null

// Legacy compatibility helper
export const setTokens = (_accessToken?: string, _refreshToken?: string) => {
  setSessionActive(true)
}
