import { NextRequest } from "next/server"
import { eq, sql } from "drizzle-orm"
import { db, plans, phases } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id, planId } = await params
    const projectId = parseInt(id, 10)
    const pId = parseInt(planId, 10)
    if (isNaN(projectId) || isNaN(pId)) {
      return apiError("Tham số không hợp lệ", 400)
    }

    const activatedPlan = await db.transaction(async (tx) => {
      const [targetPlan] = await tx
        .select()
        .from(plans)
        .where(sql`${plans.id} = ${pId} AND ${plans.projectId} = ${projectId}`)

      if (!targetPlan) throw new Error("Không tìm thấy kế hoạch")

      // Verify it has at least 1 phase
      const [phaseCount] = await tx
        .select({ count: sql<number>`count(${phases.id})::int` })
        .from(phases)
        .where(eq(phases.planId, pId))

      if (!phaseCount || phaseCount.count === 0) {
        throw new Error(
          "Không thể kích hoạt kế hoạch chưa có giai đoạn (phase) nào",
        )
      }

      // Archive any currently active plans for this project
      await tx
        .update(plans)
        .set({
          status: "ARCHIVED",
          updatedAt: new Date().toISOString(),
        })
        .where(
          sql`${plans.projectId} = ${projectId} AND ${plans.status} = 'ACTIVE' AND ${plans.id} != ${pId}`,
        )

      // Set target plan to ACTIVE
      const [updated] = await tx
        .update(plans)
        .set({
          status: "ACTIVE",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(plans.id, pId))
        .returning()

      return updated
    })

    return apiSuccess(
      activatedPlan,
      "Đã kích hoạt phiên bản kế hoạch thành công",
    )
  } catch (error: any) {
    console.error("Lỗi khi kích hoạt plan:", error)
    return apiError(error.message || "Lỗi hệ thống khi kích hoạt kế hoạch", 400)
  }
}
