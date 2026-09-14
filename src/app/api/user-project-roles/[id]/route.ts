import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, userProjects } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { getDetailedUserProjectRole } from "@/lib/userProjectHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const uprId = parseInt(id, 10)
    const detail = await getDetailedUserProjectRole(uprId)
    if (!detail) return apiError("Không tìm thấy phân công dự án", 404)
    return apiSuccess(detail)
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
    const uprId = parseInt(id, 10)
    const body = await req.json()

    const [updated] = await db
      .update(userProjects)
      .set({
        roleId: body.roleId !== undefined ? body.roleId : undefined,
        isPrimary: body.isPrimary !== undefined ? body.isPrimary : undefined,
        effectiveFrom:
          body.effectiveFrom !== undefined ? body.effectiveFrom : undefined,
        effectiveTo:
          body.effectiveTo !== undefined ? body.effectiveTo : undefined,
        status: body.status !== undefined ? body.status : undefined,
        replacementUserId:
          body.replacementUserId !== undefined
            ? body.replacementUserId
            : undefined,
        replacementFrom:
          body.replacementFrom !== undefined ? body.replacementFrom : undefined,
        replacementTo:
          body.replacementTo !== undefined ? body.replacementTo : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, uprId))
      .returning()

    if (!updated) return apiError("Không tìm thấy phân công dự án", 404)

    const detail = await getDetailedUserProjectRole(updated.id)
    return apiSuccess(detail, "Cập nhật phân công dự án thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật phân công dự án", 500)
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
    const uprId = parseInt(id, 10)

    await db.delete(userProjects).where(eq(userProjects.id, uprId))
    return apiSuccess(
      { message: "Xóa phân công dự án thành công" },
      "Xóa phân công dự án thành công",
    )
  } catch (error) {
    return apiError("Lỗi xóa phân công dự án", 500)
  }
}
