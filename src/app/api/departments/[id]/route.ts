import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, departments, roles } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const deptId = parseInt(id, 10)
    const [dept] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, deptId))
    if (!dept) return apiError("Không tìm thấy phòng ban", 404)
    return apiSuccess(dept)
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
    const deptId = parseInt(id, 10)
    const body = await req.json()

    const [updated] = await db
      .update(departments)
      .set({
        name: body.name !== undefined ? body.name.trim() : undefined,
        code: body.code !== undefined ? body.code.trim() : undefined,
        type: body.type !== undefined ? body.type : undefined,
        level: body.level !== undefined ? body.level : undefined,
        parentId: body.parentId !== undefined ? body.parentId : undefined,
        status: body.status !== undefined ? body.status : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(departments.id, deptId))
      .returning()

    if (!updated) return apiError("Không tìm thấy phòng ban", 404)
    return apiSuccess(updated, "Cập nhật phòng ban thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật phòng ban", 500)
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
    const deptId = parseInt(id, 10)

    const [childDept] = await db
      .select()
      .from(departments)
      .where(eq(departments.parentId, deptId))
      .limit(1)
    if (childDept)
      return apiError("Không thể xóa phòng ban đang có đơn vị trực thuộc", 400)

    const [childRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.departmentId, deptId))
      .limit(1)
    if (childRole)
      return apiError("Không thể xóa phòng ban đang có chức danh gán vào", 400)

    await db.delete(departments).where(eq(departments.id, deptId))
    return apiSuccess(
      { message: "Xóa phòng ban thành công" },
      "Xóa phòng ban thành công",
    )
  } catch (error) {
    return apiError("Lỗi xóa phòng ban", 500)
  }
}
