import { and, asc, count, desc, eq, type SQL } from "drizzle-orm"
import {
  accessRoles,
  db,
  departments,
  projects,
  roles,
  userProjects,
  users,
} from "@/db"
import { validateUserProjectAssignment } from "@/lib/userProjectHelpers"
import {
  BadRequestError,
  createApiHandler,
  createPaginationMeta,
  NotFoundError,
  PERMISSIONS,
  validateProjectRoleAssignment,
} from "@/server/core"
import {
  CreateUserProjectRoleSchema,
  QueryUserProjectRoleSchema,
} from "@/server/schemas/user-project-role.schema"
import {
  formatUserProjectRoleRow,
  repUsers,
  userProjectRoleSelection,
} from "./helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_VIEW],
  querySchema: QueryUserProjectRoleSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.userId !== undefined && !isNaN(query.userId)) {
      conditions.push(eq(userProjects.userId, query.userId))
    }
    if (query.projectId !== undefined && !isNaN(query.projectId)) {
      conditions.push(eq(userProjects.projectId, query.projectId))
    }
    if (query.roleId !== undefined && !isNaN(query.roleId)) {
      conditions.push(eq(userProjects.roleId, query.roleId))
    }
    if (query.status) {
      conditions.push(eq(userProjects.status, query.status))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(userProjects)
      .where(whereClause)

    const rows = await db
      .select(userProjectRoleSelection)
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(userProjects.id) : desc(userProjects.id))
      .offset(offset)
      .limit(limit)

    return {
      data: rows.map(formatUserProjectRoleRow),
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_ASSIGN],
  bodySchema: CreateUserProjectRoleSchema,
  handler: async ({ body }) => {
    if (body.accessRoleId) {
      const [ar] = await db
        .select({ id: accessRoles.id, scope: accessRoles.scope })
        .from(accessRoles)
        .where(eq(accessRoles.id, body.accessRoleId))
      if (!ar) {
        throw new NotFoundError("Vai trò dự án (accessRoleId) không tồn tại")
      }
      validateProjectRoleAssignment(ar.scope)
    }

    if (body.status === "ACTIVE") {
      const validation = await validateUserProjectAssignment({
        userId: body.userId,
        projectId: body.projectId,
        roleId: body.roleId,
        status: body.status,
      })
      if (!validation.valid) {
        throw new BadRequestError(validation.error || "Phân công dự án không hợp lệ")
      }
    }

    const [created] = await db
      .insert(userProjects)
      .values({
        effectiveFrom: new Date().toISOString().split("T")[0],
        ...body,
        status: body.status || "ACTIVE",
      })
      .returning()

    const [row] = await db
      .select(userProjectRoleSelection)
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(eq(userProjects.id, created.id))

    return {
      data: row ? formatUserProjectRoleRow(row) : null,
      message: "Phân công dự án thành công",
    }
  },
})
