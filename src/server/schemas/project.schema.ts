import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryProjectSchema = PaginationQuerySchema.extend({
  status: z.enum(["PLANNING", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  regionId: z.coerce.number().int().optional(),
  sectorId: z.coerce.number().int().optional(),
})

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Tên dự án không được để trống"),
  code: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  generalInfo: z.string().trim().nullable().optional(),
  regionId: z.coerce.number().int().nullable().optional(),
  status: z
    .enum(["PLANNING", "ACTIVE", "PAUSED", "COMPLETED"])
    .default("ACTIVE"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  projectType: z
    .enum(["ALL", "LOW_RISE", "HIGH_RISE", "MIXED"])
    .default("HIGH_RISE"),
  thumbnail: z.string().trim().nullable().optional(),
})

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1, "Tên dự án không được để trống").optional(),
  code: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  generalInfo: z.string().trim().nullable().optional(),
  regionId: z.coerce.number().int().nullable().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  projectType: z.enum(["ALL", "LOW_RISE", "HIGH_RISE", "MIXED"]).optional(),
  thumbnail: z.string().trim().nullable().optional(),
})

export const SaveProjectPropertiesSchema = z.object({
  values: z
    .array(
      z.object({
        propertyId: z.coerce.number().int(),
        projectType: z.string().default("ALL"),
        valueNumber: z.coerce.number().nullable().optional(),
        valueText: z.string().nullable().optional(),
      }),
    )
    .default([]),
})

export type QueryProjectInput = z.infer<typeof QueryProjectSchema>
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
export type SaveProjectPropertiesInput = z.infer<
  typeof SaveProjectPropertiesSchema
>
