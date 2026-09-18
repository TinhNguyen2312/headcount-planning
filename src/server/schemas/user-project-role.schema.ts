import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryUserProjectRoleSchema = PaginationQuerySchema.extend({
  userId: z.coerce.number().int().optional(),
  projectId: z.coerce.number().int().optional(),
  roleId: z.coerce.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type QueryUserProjectRoleInput = z.infer<typeof QueryUserProjectRoleSchema>

export const CreateUserProjectRoleSchema = z.object({
  userId: z.coerce.number().int(),
  projectId: z.coerce.number().int(),
  roleId: z.coerce.number().int(),
  accessRoleId: z.coerce.number().int().nullable().optional(),
  isPrimary: z.boolean().default(true),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})

export type CreateUserProjectRoleInput = z.infer<typeof CreateUserProjectRoleSchema>

export const UpdateUserProjectRoleSchema = z.object({
  projectId: z.coerce.number().int().optional(),
  roleId: z.coerce.number().int().optional(),
  accessRoleId: z.coerce.number().int().nullable().optional(),
  isPrimary: z.boolean().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type UpdateUserProjectRoleInput = z.infer<typeof UpdateUserProjectRoleSchema>

export const AssignReplacementSchema = z.object({
  replacementUserId: z.coerce.number().int(),
  replacementFrom: z.string().optional(),
  replacementTo: z.string().nullable().optional(),
})

export type AssignReplacementInput = z.infer<typeof AssignReplacementSchema>
