import { eq, sql } from "drizzle-orm"
import { db, projects, properties, propertyValues } from "@/db"
import {
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { SaveProjectPropertiesSchema } from "@/server/schemas/project.schema"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: projects.id, projectType: projects.projectType })
      .from(projects)
      .where(eq(projects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    const activeProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.isActive, true))
      .orderBy(properties.id)

    const existingValues = await db
      .select()
      .from(propertyValues)
      .where(eq(propertyValues.projectId, params.id))

    return {
      projectId: params.id,
      projectType: existing.projectType || "HIGH_RISE",
      properties: activeProperties,
      values: existingValues,
    }
  },
})

export const PUT = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: SaveProjectPropertiesSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    if (body.values.length > 0) {
      const rowsToInsert = body.values.map((item) => ({
        projectId: params.id,
        propertyId: item.propertyId,
        projectType: item.projectType || "ALL",
        valueNumber: item.valueNumber ? String(item.valueNumber) : null,
        valueText: item.valueText ? item.valueText.trim() : null,
        updatedAt: new Date().toISOString(),
      }))

      await db
        .insert(propertyValues)
        .values(rowsToInsert)
        .onConflictDoUpdate({
          target: [
            propertyValues.projectId,
            propertyValues.propertyId,
            propertyValues.projectType,
          ],
          set: {
            valueNumber: sql`excluded.value_number`,
            valueText: sql`excluded.value_text`,
            updatedAt: sql`excluded.updated_at`,
          },
        })
    }

    return {
      data: null,
      message: "Lưu cơ sở định biên dự án thành công",
    }
  },
})
