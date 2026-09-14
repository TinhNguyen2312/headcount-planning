import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { hashPassword } from "@/lib/security"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const { email, fullName, password, role } = body

    if (!fullName || !fullName.trim())
      return apiError("Họ và tên không được để trống", 422)
    if (!password || password.length < 6)
      return apiError("Mật khẩu phải có ít nhất 6 ký tự", 422)

    if (email) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim()))
      if (existing) return apiError("Email đã được đăng ký trong hệ thống", 409)
    }

    const passwordHash = await hashPassword(password)

    const [created] = await db
      .insert(users)
      .values({
        email: email ? email.trim() : null,
        fullName: fullName.trim(),
        passwordHash,
        systemRole: role || "USER",
        status: "ACTIVE",
        provider: "LOCAL",
      })
      .returning()

    return apiSuccess(created, "Tạo người dùng nội bộ thành công")
  } catch (error) {
    console.error("Create local user error:", error)
    return apiError("Lỗi tạo người dùng", 500)
  }
}
