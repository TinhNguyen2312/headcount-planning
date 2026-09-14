import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, userProjects } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { getDetailedUserProjectRole } from "@/lib/userProjectHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = _req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const uprId = parseInt(id, 10)

    const [updated] = await db
      .update(userProjects)
      .set({
        replacementUserId: null,
        replacementFrom: null,
        replacementTo: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, uprId))
      .returning()

    if (!updated) return apiError("Không tìm thấy phân công dự án", 404)

    const detail = await getDetailedUserProjectRole(updated.id)
    return apiSuccess(detail, "Hủy nhân sự thay thế thành công")
  } catch (error) {
    return apiError("Lỗi hủy nhân sự thay thế", 500)
  }
}
