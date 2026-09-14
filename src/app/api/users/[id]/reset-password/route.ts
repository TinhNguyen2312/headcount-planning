import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { hashPassword } from "@/lib/security"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const userId = parseInt(id, 10)
    const body = await req.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return apiError("Mật khẩu mới phải có ít nhất 6 ký tự", 400)
    }

    const newHash = await hashPassword(newPassword)
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId))

    return apiSuccess(
      { message: "Đặt lại mật khẩu thành công" },
      "Đặt lại mật khẩu thành công",
    )
  } catch (error) {
    return apiError("Lỗi đặt lại mật khẩu", 500)
  }
}
