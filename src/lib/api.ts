import type { AxiosRequestConfig } from "axios"
import { axios } from "./axios"

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axios.get<unknown, T>(url, config)
  },

  post: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return axios.post<unknown, T>(url, data, config)
  },

  put: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return axios.put<unknown, T>(url, data, config)
  },

  patch: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return axios.patch<unknown, T>(url, data, config)
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axios.delete<unknown, T>(url, config)
  },
}
