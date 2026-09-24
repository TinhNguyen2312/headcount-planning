import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryHeadcountProjectSchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined
      if (typeof val === "boolean") return val
      return val.toLowerCase() === "true"
    }),
  regionId: z.coerce.number().int().optional(),
  sectorId: z.coerce.number().int().optional(),
})

export type QueryHeadcountProjectInput = z.infer<
  typeof QueryHeadcountProjectSchema
>

export const CreateHeadcountProjectSchema = z.object({
  projectId: z.coerce
    .number({ message: "Vui lòng chọn dự án để kích hoạt" })
    .int(),
  isActive: z.boolean().default(true),
  note: z.string().trim().nullable().optional(),
})

export type CreateHeadcountProjectInput = z.infer<
  typeof CreateHeadcountProjectSchema
>

export const UpdateHeadcountProjectSchema = z.object({
  isActive: z.boolean().optional(),
  note: z.string().trim().nullable().optional(),
})

export type UpdateHeadcountProjectInput = z.infer<
  typeof UpdateHeadcountProjectSchema
>
