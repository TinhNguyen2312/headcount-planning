import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  ChangePasswordRequest,
  ItemResponse,
  LocalLoginRequest,
  MessageResponse,
  UserMeResponse,
  UserResponse,
} from "@/types"

export const AuthAPI = {
  loginLocal: (data: LocalLoginRequest) =>
    apiClient.post<ItemResponse<UserResponse>>(
      `${API_V1}/auth/login/local`,
      data,
    ),

  getMe: () => apiClient.get<ItemResponse<UserMeResponse>>(`${API_V1}/auth/me`),

  logout: () =>
    apiClient.post<ItemResponse<MessageResponse>>(`${API_V1}/auth/logout`),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ItemResponse<MessageResponse>>(
      `${API_V1}/auth/change-password`,
      data,
    ),
}
