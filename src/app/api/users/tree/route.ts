import { and, asc, eq, inArray, type SQL } from "drizzle-orm"
import { db, roles, userProjects, users } from "@/db"
import { createApiHandler, PERMISSIONS } from "@/server/core"
import { QueryUserTreeSchema } from "@/server/schemas/user.schema"
import {
  buildProjectsSubquery,
  formatUserRow,
  managers,
} from "../user.helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  querySchema: QueryUserTreeSchema,
  handler: async ({ query }) => {
    const conditions: SQL[] = []
    if (query.status) conditions.push(eq(users.status, query.status))

    if (query.projectId !== undefined && !isNaN(query.projectId)) {
      const upRows = await db
        .select({ userId: userProjects.userId })
        .from(userProjects)
        .where(
          and(
            eq(userProjects.projectId, query.projectId),
            eq(userProjects.status, "ACTIVE"),
          ),
        )
      const uids = upRows.map((u) => u.userId)
      if (uids.length > 0) {
        conditions.push(inArray(users.id, uids))
      } else {
        return { data: [], message: "Thành công" }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const userRows = await db
      .select({
        user: users,
        role: roles,
        manager: managers,
        projects: buildProjectsSubquery(),
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(managers, eq(users.managerPerNumber, managers.perNumber))
      .where(whereClause)
      .orderBy(asc(users.perNumber), asc(users.fullName))

    const nodesByPer = new Map<string, any>()
    const allNodes: any[] = []

    for (const r of userRows) {
      const node = {
        ...formatUserRow(r),
        children: [] as any[],
      }
      allNodes.push(node)
      if (r.user.perNumber) {
        nodesByPer.set(r.user.perNumber, node)
      }
    }

    const roots: any[] = []
    for (const node of allNodes) {
      const mgrPer = node.user.managerPerNumber
      const parent = mgrPer ? nodesByPer.get(mgrPer) : null
      if (parent && parent.user.id !== node.user.id) {
        parent.children.push(node)
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
