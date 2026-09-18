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
import { validateUserProjectAssignment } from "@/lib/userProjectHelpers"
import {
  BadRequestError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
  validateProjectRoleAssignment,
} from "@/server/core"
import { UpdateUserProjectRoleSchema } from "@/server/schemas/user-project-role.schema"
import {
  formatUserProjectRoleRow,
  repUsers,
  userProjectRoleSelection,
} from "../helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [row] = await db
      .select(userProjectRoleSelection)
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(eq(userProjects.id, params.id))

    if (!row) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

    return formatUserProjectRoleRow(row)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateUserProjectRoleSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({
        id: userProjects.id,
        userId: userProjects.userId,
        projectId: userProjects.projectId,
        roleId: userProjects.roleId,
        status: userProjects.status,
      })
      .from(userProjects)
      .where(eq(userProjects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
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

    const targetUserId = existing.userId
    const targetProjectId = body.projectId ?? existing.projectId
    const targetRoleId = body.roleId ?? existing.roleId
    const targetStatus = body.status ?? existing.status

    if (targetStatus === "ACTIVE") {
      const validation = await validateUserProjectAssignment({
        userId: targetUserId,
        projectId: targetProjectId,
        roleId: targetRoleId,
        currentAssignmentId: params.id,
        status: targetStatus,
      })
      if (!validation.valid) {
        throw new BadRequestError(validation.error || "Phân công dự án không hợp lệ")
      }
    }

    await db
      .update(userProjects)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, params.id))

    const [updatedRow] = await db
      .select(userProjectRoleSelection)
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(eq(userProjects.id, params.id))

    return {
      data: updatedRow ? formatUserProjectRoleRow(updatedRow) : null,
      message: "Cập nhật phân công thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: userProjects.id })
      .from(userProjects)
      .where(eq(userProjects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

    await db.delete(userProjects).where(eq(userProjects.id, params.id))

    return {
      data: { message: "Hủy phân công thành công" },
      message: "Hủy phân công thành công",
    }
  },
})
