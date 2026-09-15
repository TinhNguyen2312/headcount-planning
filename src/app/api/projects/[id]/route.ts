import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, projects, regions, sectors } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const projectId = parseInt(id, 10)

    const [row] = await db
      .select({
        id: projects.id,
        code: projects.code,
        name: projects.name,
        address: projects.address,
        generalInfo: projects.generalInfo,
        regionId: projects.regionId,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        projectTypes: projects.projectTypes,
        thumbnail: projects.thumbnail,
        createdAt: projects.createdAt,
        regionName: regions.name,
        regionCode: regions.code,
        sectorId: regions.sectorId,
        sectorName: sectors.name,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(projects.id, projectId))

    if (!row) return apiError("Không tìm thấy dự án", 404)
    return apiSuccess(row)
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
    const projectId = parseInt(id, 10)
    const body = await req.json()

    const [updated] = await db
      .update(projects)
      .set({
        name: body.name !== undefined ? body.name.trim() : undefined,
        code: body.code !== undefined ? body.code.trim() : undefined,
        address: body.address !== undefined ? body.address : undefined,
        generalInfo:
          body.generalInfo !== undefined ? body.generalInfo : undefined,
        regionId: body.regionId !== undefined ? body.regionId : undefined,
        status: body.status !== undefined ? body.status : undefined,
        startDate: body.startDate !== undefined ? body.startDate : undefined,
        endDate: body.endDate !== undefined ? body.endDate : undefined,
        projectTypes:
          body.projectTypes !== undefined ? body.projectTypes : undefined,
        thumbnail: body.thumbnail !== undefined ? body.thumbnail : undefined,
      })
      .where(eq(projects.id, projectId))
      .returning()

    if (!updated) return apiError("Không tìm thấy dự án", 404)
    return apiSuccess(updated, "Cập nhật dự án thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật dự án", 500)
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
    const projectId = parseInt(id, 10)

    await db.delete(projects).where(eq(projects.id, projectId))
    return apiSuccess(
      { message: "Xóa dự án thành công" },
      "Xóa dự án thành công",
    )
  } catch (error) {
    return apiError("Lỗi xóa dự án", 500)
  }
}
