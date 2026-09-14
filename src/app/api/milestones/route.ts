import { NextRequest } from "next/server"
import {
  ilike,
  or,
  and,
  count,
  desc,
  asc,
  eq,
  inArray,
  type SQL,
} from "drizzle-orm"
import { db, milestones, milestoneDependencies } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      500,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "desc" ? "desc" : "asc"
    const isActiveParam = searchParams.get("isActive")

    const conditions: SQL[] = []
    if (keyword) {
      const keywordCond = or(
        ilike(milestones.name, `%${keyword}%`),
        ilike(milestones.code, `%${keyword}%`),
      )
      if (keywordCond) conditions.push(keywordCond)
    }
    if (
      isActiveParam !== null &&
      isActiveParam !== undefined &&
      isActiveParam !== ""
    ) {
      conditions.push(eq(milestones.isActive, isActiveParam === "true"))
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(milestones)
      .where(whereCondition)

    const items = await db
      .select()
      .from(milestones)
      .where(whereCondition)
      .orderBy(order === "desc" ? desc(milestones.id) : asc(milestones.id))
      .offset(page * limit)
      .limit(limit)

    // Also fetch all milestone dependencies to enrich items with predecessors and successors
    const allDeps = await db.select().from(milestoneDependencies)
    const allMilestones = await db.select().from(milestones)
    const milestoneMap = new Map(allMilestones.map((m) => [m.id, m]))

    const enrichedItems = items.map((m) => {
      const preds = allDeps
        .filter((d) => d.toMilestoneId === m.id)
        .map((d) => {
          const fromM = milestoneMap.get(d.fromMilestoneId)
          return {
            id: d.fromMilestoneId,
            code: fromM?.code || `ID_${d.fromMilestoneId}`,
            name: fromM?.name || "",
            dependencyType: d.dependencyType as any,
          }
        })

      const succs = allDeps
        .filter((d) => d.fromMilestoneId === m.id)
        .map((d) => {
          const toM = milestoneMap.get(d.toMilestoneId)
          return {
            id: d.toMilestoneId,
            code: toM?.code || `ID_${d.toMilestoneId}`,
            name: toM?.name || "",
            dependencyType: d.dependencyType as any,
          }
        })

      return {
        ...m,
        predecessorIds: preds.map((p) => p.id),
        predecessors: preds,
        successorIds: succs.map((s) => s.id),
        successors: succs,
      }
    })

    return apiSuccess(
      enrichedItems,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get milestones error:", error)
    return apiError("Lỗi lấy danh sách mốc tiến độ", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const { code, name, description, isActive = true, predecessorIds } = body

    if (!code || !code.trim()) {
      return apiError("Mã mốc tiến độ không được để trống", 422)
    }

    if (!name || !name.trim()) {
      return apiError("Tên mốc tiến độ không được để trống", 422)
    }

    const [existing] = await db
      .select()
      .from(milestones)
      .where(eq(milestones.code, code.trim()))

    if (existing) {
      return apiError("Mã mốc tiến độ đã tồn tại", 409)
    }

    const [created] = await db
      .insert(milestones)
      .values({
        code: code.trim(),
        name: name.trim(),
        description: description || null,
        isActive: Boolean(isActive),
      })
      .returning()

    // Add dependencies if provided
    if (Array.isArray(predecessorIds) && predecessorIds.length > 0) {
      const depValues = predecessorIds
        .filter((predId: number) => predId !== created.id)
        .map((predId: number) => ({
          fromMilestoneId: predId,
          toMilestoneId: created.id,
          dependencyType: "FINISH_TO_START",
          description: `Mốc phụ thuộc khởi tạo cùng ${created.code}`,
        }))

      if (depValues.length > 0) {
        await db.insert(milestoneDependencies).values(depValues)
      }
    }

    return apiSuccess(created, "Tạo mốc tiến độ thành công")
  } catch (error) {
    console.error("Create milestone error:", error)
    return apiError("Lỗi tạo mốc tiến độ", 500)
  }
}
