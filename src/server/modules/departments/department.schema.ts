import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryDepartmentSchema = PaginationQuerySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional(),
  type: z.string().trim().optional(),
  level: z.coerce.number().int().optional(),
  parentId: z.coerce.number().int().optional(),
})

export type QueryDepartmentInput = z.infer<typeof QueryDepartmentSchema>

export const CreateDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Tên phòng ban không được để trống"),
  code: z.string().trim().min(1, "Mã phòng ban không được để trống"),
  type: z.string().trim().default("Department"),
  level: z.coerce.number().int().default(1),
  parentId: z.coerce.number().int().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  description: z.string().trim().nullable().optional(),
  metadata: z.any().optional(),
  metadataJson: z.any().optional(),
})

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>

export const UpdateDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Tên phòng ban không được để trống").optional(),
  code: z.string().trim().min(1, "Mã phòng ban không được để trống").optional(),
  type: z.string().trim().optional(),
  level: z.coerce.number().int().optional(),
  parentId: z.coerce.number().int().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  description: z.string().trim().nullable().optional(),
  metadata: z.any().optional(),
  metadataJson: z.any().optional(),
})

export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>
