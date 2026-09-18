import { eq } from "drizzle-orm"
import { db, projects, regions, sectors } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateRegionSchema } from "@/server/schemas/region.schema"

const formatRegionRow = (row: any) => ({
  region: {
    ...row.region,
    sector: row.sector,
  },
})

export const GET = createApiHandler({
  permissions: [PERMISSIONS.REGION_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [row] = await db
      .select({
        region: regions,
        sector: sectors,
      })
      .from(regions)
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(regions.id, params.id))

    if (!row) {
      throw new NotFoundError("Không tìm thấy vùng")
    }

    return formatRegionRow(row)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.REGION_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateRegionSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: regions.id, code: regions.code })
      .from(regions)
      .where(eq(regions.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy vùng")
    }

    if (body.code && body.code !== existing.code) {
      const [codeConflict] = await db
        .select({ id: regions.id })
        .from(regions)
        .where(eq(regions.code, body.code))
        .limit(1)

      if (codeConflict) {
        throw new ConflictError("Mã vùng đã tồn tại")
      }
    }

    if (body.sectorId !== undefined) {
      const [sector] = await db
        .select({ id: sectors.id })
        .from(sectors)
        .where(eq(sectors.id, body.sectorId))
        .limit(1)

      if (!sector) {
        throw new BadRequestError("Khu vực không tồn tại")
      }
    }

    const [updated] = await db
      .update(regions)
      .set(body)
      .where(eq(regions.id, params.id))
      .returning()

    return {
      data: updated,
      message: "Cập nhật vùng thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.REGION_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy vùng")
    }

    const [hasProjects] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.regionId, params.id))
      .limit(1)

    if (hasProjects) {
      throw new BadRequestError("Không thể xóa vùng đang có dự án")
    }

    await db.delete(regions).where(eq(regions.id, params.id))

    return {
      data: { message: "Xóa vùng thành công" },
      message: "Xóa vùng thành công",
    }
  },
})
