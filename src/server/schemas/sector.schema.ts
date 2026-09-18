import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QuerySectorSchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
})

export const CreateSectorSchema = z.object({
  name: z.string().min(1, "Tên khu vực không được để trống").trim(),
  code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  description: z.string().optional().nullable(),
})

export const UpdateSectorSchema = z.object({
  name: z.string().min(1, "Tên khu vực không được để trống").trim().optional(),
  code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  description: z.string().optional().nullable(),
})

export type QuerySectorInput = z.infer<typeof QuerySectorSchema>
export type CreateSectorInput = z.infer<typeof CreateSectorSchema>
export type UpdateSectorInput = z.infer<typeof UpdateSectorSchema>
