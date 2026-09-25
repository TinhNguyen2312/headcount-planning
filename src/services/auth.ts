import { mockStore } from "@/mocks/store"
import type {
  ChangePasswordRequest,
  ItemResponse,
  LocalLoginRequest,
  MessageResponse,
  UserMeResponse,
} from "@/types"

export const AuthAPI = {
  loginLocal: async (
    data: LocalLoginRequest,
  ): Promise<ItemResponse<UserMeResponse>> => {
    const user = await mockStore.login(data.email)
    return {
      code: 0,
      message: "Đăng nhập thành công",
      result: user,
    }
  },

  getMe: async (): Promise<ItemResponse<UserMeResponse>> => {
    const user = await mockStore.getMe()
    return {
      code: 0,
      message: "Thành công",
      result: user,
    }
  },

  logout: async (): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.logout()
    return {
      code: 0,
      message: "Đăng xuất thành công",
      result: { message: "Đăng xuất thành công" },
    }
  },

  changePassword: async (
    _data: ChangePasswordRequest,
  ): Promise<ItemResponse<MessageResponse>> => {
    return {
      code: 0,
      message: "Đổi mật khẩu thành công",
      result: { message: "Đổi mật khẩu thành công" },
    }
  },
}
