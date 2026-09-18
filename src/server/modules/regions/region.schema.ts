import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryRegionSchema = PaginationQuerySchema.extend({
  sectorId: z.coerce.number().optional(),
  keyword: z.string().optional(),
})

export const CreateRegionSchema = z.object({
  name: z.string().min(1, "Tên vùng không được để trống").trim(),
  code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  sectorId: z.coerce.number().int({ message: "Khu vực không hợp lệ" }),
  description: z.string().optional().nullable(),
})

export const UpdateRegionSchema = z.object({
  name: z.string().min(1, "Tên vùng không được để trống").trim().optional(),
  code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  sectorId: z.coerce.number().int().optional(),
  description: z.string().optional().nullable(),
})

export type QueryRegionInput = z.infer<typeof QueryRegionSchema>
export type CreateRegionInput = z.infer<typeof CreateRegionSchema>
export type UpdateRegionInput = z.infer<typeof UpdateRegionSchema>
