import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryDepartmentSchema = PaginationQuerySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional(),
  type: z.string().trim().optional(),
  level: z.coerce.number().int().optional(),
  parentId: z.coerce.number().int().optional(),
  keyword: z.string().optional(),
})

export const QueryDepartmentTreeSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).default("ACTIVE"),
})

export const CreateDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Tên phòng ban không được để trống"),
  code: z.string().trim().min(1, "Mã phòng ban không được để trống"),
  type: z.string().trim().default("Department"),
  level: z.coerce.number().int().default(1),
  parentId: z.coerce.number().int().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  metadata: z.any().optional(),
})

export const UpdateDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Tên phòng ban không được để trống").optional(),
  code: z.string().trim().min(1, "Mã phòng ban không được để trống").optional(),
  type: z.string().trim().optional(),
  level: z.coerce.number().int().optional(),
  parentId: z.coerce.number().int().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  metadata: z.any().optional(),
})

export type QueryDepartmentInput = z.infer<typeof QueryDepartmentSchema>
export type QueryDepartmentTreeInput = z.infer<typeof QueryDepartmentTreeSchema>
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>
