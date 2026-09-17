import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UserProjectRoleService } from "@/server/modules/user-project-roles/user-project-role.service"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_ASSIGNMENT_MANAGE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await UserProjectRoleService.cancelReplacement(params.id)
  },
})
