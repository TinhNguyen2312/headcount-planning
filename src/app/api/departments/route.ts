import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateDepartmentSchema,
  QueryDepartmentSchema,
} from "@/server/modules/departments/department.schema"
import { DepartmentService } from "@/server/modules/departments/department.service"

export const GET = createApiHandler({
  querySchema: QueryDepartmentSchema,
  handler: async ({ query }) => {
    return await DepartmentService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  bodySchema: CreateDepartmentSchema,
  handler: async ({ body }) => {
    return await DepartmentService.create(body)
  },
})
