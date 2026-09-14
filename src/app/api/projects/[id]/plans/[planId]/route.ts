import { NextRequest } from "next/server"
import { eq, sql, inArray } from "drizzle-orm"
import { db, plans, phases, milestones } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type { PhaseResponse, PlanResponse, PlanUpdatePayload } from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> },
) {
  try {
    const { id, planId } = await params
    const projectId = parseInt(id, 10)
    const pId = parseInt(planId, 10)
    if (isNaN(projectId) || isNaN(pId)) {
      return apiError("Tham số không hợp lệ", 400)
    }

    const [plan] = await db
      .select()
      .from(plans)
      .where(sql`${plans.id} = ${pId} AND ${plans.projectId} = ${projectId}`)

    if (!plan) return apiError("Không tìm thấy kế hoạch", 404)

    const rawPhases = await db
      .select({
        id: phases.id,
        planId: phases.planId,
        orderIndex: phases.orderIndex,
        milestoneId: phases.milestoneId,
        startMonth: phases.startMonth,
        durationMonths: phases.durationMonths,
        isAnchor: phases.isAnchor,
        description: phases.description,
        createdAt: phases.createdAt,
        updatedAt: phases.updatedAt,
        milestoneIdJoined: milestones.id,
        milestoneCode: milestones.code,
        milestoneName: milestones.name,
        milestoneDescription: milestones.description,
      })
      .from(phases)
      .leftJoin(milestones, eq(phases.milestoneId, milestones.id))
      .where(eq(phases.planId, pId))
      .orderBy(phases.orderIndex, phases.startMonth)

    const formattedPhases: PhaseResponse[] = rawPhases.map((rp) => ({
      id: rp.id,
      planId: rp.planId,
      orderIndex: rp.orderIndex,
      milestoneId: rp.milestoneId,
      startMonth: rp.startMonth,
      durationMonths: rp.durationMonths,
      isAnchor: rp.isAnchor,
      description: rp.description,
      createdAt: rp.createdAt,
      updatedAt: rp.updatedAt,
      endMonth: rp.startMonth + rp.durationMonths - 1,
      milestone: rp.milestoneIdJoined
        ? {
            id: rp.milestoneIdJoined,
            code: rp.milestoneCode,
            name: rp.milestoneName,
            description: rp.milestoneDescription,
          }
        : null,
    }))

    const result: PlanResponse = {
      id: plan.id,
      projectId: plan.projectId,
      versionName: plan.versionName,
      status: plan.status as any,
      validFrom: plan.validFrom,
      note: plan.note,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      phasesCount: formattedPhases.length,
      phases: formattedPhases,
    }

    return apiSuccess(result)
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết plan:", error)
    return apiError("Lỗi hệ thống khi lấy chi tiết kế hoạch", 500)
  }
}

export async function PATCH(
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

    const [existingPlan] = await db
      .select()
      .from(plans)
      .where(sql`${plans.id} = ${pId} AND ${plans.projectId} = ${projectId}`)

    if (!existingPlan) return apiError("Không tìm thấy kế hoạch", 404)

    const body: PlanUpdatePayload = await req.json()

    await db.transaction(async (tx) => {
      // 1. Update plan metadata if provided
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      }

      if (body.versionName !== undefined && body.versionName.trim() !== "") {
        const trimmedVersion = body.versionName.trim()
        if (trimmedVersion !== existingPlan.versionName) {
          const [nameConflict] = await tx
            .select({ id: plans.id })
            .from(plans)
            .where(
              sql`${plans.projectId} = ${projectId} AND ${plans.versionName} = ${trimmedVersion} AND ${plans.id} != ${pId}`,
            )
          if (nameConflict) {
            throw new Error(
              `Phiên bản "${trimmedVersion}" đã tồn tại trong dự án`,
            )
          }
          updateData.versionName = trimmedVersion
        }
      }

      if (body.validFrom !== undefined) {
        updateData.validFrom = body.validFrom
      }

      if (body.note !== undefined) {
        updateData.note = body.note?.trim() || null
      }

      await tx.update(plans).set(updateData).where(eq(plans.id, pId))

      // 2. Synchronize phases if body.phases is provided
      if (body.phases !== undefined) {
        const seenMilestones = new Set<number>()
        for (const p of body.phases) {
          if (seenMilestones.has(p.milestoneId)) {
            throw new Error(
              "Không được chọn trùng milestone trong cùng một kế hoạch",
            )
          }
          seenMilestones.add(p.milestoneId)
        }

        // Current phases in DB
        const currentPhases = await tx
          .select()
          .from(phases)
          .where(eq(phases.planId, pId))

        const incomingIds = body.phases
          .map((p) => p.id)
          .filter((id): id is number => typeof id === "number" && id > 0)

        // Delete removed phases
        const idsToDelete = currentPhases
          .filter((cp) => !incomingIds.includes(cp.id))
          .map((cp) => cp.id)

        if (idsToDelete.length > 0) {
          await tx.delete(phases).where(inArray(phases.id, idsToDelete))
        }

        // Upsert phases
        for (const p of body.phases) {
          const sMonth = Math.max(1, p.startMonth || 1)
          const dMonths = Math.max(1, p.durationMonths || 1)
          const isAnch = Boolean(p.isAnchor)
          const desc = p.description?.trim() || null

          if (p.id && incomingIds.includes(p.id)) {
            // Update existing phase
            await tx
              .update(phases)
              .set({
                orderIndex: p.orderIndex,
                milestoneId: p.milestoneId,
                startMonth: sMonth,
                durationMonths: dMonths,
                isAnchor: isAnch,
                description: desc,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(phases.id, p.id))
          } else {
            // Insert new phase
            await tx.insert(phases).values({
              planId: pId,
              orderIndex: p.orderIndex,
              milestoneId: p.milestoneId,
              startMonth: sMonth,
              durationMonths: dMonths,
              isAnchor: isAnch,
              description: desc,
            })
          }
        }
      }
    })

    return apiSuccess(null, "Cập nhật kế hoạch thành công")
  } catch (error: any) {
    console.error("Lỗi khi cập nhật plan:", error)
    return apiError(error.message || "Lỗi hệ thống khi cập nhật kế hoạch", 400)
  }
}

export async function DELETE(
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

    const [existingPlan] = await db
      .select()
      .from(plans)
      .where(sql`${plans.id} = ${pId} AND ${plans.projectId} = ${projectId}`)

    if (!existingPlan) return apiError("Không tìm thấy kế hoạch", 404)

    // Delete plan (cascades to phases automatically)
    await db.delete(plans).where(eq(plans.id, pId))

    return apiSuccess(null, "Xóa kế hoạch thành công")
  } catch (error) {
    console.error("Lỗi khi xóa plan:", error)
    return apiError("Lỗi hệ thống khi xóa kế hoạch", 500)
  }
}
