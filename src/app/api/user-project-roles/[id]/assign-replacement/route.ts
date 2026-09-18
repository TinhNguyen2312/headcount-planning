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
} from "@/server/core"
import { AssignReplacementSchema } from "@/server/schemas/user-project-role.schema"
import {
  formatUserProjectRoleRow,
  repUsers,
  userProjectRoleSelection,
} from "../../helper"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: AssignReplacementSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: userProjects.id })
      .from(userProjects)
      .where(eq(userProjects.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

    await db
      .update(userProjects)
      .set({
        replacementUserId: body.replacementUserId,
        replacementFrom:
          body.replacementFrom || new Date().toISOString().split("T")[0],
        replacementTo: body.replacementTo || null,
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
      message: "Gán người thay thế thành công",
    }
  },
})
