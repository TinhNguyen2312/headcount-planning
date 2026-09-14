import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, sectors, regions } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const sectorId = parseInt(id, 10)
    const [sector] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, sectorId))
    if (!sector) return apiError("Không tìm thấy khu vực", 404)
    return apiSuccess(sector)
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
    const sectorId = parseInt(id, 10)
    const body = await req.json()

    const [updated] = await db
      .update(sectors)
      .set({
        name: body.name !== undefined ? body.name.trim() : undefined,
        code: body.code !== undefined ? body.code.trim() : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
      })
      .where(eq(sectors.id, sectorId))
      .returning()

    if (!updated) return apiError("Không tìm thấy khu vực", 404)
    return apiSuccess(updated, "Cập nhật khu vực thành công")
  } catch (error) {
    return apiError("Lỗi cập nhật khu vực", 500)
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
    const sectorId = parseInt(id, 10)

    const [existingRegion] = await db
      .select()
      .from(regions)
      .where(eq(regions.sectorId, sectorId))
      .limit(1)
    if (existingRegion) {
      return apiError("Không thể xóa khu vực đang chứa vùng dự án", 400)
    }

    await db.delete(sectors).where(eq(sectors.id, sectorId))
    return apiSuccess(
      { message: "Xóa khu vực thành công" },
      "Xóa khu vực thành công",
    )
  } catch (error) {
    return apiError("Lỗi xóa khu vực", 500)
  }
}
