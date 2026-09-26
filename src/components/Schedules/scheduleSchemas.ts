import { z } from "zod"

export const weekScheduleSearchSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export type WeekScheduleSearch = z.infer<typeof weekScheduleSearchSchema>
