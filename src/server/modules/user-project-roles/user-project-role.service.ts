import { eq } from "drizzle-orm"
import { db, accessRoles } from "@/db"
import { BadRequestError, NotFoundError } from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { validateProjectRoleAssignment } from "@/server/core/rbac"
import { validateUserProjectAssignment } from "@/lib/userProjectHelpers"
import { UserProjectRoleRepository } from "./user-project-role.repo"
import type {
  AssignReplacementInput,
  CreateUserProjectRoleInput,
  QueryUserProjectRoleInput,
  UpdateUserProjectRoleInput,
} from "./user-project-role.schema"

export class UserProjectRoleService {
  static async list(query: QueryUserProjectRoleInput) {
    const { rows, total, page, limit } =
      await UserProjectRoleRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const item = await UserProjectRoleRepository.findById(id)
    if (!item) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }
    return item
  }

  static async create(input: CreateUserProjectRoleInput) {
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

    if (input.status === "ACTIVE") {
      const validation = await validateUserProjectAssignment({
        userId: input.userId,
        projectId: input.projectId,
        roleId: input.roleId,
        status: input.status,
      })
      if (!validation.valid) {
        throw new BadRequestError(validation.error || "Phân công dự án không hợp lệ")
      }
    }

    const created = await UserProjectRoleRepository.create(input)
    return {
      data: created,
      message: "Phân công dự án thành công",
    }
  }

  static async update(id: number, input: UpdateUserProjectRoleInput) {
    const existing = await UserProjectRoleRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

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

    const targetUserId = existing.userProject.userId
    const targetProjectId = input.projectId ?? existing.userProject.projectId
    const targetRoleId = input.roleId ?? existing.userProject.roleId
    const targetStatus = input.status ?? existing.userProject.status

    if (targetStatus === "ACTIVE") {
      const validation = await validateUserProjectAssignment({
        userId: targetUserId,
        projectId: targetProjectId,
        roleId: targetRoleId,
        currentAssignmentId: id,
        status: targetStatus,
      })
      if (!validation.valid) {
        throw new BadRequestError(validation.error || "Phân công dự án không hợp lệ")
      }
    }

    const updated = await UserProjectRoleRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật phân công dự án thành công",
    }
  }

  static async delete(id: number) {
    const existing = await UserProjectRoleRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

    await UserProjectRoleRepository.delete(id)
    return {
      data: { message: "Xóa phân công dự án thành công" },
      message: "Xóa phân công dự án thành công",
    }
  }

  static async assignReplacement(id: number, input: AssignReplacementInput) {
    const existing = await UserProjectRoleRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

    const updated = await UserProjectRoleRepository.assignReplacement(id, input)
    return {
      data: updated,
      message: "Gán nhân sự thay thế thành công",
    }
  }

  static async cancelReplacement(id: number) {
    const existing = await UserProjectRoleRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy phân công dự án")
    }

    const updated = await UserProjectRoleRepository.cancelReplacement(id)
    return {
      data: updated,
      message: "Hủy nhân sự thay thế thành công",
    }
  }
}
