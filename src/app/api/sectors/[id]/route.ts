import { eq } from "drizzle-orm"
import { db, regions, sectors } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateSectorSchema } from "@/server/schemas/sector.schema"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.SECTOR_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [sector] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, params.id))

    if (!sector) {
      throw new NotFoundError("Không tìm thấy khu vực")
    }

    return sector
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.SECTOR_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateSectorSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy khu vực")
    }

    if (body.code && body.code !== existing.code) {
      const [codeConflict] = await db
        .select({ id: sectors.id })
        .from(sectors)
        .where(eq(sectors.code, body.code))
        .limit(1)

      if (codeConflict) {
        throw new ConflictError("Mã khu vực đã tồn tại")
      }
    }

    const [updated] = await db
      .update(sectors)
      .set(body)
      .where(eq(sectors.id, params.id))
      .returning()

    return {
      data: updated,
      message: "Cập nhật khu vực thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.SECTOR_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy khu vực")
    }

    const [hasRegions] = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.sectorId, params.id))
      .limit(1)

    if (hasRegions) {
      throw new BadRequestError("Không thể xóa khu vực đang chứa vùng dự án")
    }

    await db.delete(sectors).where(eq(sectors.id, params.id))

    return {
      data: { message: "Xóa khu vực thành công" },
      message: "Xóa khu vực thành công",
    }
  },
})
