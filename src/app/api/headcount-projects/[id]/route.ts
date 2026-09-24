import { eq } from "drizzle-orm"
import { db, headcountProjects, projects, regions, sectors } from "@/db"
import {
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateHeadcountProjectSchema } from "@/server/schemas/headcount-project.schema"
import {
  formatHeadcountProjectRow,
  headcountProjectSelection,
} from "../helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.HEADCOUNT_PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [row] = await db
      .select(headcountProjectSelection)
      .from(headcountProjects)
      .innerJoin(projects, eq(headcountProjects.projectId, projects.id))
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(headcountProjects.id, params.id))
      .limit(1)

    if (!row) {
      throw new NotFoundError("Không tìm thấy dự án định biên")
    }

    return formatHeadcountProjectRow(row)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.HEADCOUNT_PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateHeadcountProjectSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: headcountProjects.id })
      .from(headcountProjects)
      .where(eq(headcountProjects.id, params.id))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án định biên để cập nhật")
    }

    const [updated] = await db
      .update(headcountProjects)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(headcountProjects.id, params.id))
      .returning()

    return {
      data: updated,
      message: "Cập nhật dự án định biên thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.HEADCOUNT_PROJECT_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: headcountProjects.id })
      .from(headcountProjects)
      .where(eq(headcountProjects.id, params.id))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án định biên để xóa")
    }

    const [deleted] = await db
      .delete(headcountProjects)
      .where(eq(headcountProjects.id, params.id))
      .returning({ id: headcountProjects.id })

    return {
      data: deleted,
      message: "Hủy dự án khỏi danh sách định biên thành công",
    }
  },
})
