import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const PlanningMethodEnum = z.enum(["BY_SECTOR", "BY_REGION", "BY_PROJECT"])
export type PlanningMethod = z.infer<typeof PlanningMethodEnum>

export const QueryRoleSchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
  departmentId: z.coerce.number().int().optional(),
  parentRoleId: z.coerce.number().int().optional(),
  planningMethod: PlanningMethodEnum.optional(),
})

export const QueryRoleTreeSchema = z.object({
  departmentId: z.coerce.number().int().optional(),
})

export const CreateRoleSchema = z.object({
  name: z.string().min(1, "Tên chức danh không được để trống").trim(),
  code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  shortCode: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  level: z.coerce.number().int().min(1).default(1),
  parentRoleId: z.coerce.number().int().optional().nullable(),
  departmentId: z.coerce.number().int().optional().nullable(),
  planningMethod: PlanningMethodEnum.default("BY_PROJECT"),
  description: z.string().optional().nullable(),
})

export const UpdateRoleSchema = z.object({
  name: z.string().min(1, "Tên chức danh không được để trống").trim().optional(),
  code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  shortCode: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  level: z.coerce.number().int().min(1).optional(),
  parentRoleId: z.coerce.number().int().optional().nullable(),
  departmentId: z.coerce.number().int().optional().nullable(),
  planningMethod: PlanningMethodEnum.optional(),
  description: z.string().optional().nullable(),
})

export type QueryRoleInput = z.infer<typeof QueryRoleSchema>
export type QueryRoleTreeInput = z.infer<typeof QueryRoleTreeSchema>
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
