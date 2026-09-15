import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, headcountProjects, projects, regions, sectors } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type { HeadcountProjectUpdatePayload } from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const [row] = await db
      .select({
        id: headcountProjects.id,
        projectId: headcountProjects.projectId,
        isActive: headcountProjects.isActive,
        note: headcountProjects.note,
        createdAt: headcountProjects.createdAt,
        updatedAt: headcountProjects.updatedAt,
        project: {
          id: projects.id,
          code: projects.code,
          name: projects.name,
          address: projects.address,
          startDate: projects.startDate,
          endDate: projects.endDate,
          status: projects.status,
          thumbnail: projects.thumbnail,
          regionId: regions.id,
          regionName: regions.name,
          sectorId: sectors.id,
          sectorName: sectors.name,
        },
      })
      .from(headcountProjects)
      .innerJoin(projects, eq(headcountProjects.projectId, projects.id))
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(headcountProjects.id, id))
      .limit(1)

    if (!row) {
      return apiError("Không tìm thấy dự án định biên", 404, 404)
    }

    return apiSuccess(row, "Lấy thông tin dự án định biên thành công")
  } catch (error: any) {
    console.error("GET /api/headcount-projects/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi lấy thông tin dự án định biên",
      500,
      500,
      error.message,
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) {
      return apiError("Chưa đăng nhập", 401, 401)
    }

    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const body: HeadcountProjectUpdatePayload = await req.json()

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive)
    }

    if (body.note !== undefined) {
      updateData.note = body.note?.trim() || null
    }

    const [updated] = await db
      .update(headcountProjects)
      .set(updateData)
      .where(eq(headcountProjects.id, id))
      .returning()

    if (!updated) {
      return apiError("Không tìm thấy dự án định biên để cập nhật", 404, 404)
    }

    return apiSuccess(updated, "Cập nhật dự án định biên thành công")
  } catch (error: any) {
    console.error("PATCH /api/headcount-projects/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi cập nhật dự án định biên",
      500,
      500,
      error.message,
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) {
      return apiError("Chưa đăng nhập", 401, 401)
    }

    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const [deleted] = await db
      .delete(headcountProjects)
      .where(eq(headcountProjects.id, id))
      .returning({ id: headcountProjects.id })

    if (!deleted) {
      return apiError("Không tìm thấy dự án định biên để xóa", 404, 404)
    }

    return apiSuccess(deleted, "Hủy dự án khỏi danh sách định biên thành công")
  } catch (error: any) {
    console.error("DELETE /api/headcount-projects/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi hủy dự án định biên",
      500,
      500,
      error.message,
    )
  }
}
