import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { hashPassword, verifyPassword } from "@/lib/security"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)

    if (!currentUser) {
      return apiError("Chưa đăng nhập", 401, 401)
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return apiError(
        "Mật khẩu hiện tại và mật khẩu mới không được để trống",
        400,
      )
    }

    const isMatch = await verifyPassword(
      currentPassword,
      currentUser.passwordHash,
    )
    if (!isMatch) {
      return apiError("Mật khẩu hiện tại không chính xác", 400)
    }

    const newHash = await hashPassword(newPassword)
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date().toISOString() })
      .where(eq(users.id, currentUser.id))

    return apiSuccess(
      { message: "Đổi mật khẩu thành công" },
      "Đổi mật khẩu thành công",
    )
  } catch (error) {
    console.error("Change password error:", error)
    return apiError("Lỗi hệ thống khi đổi mật khẩu", 500)
  }
}
