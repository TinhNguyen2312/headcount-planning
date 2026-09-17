import { db, accessRoles } from "@/db"
import { eq } from "drizzle-orm"
import { hashPassword } from "@/lib/security"
import type { AuthenticatedUser } from "@/server/core/auth"
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { validateProjectRoleAssignment } from "@/server/core/rbac"
import { UserRepository } from "./user.repo"
import type {
  AssignProjectRoleInput,
  CreateLocalUserInput,
  CreateUserInput,
  QueryUserInput,
  QueryUserTreeInput,
  ResetPasswordInput,
  UpdateUserInput,
  UpdateUserRoleInput,
} from "./user.schema"

export class UserService {
  static async list(query: QueryUserInput) {
    const { rows, total, page, limit } =
      await UserRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const user = await UserRepository.findById(id)
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }
    return user
  }

  static async create(input: CreateUserInput, actor?: AuthenticatedUser | null) {
    if (input.email) {
      const existingEmail = await UserRepository.findByEmail(input.email.trim())
      if (existingEmail) {
        throw new ConflictError("Email đã được đăng ký trong hệ thống")
      }
    }

    if (input.perNumber) {
      const existingPer = await UserRepository.findByPerNumber(
        input.perNumber.trim(),
      )
      if (existingPer) {
        throw new ConflictError("Mã nhân viên (perNumber) đã tồn tại")
      }
    }

    // Bảo mật: Chỉ SUPER_ADMIN mới được tạo tài khoản với vai trò SUPER_ADMIN
    let systemRole = input.systemRole || "USER"
    if (systemRole === "SUPER_ADMIN" && actor?.systemRole !== "SUPER_ADMIN") {
      systemRole = "USER"
    }

    const passwordHash = await hashPassword(input.password)

    const created = await UserRepository.create({
      ...input,
      systemRole,
      passwordHash,
    })

    return {
      data: created,
      message: "Tạo người dùng thành công",
    }
  }

  static async createLocal(
    input: CreateLocalUserInput,
    actor?: AuthenticatedUser | null,
  ) {
    return await this.create(
      {
        fullName: input.fullName,
        email: input.email,
        password: input.password,
        systemRole: input.role || "USER",
      },
      actor,
    )
  }

  static async update(
    id: number,
    input: UpdateUserInput,
    _actor?: AuthenticatedUser | null,
  ) {
    const existing = await UserRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    if (input.email && input.email !== existing.user?.email) {
      const emailConflict = await UserRepository.findByEmail(input.email.trim())
      if (emailConflict && emailConflict.id !== id) {
        throw new ConflictError("Email đã được đăng ký trong hệ thống")
      }
    }

    if (input.perNumber && input.perNumber !== existing.user?.perNumber) {
      const perConflict = await UserRepository.findByPerNumber(
        input.perNumber.trim(),
      )
      if (perConflict && perConflict.id !== id) {
        throw new ConflictError("Mã nhân viên (perNumber) đã tồn tại")
      }
    }

    const updated = await UserRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật người dùng thành công",
    }
  }

  static async updateRole(
    id: number,
    input: UpdateUserRoleInput,
    actor: AuthenticatedUser,
  ) {
    const existing = await UserRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    // LỖ HỔNG BẢO MẬT: Chỉ SUPER_ADMIN mới được đổi systemRole
    if (input.systemRole !== undefined) {
      if (actor.systemRole !== "SUPER_ADMIN") {
        throw new ForbiddenError(
          "Chỉ Quản trị viên cấp cao (SUPER_ADMIN) mới có quyền thay đổi vai trò hệ thống",
        )
      }

      if (id === actor.id && input.systemRole !== "SUPER_ADMIN") {
        throw new BadRequestError(
          "Không thể tự hạ cấp vai trò của chính tài khoản đang đăng nhập",
        )
      }
    }

    const updated = await UserRepository.updateRole(
      id,
      input.systemRole,
      input.roleId,
    )

    return {
      data: updated,
      message: "Cập nhật quyền thành công",
    }
  }

  static async resetPassword(
    id: number,
    input: ResetPasswordInput,
    _actor: AuthenticatedUser,
  ) {
    const existing = await UserRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const passwordHash = await hashPassword(input.newPassword)
    await UserRepository.updatePassword(id, passwordHash)

    return {
      data: { message: "Đặt lại mật khẩu thành công" },
      message: "Đặt lại mật khẩu thành công",
    }
  }

  static async toggleBlock(id: number, actor: AuthenticatedUser) {
    if (id === actor.id) {
      throw new BadRequestError("Không thể tự khóa tài khoản của chính mình")
    }

    const res = await UserRepository.toggleBlock(id)
    if (!res) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    return {
      data: res.user,
      message: `${res.newStatus === "LOCKED" ? "Khóa" : "Mở khóa"} tài khoản thành công`,
    }
  }

  static async delete(id: number, actor: AuthenticatedUser) {
    if (id === actor.id) {
      throw new BadRequestError("Không thể tự xóa tài khoản của chính mình")
    }

    const existing = await UserRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    await UserRepository.delete(id)
    return {
      data: { message: "Xóa người dùng thành công" },
      message: "Xóa người dùng thành công",
    }
  }

  static async getProjectRoles(userId: number) {
    const existing = await UserRepository.findById(userId)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const rolesList = await UserRepository.getProjectRoles(userId)
    return {
      data: rolesList,
      message: "Thành công",
    }
  }

  static async assignProjectRole(
    userId: number,
    input: AssignProjectRoleInput,
  ) {
    const existing = await UserRepository.findById(userId)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    // Nếu gán accessRoleId, validate phải có scope = 'PROJECT'
    if (input.accessRoleId) {
      const [ar] = await db
        .select({ id: accessRoles.id, scope: accessRoles.scope })
        .from(accessRoles)
        .where(eq(accessRoles.id, input.accessRoleId))

      if (!ar) {
        throw new NotFoundError("Vai trò dự án (accessRoleId) không tồn tại")
      }

      validateProjectRoleAssignment(ar.scope)
    }

    const assigned = await UserRepository.assignProjectRole(userId, input)
    return {
      data: assigned,
      message: "Phân quyền dự án thành công",
    }
  }

  static async getTree(query: QueryUserTreeInput) {
    return await UserRepository.getTree(query)
  }
}
