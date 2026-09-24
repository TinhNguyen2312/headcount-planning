import { z } from "zod"

export const QueryAccessRoleSchema = z.object({
  page: z.coerce.number().int().nonnegative().optional().default(0),
  limit: z.coerce.number().int().positive().max(200).optional().default(100),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  scope: z.enum(["GLOBAL", "PROJECT"]).optional(),
  parentId: z.coerce.number().int().positive().optional(),
  keyword: z.string().trim().optional(),
})

export type QueryAccessRoleInput = z.infer<typeof QueryAccessRoleSchema>

export const CreateAccessRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên vai trò không được để trống")
    .max(100, "Tên vai trò tối đa 100 ký tự"),
  scope: z.enum(["GLOBAL", "PROJECT"]).default("PROJECT"),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional(),
  parentId: z.number().int().positive().nullable().optional(),
  permissionIds: z.array(z.number().int().positive()).optional().default([]),
})

export type CreateAccessRoleInput = z.infer<typeof CreateAccessRoleSchema>

export const UpdateAccessRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên vai trò không được để trống")
    .max(100, "Tên vai trò tối đa 100 ký tự")
    .optional(),
  scope: z.enum(["GLOBAL", "PROJECT"]).optional(),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  permissionIds: z.array(z.number().int().positive()).optional(),
})

export type UpdateAccessRoleInput = z.infer<typeof UpdateAccessRoleSchema>

export const AssignUserAccessRolesSchema = z.object({
  accessRoleIds: z.array(z.number().int().positive()),
})

export type AssignUserAccessRolesInput = z.infer<typeof AssignUserAccessRolesSchema>

export const QueryPermissionSchema = z.object({
  scope: z.enum(["GLOBAL", "PROJECT"]).optional(),
  groupName: z.string().trim().optional(),
})

export type QueryPermissionInput = z.infer<typeof QueryPermissionSchema>
