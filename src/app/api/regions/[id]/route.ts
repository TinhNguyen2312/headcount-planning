import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, regions, sectors, projects } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const regionId = parseInt(id, 10)
    const [region] = await db
      .select({
        id: regions.id,
        sectorId: regions.sectorId,
        code: regions.code,
        name: regions.name,
        description: regions.description,
        createdAt: regions.createdAt,
        sectorName: sectors.name,
        sectorCode: sectors.code,
      })
      .from(regions)
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(regions.id, regionId))

    if (!region) return apiError("Không tìm thấy vùng", 404)
    return apiSuccess(region)
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
    const regionId = parseInt(id, 10)
    const body = await req.json()

    const [updated] = await db
      .update(regions)
      .set({
        name: body.name !== undefined ? body.name.trim() : undefined,
        code: body.code !== undefined ? body.code.trim() : undefined,
        sectorId: body.sectorId !== undefined ? body.sectorId : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
      })
      .where(eq(regions.id, regionId))
      .returning()

    if (!updated) return apiError("Không tìm thấy vùng", 404)
    return apiSuccess(updated, "Cập nhật vùng thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật vùng", 500)
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
    const regionId = parseInt(id, 10)

    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.regionId, regionId))
      .limit(1)
    if (existingProject) {
      return apiError("Không thể xóa vùng đang có dự án", 400)
    }

    await db.delete(regions).where(eq(regions.id, regionId))
    return apiSuccess({ message: "Xóa vùng thành công" }, "Xóa vùng thành công")
  } catch (error) {
    return apiError("Lỗi xóa vùng", 500)
  }
}
