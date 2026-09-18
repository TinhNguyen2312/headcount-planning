import { asc, eq } from "drizzle-orm"
import { db, departments, roles } from "@/db"
import { createApiHandler, PERMISSIONS } from "@/server/core"
import { QueryRoleTreeSchema } from "@/server/schemas/role.schema"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ROLE_VIEW],
  querySchema: QueryRoleTreeSchema,
  handler: async ({ query }) => {
    const rows = await db
      .select({
        role: roles,
        department: departments,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(
        query.departmentId
          ? eq(roles.departmentId, query.departmentId)
          : undefined,
      )
      .orderBy(asc(roles.level), asc(roles.name))

    const map = new Map<number, any>()
    const roots: any[] = []

    for (const r of rows) {
      map.set(r.role.id, {
        ...r.role,
        department: r.department,
        children: [],
      })
    }

    for (const r of rows) {
      const node = map.get(r.role.id)!
      if (r.role.parentRoleId && map.has(r.role.parentRoleId)) {
        map.get(r.role.parentRoleId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return {
      data: roots,
      message: "Thành công",
    }
  },
})
