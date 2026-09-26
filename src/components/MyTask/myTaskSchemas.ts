import { z } from "zod"

export const myTasksSearchSchema = z.object({
  tab: z.enum(["my-tasks", "approvals"]).optional().default("my-tasks"),
  projectId: z.coerce.number().optional(),
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  category: z.enum(["all", "DAILY", "ADHOC"]).optional().default("all"),
  stageStatus: z
    .enum(["all", "TODO", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().positive().optional().default(1),
  viewMode: z.enum(["grid", "list"]).optional(),
})

export type MyTasksSearch = z.infer<typeof myTasksSearchSchema>
