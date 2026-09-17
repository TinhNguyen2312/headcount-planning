import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { AssignReplacementSchema } from "@/server/modules/user-project-roles/user-project-role.schema"
import { UserProjectRoleService } from "@/server/modules/user-project-roles/user-project-role.service"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_ASSIGNMENT_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: AssignReplacementSchema,
  handler: async ({ params, body }) => {
    return await UserProjectRoleService.assignReplacement(params.id, body)
  },
})
