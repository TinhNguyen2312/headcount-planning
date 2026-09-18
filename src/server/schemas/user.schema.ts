import { z } from "zod"
import { PaginationQuerySchema } from "@/server/core/common.schema"

export const QueryUserSchema = PaginationQuerySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]).optional(),
  role: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  departmentId: z.coerce.number().int().optional(),
  projectId: z.coerce.number().int().optional(),
  fullName: z.string().trim().optional(),
})

export type QueryUserInput = z.infer<typeof QueryUserSchema>

export const CreateUserSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên không được để trống"),
  email: z.string().trim().email("Email không đúng định dạng").nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  roleId: z.coerce.number().int().nullable().optional(),
  systemRole: z.enum(["USER", "SUPER_ADMIN"]).default("USER"),
  perNumber: z.string().trim().nullable().optional(),
  departmentCode: z.string().trim().nullable().optional(),
  divisionCode: z.string().trim().nullable().optional(),
  managerPerNumber: z.string().trim().nullable().optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const CreateLocalUserSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên không được để trống"),
  email: z.string().trim().email("Email không đúng định dạng").nullable().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["USER", "SUPER_ADMIN"]).default("USER"),
})

export type CreateLocalUserInput = z.infer<typeof CreateLocalUserSchema>

export const UpdateUserSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên không được để trống").optional(),
  phone: z.string().trim().nullable().optional(),
  email: z.string().trim().email("Email không đúng định dạng").nullable().optional(),
  roleId: z.coerce.number().int().nullable().optional(),
  perNumber: z.string().trim().nullable().optional(),
  novatorStatus: z.coerce.number().int().optional(),
  departmentCode: z.string().trim().nullable().optional(),
  divisionCode: z.string().trim().nullable().optional(),
  managerPerNumber: z.string().trim().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]).optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export const UpdateUserRoleSchema = z.object({
  systemRole: z.enum(["USER", "SUPER_ADMIN"]).optional(),
  roleId: z.coerce.number().int().nullable().optional(),
})

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>

export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export const AssignProjectRoleSchema = z.object({
  projectId: z.coerce.number().int().positive("Dự án không được để trống"),
  roleId: z.coerce.number().int().positive("Chức danh không được để trống"),
  accessRoleId: z.coerce.number().int().positive().nullable().optional(),
  isPrimary: z.boolean().default(true),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "ENDED"]).default("ACTIVE"),
})

export type AssignProjectRoleInput = z.infer<typeof AssignProjectRoleSchema>

export const QueryUserTreeSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]).optional(),
  projectId: z.coerce.number().int().optional(),
})

export type QueryUserTreeInput = z.infer<typeof QueryUserTreeSchema>
