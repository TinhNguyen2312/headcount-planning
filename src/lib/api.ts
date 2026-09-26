import type { AxiosRequestConfig } from "axios"
import { handleMockRequest } from "@/mock/mockServer"

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return handleMockRequest<T>("GET", url, undefined, config)
  },

  post: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return handleMockRequest<T>("POST", url, data, config)
  },

  put: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return handleMockRequest<T>("PUT", url, data, config)
  },

  patch: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return handleMockRequest<T>("PATCH", url, data, config)
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return handleMockRequest<T>("DELETE", url, undefined, config)
  },
}
