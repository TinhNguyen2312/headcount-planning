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
    const body = await req.json()

    const [updated] = await db
      .update(users)
      .set({
        systemRole: body.systemRole !== undefined ? body.systemRole : undefined,
        roleId: body.roleId !== undefined ? body.roleId : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updated) return apiError("Không tìm thấy người dùng", 404)

    const formatted = await formatUserResponse(updated)
    return apiSuccess(formatted, "Cập nhật quyền thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật quyền", 500)
  }
}
