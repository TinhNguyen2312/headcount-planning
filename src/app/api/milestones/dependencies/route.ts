import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db, milestoneDependencies, milestones } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET() {
  try {
    const deps = await db.select().from(milestoneDependencies)
    return apiSuccess(deps, "Thành công")
  } catch (error) {
    console.error("Get milestone dependencies error:", error)
    return apiError("Lỗi lấy danh sách liên kết mốc tiến độ", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const {
      fromMilestoneId,
      toMilestoneId,
      dependencyType = "FINISH_TO_START",
      description,
    } = body

    if (!fromMilestoneId || !toMilestoneId) {
      return apiError("Cần cung cấp mốc xuất phát và mốc đích", 422)
    }

    if (fromMilestoneId === toMilestoneId) {
      return apiError("Mốc tiến độ không thể phụ thuộc vào chính nó", 422)
    }

    // Check existing
    const [existing] = await db
      .select()
      .from(milestoneDependencies)
      .where(
        and(
          eq(milestoneDependencies.fromMilestoneId, fromMilestoneId),
          eq(milestoneDependencies.toMilestoneId, toMilestoneId),
        ),
      )

    if (existing) {
      return apiError("Liên kết phụ thuộc giữa 2 mốc đã tồn tại", 409)
    }

    // Cycle check: Ensure toMilestoneId does not already lead to fromMilestoneId
    const allDeps = await db.select().from(milestoneDependencies)
    const adjList = new Map<number, number[]>()
    for (const d of allDeps) {
      const list = adjList.get(d.fromMilestoneId) || []
      list.push(d.toMilestoneId)
      adjList.set(d.fromMilestoneId, list)
    }

    // BFS from toMilestoneId to see if fromMilestoneId is reachable
    const visited = new Set<number>()
    const queue = [toMilestoneId]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === fromMilestoneId) {
        return apiError(
          "Không thể tạo liên kết: Sẽ gây ra chu trình lặp vô tận (DAG Cycle)!",
          400,
        )
      }
      visited.add(current)
      for (const next of adjList.get(current) || []) {
        if (!visited.has(next)) {
          queue.push(next)
        }
      }
    }

    const [created] = await db
      .insert(milestoneDependencies)
      .values({
        fromMilestoneId,
        toMilestoneId,
        dependencyType,
        description: description || null,
      })
      .returning()

    return apiSuccess(created, "Tạo liên kết phụ thuộc thành công")
  } catch (error) {
    console.error("Create milestone dependency error:", error)
    return apiError("Lỗi tạo liên kết phụ thuộc", 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const fromId = searchParams.get("fromMilestoneId")
    const toId = searchParams.get("toMilestoneId")

    if (id) {
      await db
        .delete(milestoneDependencies)
        .where(eq(milestoneDependencies.id, parseInt(id, 10)))
    } else if (fromId && toId) {
      await db
        .delete(milestoneDependencies)
        .where(
          and(
            eq(milestoneDependencies.fromMilestoneId, parseInt(fromId, 10)),
            eq(milestoneDependencies.toMilestoneId, parseInt(toId, 10)),
          ),
        )
    } else {
      return apiError("Thiếu tham số định danh liên kết", 400)
    }

    return apiSuccess({ message: "Xóa liên kết thành công" }, "Thành công")
  } catch (error) {
    console.error("Delete milestone dependency error:", error)
    return apiError("Lỗi xóa liên kết phụ thuộc", 500)
  }
}
