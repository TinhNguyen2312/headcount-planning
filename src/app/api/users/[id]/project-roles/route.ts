import { eq } from "drizzle-orm"
import {
  accessRoles,
  db,
  departments,
  projects,
  roles,
  userProjects,
  users,
} from "@/db"
import {
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
  validateProjectRoleAssignment,
} from "@/server/core"
import { AssignProjectRoleSchema } from "@/server/schemas/user.schema"
import { repUsers } from "../../user.helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const rows = await db
      .select({
        userProject: userProjects,
        project: projects,
        role: roles,
        department: departments,
        accessRole: accessRoles,
        user: users,
        replacementUser: repUsers,
      })
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(eq(userProjects.userId, params.id))

    return {
      data: rows,
      message: "Thành công",
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_ASSIGN],
  paramsSchema: IdParamSchema,
  bodySchema: AssignProjectRoleSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

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

    const [created] = await db
      .insert(userProjects)
      .values({
        effectiveFrom: new Date().toISOString().split("T")[0],
        ...body,
        userId: params.id,
        status: body.status || "ACTIVE",
      })
      .returning()

    return {
      data: created,
      message: "Phân quyền dự án thành công",
    }
  },
})
