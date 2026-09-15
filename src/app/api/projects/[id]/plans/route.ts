import { NextRequest } from "next/server"
import { eq, desc, sql } from "drizzle-orm"
import { db, plans, phases, projects, milestones } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type { PlanCreatePayload, PlanResponse } from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const projectId = parseInt(id, 10)
    if (isNaN(projectId)) return apiError("ID dự án không hợp lệ", 400)

    const projectPlans = await db
      .select({
        id: plans.id,
        projectId: plans.projectId,
        versionName: plans.versionName,
        status: plans.status,
        validFrom: plans.validFrom,
        note: plans.note,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
        phasesCount: sql<number>`count(${phases.id})::int`,
      })
      .from(plans)
      .leftJoin(phases, eq(plans.id, phases.planId))
      .where(eq(plans.projectId, projectId))
      .groupBy(plans.id)
      .orderBy(desc(plans.createdAt))

    return apiSuccess<PlanResponse[]>(projectPlans as unknown as PlanResponse[])
  } catch (error) {
    console.error("Lỗi khi lấy danh sách plans:", error)
    return apiError("Lỗi hệ thống khi lấy danh sách kế hoạch", 500)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const projectId = parseInt(id, 10)
    if (isNaN(projectId)) return apiError("ID dự án không hợp lệ", 400)

    // Check project existence
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
    if (!project) return apiError("Không tìm thấy dự án", 404)

    const body: PlanCreatePayload = await req.json()
    if (!body.versionName || !body.versionName.trim()) {
      return apiError("Tên phiên bản không được để trống", 400)
    }
    if (!body.validFrom) {
      return apiError("Ngày hiệu lực không được để trống", 400)
    }

    const newPlan = await db.transaction(async (tx) => {
      // Check if version name already exists for this project
      const [existing] = await tx
        .select({ id: plans.id })
        .from(plans)
        .where(
          sql`${plans.projectId} = ${projectId} AND ${plans.versionName} = ${body.versionName.trim()}`,
        )

      if (existing) {
        throw new Error(
          `Phiên bản "${body.versionName.trim()}" đã tồn tại trong dự án`,
        )
      }

      // Insert new plan
      const [insertedPlan] = await tx
        .insert(plans)
        .values({
          projectId,
          versionName: body.versionName.trim(),
          status: "DRAFT",
          validFrom: body.validFrom,
          note: body.note?.trim() || null,
        })
        .returning()

      // If cloning from an existing plan
      if (body.cloneFromPlanId) {
        const sourcePhases = await tx
          .select()
          .from(phases)
          .where(eq(phases.planId, body.cloneFromPlanId))
          .orderBy(phases.orderIndex)

        if (sourcePhases.length > 0) {
          const phasesToInsert = sourcePhases.map((sp) => ({
            planId: insertedPlan.id,
            orderIndex: sp.orderIndex,
            milestoneId: sp.milestoneId,
            startDate: sp.startDate,
            endDate: sp.endDate,
            durationMonths: sp.durationMonths ?? 1,
            description: sp.description,
          }))

          await tx.insert(phases).values(phasesToInsert)
        }
      } else if (body.phases && body.phases.length > 0) {
        // Direct initial phases provided
        const seenMilestones = new Set<number>()
        for (const p of body.phases) {
          if (seenMilestones.has(p.milestoneId)) {
            throw new Error(
              "Không được chọn trùng milestone trong cùng một kế hoạch",
            )
          }
          seenMilestones.add(p.milestoneId)
        }

        const phasesToInsert = body.phases.map((p, idx) => ({
          planId: insertedPlan.id,
          orderIndex: p.orderIndex ?? idx + 1,
          milestoneId: p.milestoneId,
          startDate: p.startDate,
          endDate: p.endDate,
          durationMonths:
            p.durationMonths && p.durationMonths >= 1 ? p.durationMonths : 1,
          description: p.description?.trim() || null,
        }))

        await tx.insert(phases).values(phasesToInsert)
      }

      return insertedPlan
    })

    return apiSuccess(newPlan, "Tạo phiên bản kế hoạch thành công")
  } catch (error: any) {
    console.error("Lỗi khi tạo plan:", error)
    return apiError(error.message || "Lỗi hệ thống khi tạo kế hoạch", 400)
  }
}
