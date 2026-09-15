import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, roles } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const roleId = parseInt(id, 10)
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId))
    if (!role) return apiError("Không tìm thấy chức danh", 404)
    return apiSuccess(role)
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
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const roleId = parseInt(id, 10)
    const body = await req.json()

    const [updated] = await db
      .update(roles)
      .set({
        name: body.name !== undefined ? body.name.trim() : undefined,
        code: body.code !== undefined ? body.code.trim() : undefined,
        shortCode:
          body.shortCode !== undefined ? body.shortCode.trim() : undefined,
        level: body.level !== undefined ? body.level : undefined,
        parentRoleId:
          body.parentRoleId !== undefined ? body.parentRoleId : undefined,
        departmentId:
          body.departmentId !== undefined ? body.departmentId : undefined,
        planningMethod:
          body.planningMethod !== undefined ? body.planningMethod : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
      })
      .where(eq(roles.id, roleId))
      .returning()

    if (!updated) return apiError("Không tìm thấy chức danh", 404)
    return apiSuccess(updated, "Cập nhật chức danh thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật chức danh", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const roleId = parseInt(id, 10)

    const [child] = await db
      .select()
      .from(roles)
      .where(eq(roles.parentRoleId, roleId))
      .limit(1)
    if (child)
      return apiError("Không thể xóa chức danh đang có chức danh cấp dưới", 400)

    await db.delete(roles).where(eq(roles.id, roleId))
    return apiSuccess(
      { message: "Xóa chức danh thành công" },
      "Xóa chức danh thành công",
    )
  } catch (error) {
    return apiError("Lỗi xóa chức danh", 500)
  }
}
