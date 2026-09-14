import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { formatUserResponse } from "@/lib/userHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const userId = parseInt(id, 10)

    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user) return apiError("Không tìm thấy người dùng", 404)

    const newStatus = user.status === "LOCKED" ? "ACTIVE" : "LOCKED"

    const [updated] = await db
      .update(users)
      .set({ status: newStatus, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId))
      .returning()

    const formatted = await formatUserResponse(updated)
    return apiSuccess(
      formatted,
      `${newStatus === "LOCKED" ? "Khóa" : "Mở khóa"} tài khoản thành công`,
    )
  } catch (error) {
    return apiError("Lỗi thay đổi trạng thái", 500)
  }
}
