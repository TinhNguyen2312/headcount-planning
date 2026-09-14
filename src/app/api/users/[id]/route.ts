import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { formatUserResponse } from "@/lib/userHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user) return apiError("Không tìm thấy người dùng", 404)

    const formatted = await formatUserResponse(user)
    return apiSuccess(formatted)
  } catch (error) {
    return apiError("Lỗi hệ thống", 500)
  }
}

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
    const body = await req.json()

    const [updated] = await db
      .update(users)
      .set({
        fullName:
          body.fullName !== undefined ? body.fullName.trim() : undefined,
        phone: body.phone !== undefined ? body.phone.trim() : undefined,
        email: body.email !== undefined ? body.email.trim() : undefined,
        roleId: body.roleId !== undefined ? body.roleId : undefined,
        status: body.status !== undefined ? body.status : undefined,
        systemRole: body.systemRole !== undefined ? body.systemRole : undefined,
        perNumber:
          body.perNumber !== undefined ? body.perNumber.trim() : undefined,
        managerPerNumber:
          body.managerPerNumber !== undefined
            ? body.managerPerNumber.trim()
            : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updated) return apiError("Không tìm thấy người dùng", 404)

    const formatted = await formatUserResponse(updated)
    return apiSuccess(formatted, "Cập nhật người dùng thành công")
  } catch (error) {
    console.error("Update user error:", error)
    return apiError("Lỗi cập nhật người dùng", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const userId = parseInt(id, 10)

    if (currentUser.id === userId) {
      return apiError("Không thể tự xóa chính mình", 400)
    }

    await db.delete(users).where(eq(users.id, userId))
    return apiSuccess(
      { message: "Xóa người dùng thành công" },
      "Xóa người dùng thành công",
    )
  } catch (error) {
    return apiError("Lỗi xóa người dùng", 500)
  }
}
