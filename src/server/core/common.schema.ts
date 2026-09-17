import { z } from "zod"

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  order: z
    .enum(["asc", "desc", "ASC", "DESC"])
    .default("desc")
    .transform((val) => val.toLowerCase() as "asc" | "desc"),
  sortBy: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID phải là số nguyên dương" }),
})

export type IdParam = z.infer<typeof IdParamSchema>
