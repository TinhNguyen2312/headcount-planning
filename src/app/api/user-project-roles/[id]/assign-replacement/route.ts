import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, userProjects } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { getDetailedUserProjectRole } from "@/lib/userProjectHelpers"

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
    const uprId = parseInt(id, 10)
    const body = await req.json()
    const { replacementUserId, replacementFrom, replacementTo } = body

    if (!replacementUserId)
      return apiError("Nhân sự thay thế không được để trống", 422)

    const [updated] = await db
      .update(userProjects)
      .set({
        replacementUserId,
        replacementFrom:
          replacementFrom || new Date().toISOString().split("T")[0],
        replacementTo: replacementTo || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, uprId))
      .returning()

    if (!updated) return apiError("Không tìm thấy phân công dự án", 404)

    const detail = await getDetailedUserProjectRole(updated.id)
    return apiSuccess(detail, "Gán nhân sự thay thế thành công")
  } catch (error) {
    return apiError("Lỗi gán nhân sự thay thế", 500)
  }
}
