import axios, { type AxiosError, type AxiosRequestConfig } from "axios"
import { clearSession } from "@/lib/token"
import { getConfig } from "./config"

const MAX_RETRY = 3
const BASE_DELAY = 500
const REQUEST_TIMEOUT = 30 * 1000

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retryCount?: number
}

// Global Axios instance with credentials enabled for session cookies
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const customApiUrl = getConfig().apiUrl
    if (typeof window === "undefined") {
      config.baseURL =
        customApiUrl || `http://localhost:${process.env.PORT || 3000}`
    } else {
      config.baseURL = customApiUrl
    }
    config.withCredentials = true
    if (config.headers) {
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json"
      }
      config.headers.Accept = "application/json"
    }

    if (config.params?.page != null) {
      config.params.page = Math.max(0, Number(config.params.page) - 1)
    }

    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response.data,

  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const url = request?.url || ""
    const isAuthLoginRequest =
      url.includes("/auth/login") || url.includes("/auth/local")

    if (status === 401) {
      clearSession()
      if (!isAuthLoginRequest) {
        const isLoginPage =
          typeof window !== "undefined" && window.location.pathname === "/login"
        if (!isLoginPage) {
          getConfig().onUnauthorized?.()
        }
      }

      return Promise.reject(error)
    }

    const method = request?.method?.toLowerCase()
    const isClientError =
      status !== undefined && status >= 400 && status < 500 && status !== 429
    const shouldRetry = !isClientError && method === "get"

    if (shouldRetry) {
      request._retryCount = request._retryCount ?? 0

      if (request._retryCount < MAX_RETRY) {
        request._retryCount += 1

        const baseDelay = BASE_DELAY * 2 ** (request._retryCount - 1)
        const jitter = Math.random() * 0.3 * baseDelay
        const delay = baseDelay + jitter

        await new Promise((resolve) => setTimeout(resolve, delay))

        if (request.signal?.aborted) {
          return Promise.reject(error)
        }

        return axiosInstance(request)
      }
    }

    return Promise.reject(error)
  },
)

export { axiosInstance as axios }
