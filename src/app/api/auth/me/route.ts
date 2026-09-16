import { NextRequest } from "next/server"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { getCurrentUserFromSession, touchSession } from "@/lib/session"
import { formatUserResponse } from "@/lib/userHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionId) {
      return apiError("Chưa đăng nhập", 401, 401)
    }

    const user = await getCurrentUserFromSession(sessionId)
    if (!user) {
      return apiError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn", 401, 401)
    }

    await touchSession(sessionId)
    const userMe = await formatUserResponse(user)

    return apiSuccess(userMe, "Lấy thông tin người dùng thành công")
  } catch (error) {
    console.error("Get me error:", error)
    return apiError("Lỗi hệ thống khi lấy thông tin người dùng", 500)
  }
}
