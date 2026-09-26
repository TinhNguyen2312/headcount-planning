import { z } from "zod"

export const subordinatesSearchSchema = z.object({
  projectId: z.coerce.number().optional(),
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  userId: z.coerce.number().optional(),
  stageStatus: z
    .enum(["ALL", "TODO", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"])
    .optional()
    .default("ALL"),
  page: z.coerce.number().int().positive().optional().default(1),
  viewMode: z.enum(["grid", "list"]).optional(),
})

export type SubordinatesSearch = z.infer<typeof subordinatesSearchSchema>
