import { NextRequest } from "next/server"
import { eq, or } from "drizzle-orm"
import {
  db,
  milestones,
  milestoneDependencies,
  phases,
  headcountStandards,
} from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const milestoneId = parseInt(id, 10)
    if (isNaN(milestoneId)) return apiError("ID mốc tiến độ không hợp lệ", 400)

    const [milestone] = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, milestoneId))

    if (!milestone) return apiError("Không tìm thấy mốc tiến độ", 404)

    const allDeps = await db.select().from(milestoneDependencies)
    const allMilestones = await db.select().from(milestones)
    const milestoneMap = new Map(allMilestones.map((m) => [m.id, m]))

    const predecessors = allDeps
      .filter((d) => d.toMilestoneId === milestoneId)
      .map((d) => ({
        id: d.fromMilestoneId,
        code: milestoneMap.get(d.fromMilestoneId)?.code || "",
        name: milestoneMap.get(d.fromMilestoneId)?.name || "",
        dependencyType: d.dependencyType,
      }))

    const successors = allDeps
      .filter((d) => d.fromMilestoneId === milestoneId)
      .map((d) => ({
        id: d.toMilestoneId,
        code: milestoneMap.get(d.toMilestoneId)?.code || "",
        name: milestoneMap.get(d.toMilestoneId)?.name || "",
        dependencyType: d.dependencyType,
      }))

    return apiSuccess({
      ...milestone,
      predecessorIds: predecessors.map((p) => p.id),
      predecessors,
      successorIds: successors.map((s) => s.id),
      successors,
    })
  } catch (error) {
    console.error("Get milestone detail error:", error)
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
    const milestoneId = parseInt(id, 10)
    if (isNaN(milestoneId)) return apiError("ID mốc tiến độ không hợp lệ", 400)

    const body = await req.json()
    const { code, name, description, isActive, predecessorIds } = body

    if (code !== undefined && !code.trim()) {
      return apiError("Mã mốc tiến độ không được để trống", 422)
    }
    if (name !== undefined && !name.trim()) {
      return apiError("Tên mốc tiến độ không được để trống", 422)
    }

    if (code) {
      const [existing] = await db
        .select()
        .from(milestones)
        .where(eq(milestones.code, code.trim()))
      if (existing && existing.id !== milestoneId) {
        return apiError("Mã mốc tiến độ đã tồn tại", 409)
      }
    }

    const [updated] = await db
      .update(milestones)
      .set({
        code: code !== undefined ? code.trim() : undefined,
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(milestones.id, milestoneId))
      .returning()

    if (!updated) return apiError("Không tìm thấy mốc tiến độ", 404)

    // Synchronize predecessor dependencies if provided
    if (Array.isArray(predecessorIds)) {
      // Delete existing incoming dependencies
      await db
        .delete(milestoneDependencies)
        .where(eq(milestoneDependencies.toMilestoneId, milestoneId))

      // Insert new predecessors
      const validPredIds = predecessorIds.filter(
        (predId: number) => predId !== milestoneId,
      )
      if (validPredIds.length > 0) {
        const depValues = validPredIds.map((predId: number) => ({
          fromMilestoneId: predId,
          toMilestoneId: milestoneId,
          dependencyType: "FINISH_TO_START",
          description: `Liên kết phụ thuộc tới ${updated.code}`,
        }))
        await db.insert(milestoneDependencies).values(depValues)
      }
    }

    return apiSuccess(updated, "Cập nhật mốc tiến độ thành công")
  } catch (error) {
    console.error("Update milestone error:", error)
    return apiError("Lỗi cập nhật mốc tiến độ", 500)
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
    const milestoneId = parseInt(id, 10)
    if (isNaN(milestoneId)) return apiError("ID mốc tiến độ không hợp lệ", 400)

    // 1. Business Check: Check if milestone is used in phases (project plans)
    const [phaseRef] = await db
      .select({ id: phases.id })
      .from(phases)
      .where(eq(phases.milestoneId, milestoneId))
      .limit(1)

    if (phaseRef) {
      return apiError(
        "Không thể xóa mốc tiến độ đã được gán và sử dụng tại Kế hoạch dự án",
        400,
      )
    }

    // 2. Business Check: Check if milestone is used in headcount_standards
    const [standardRef] = await db
      .select({ id: headcountStandards.id })
      .from(headcountStandards)
      .where(
        or(
          eq(headcountStandards.fromMilestoneId, milestoneId),
          eq(headcountStandards.toMilestoneId, milestoneId),
        ),
      )
      .limit(1)

    if (standardRef) {
      return apiError(
        "Không thể xóa mốc tiến độ đang được áp dụng trong Khung định biên chuẩn",
        400,
      )
    }

    // 3. Delete dependencies referencing this milestone
    await db
      .delete(milestoneDependencies)
      .where(
        or(
          eq(milestoneDependencies.fromMilestoneId, milestoneId),
          eq(milestoneDependencies.toMilestoneId, milestoneId),
        ),
      )

    // 4. Delete milestone
    await db.delete(milestones).where(eq(milestones.id, milestoneId))

    return apiSuccess(
      { message: "Xóa mốc tiến độ thành công" },
      "Xóa mốc tiến độ thành công",
    )
  } catch (error) {
    console.error("Delete milestone error:", error)
    return apiError("Lỗi xóa mốc tiến độ", 500)
  }
}
