import { createApiHandler, IdParamSchema } from "@/server/core"
import { UpdateDepartmentSchema } from "@/server/modules/departments/department.schema"
import { DepartmentService } from "@/server/modules/departments/department.service"

export const GET = createApiHandler({
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await DepartmentService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  auth: true,
  paramsSchema: IdParamSchema,
  bodySchema: UpdateDepartmentSchema,
  handler: async ({ params, body }) => {
    return await DepartmentService.update(params.id, body)
  },
})

export const DELETE = createApiHandler({
  auth: true,
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await DepartmentService.delete(params.id)
  },
})
