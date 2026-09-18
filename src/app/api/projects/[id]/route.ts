import { eq } from "drizzle-orm"
import { db, projects, regions, sectors } from "@/db"
import {
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateProjectSchema } from "@/server/schemas/project.schema"

const formatProjectRow = (row: any) => ({
  project: {
    ...row.project,
    region: row.region,
    sector: row.sector,
  },
})

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [row] = await db
      .select({
        project: projects,
        region: regions,
        sector: sectors,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(projects.id, params.id))

    if (!row) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    return formatProjectRow(row)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateProjectSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: projects.id, code: projects.code })
      .from(projects)
      .where(eq(projects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    if (body.code && body.code.trim() !== existing.code) {
      const [codeConflict] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.code, body.code.trim()))
        .limit(1)

      if (codeConflict && codeConflict.id !== params.id) {
        throw new ConflictError("Mã dự án đã tồn tại trong hệ thống")
      }
    }

    await db
      .update(projects)
      .set(body)
      .where(eq(projects.id, params.id))

    const [updatedRow] = await db
      .select({
        project: projects,
        region: regions,
        sector: sectors,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(projects.id, params.id))

    return {
      data: updatedRow ? formatProjectRow(updatedRow) : null,
      message: "Cập nhật dự án thành công",
    }
  },
})

export const PUT = PATCH

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    await db.delete(projects).where(eq(projects.id, params.id))

    return {
      data: { message: "Xóa dự án thành công" },
      message: "Xóa dự án thành công",
    }
  },
})
