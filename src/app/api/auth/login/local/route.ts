import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { verifyPassword } from "@/lib/security"
import { createSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { formatUserResponse } from "@/lib/userHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"
const SESSION_EXPIRE_MINUTES = parseInt(
  process.env.SESSION_EXPIRE_MINUTES || "480",
  10,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return apiError("Email và mật khẩu không được để trống", 400)
    }

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return apiError("Tài khoản hoặc mật khẩu không chính xác", 400)
    }

    const isMatch = await verifyPassword(password, user.passwordHash)
    if (!isMatch) {
      return apiError("Tài khoản hoặc mật khẩu không chính xác", 400)
    }

    if (user.status !== "ACTIVE") {
      return apiError("Tài khoản đang bị khóa hoặc ngừng hoạt động", 400)
    }

    const session = await createSession(user.id)
    const userRes = await formatUserResponse(user)

    const response = apiSuccess(userRes, "Đăng nhập thành công")

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRE_MINUTES * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return apiError("Đã có lỗi xảy ra trong quá trình đăng nhập", 500)
  }
}
