import { and, asc, eq, type SQL } from "drizzle-orm"
import { db, permissions } from "@/db"
import { createApiHandler, PERMISSIONS } from "@/server/core"
import { QueryPermissionSchema } from "@/server/schemas"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_VIEW],
  querySchema: QueryPermissionSchema,
  handler: async ({ query }) => {
    const conditions: SQL[] = []

    if (query.scope) {
      conditions.push(eq(permissions.scope, query.scope))
    }

    if (query.groupName) {
      conditions.push(eq(permissions.groupName, query.groupName))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const rows = await db
      .select()
      .from(permissions)
      .where(whereClause)
      .orderBy(
        asc(permissions.groupName),
        asc(permissions.scope),
        asc(permissions.id),
      )

    return {
      data: rows,
      message: "Thành công",
    }
  },
})
