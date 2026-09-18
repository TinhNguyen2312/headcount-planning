import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { DepartmentRepository } from "@/server/modules/departments/department.repo"
import { RoleRepository } from "./role.repo"
import type {
  CreateRoleInput,
  QueryRoleInput,
  QueryRoleTreeInput,
  UpdateRoleInput,
} from "./role.schema"

export class RoleService {
  static async list(query: QueryRoleInput) {
    const { rows, total, page, limit } =
      await RoleRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const role = await RoleRepository.findById(id)
    if (!role) {
      throw new NotFoundError("Không tìm thấy chức danh")
    }
    return role
  }

  static async getTree(query: QueryRoleTreeInput) {
    const tree = await RoleRepository.getTree(query.departmentId)
    return {
      data: tree,
      message: "Thành công",
    }
  }

  static async create(input: CreateRoleInput) {
    if (input.code) {
      const existing = await RoleRepository.findByCode(input.code)
      if (existing) {
        throw new ConflictError("Mã chức danh đã tồn tại")
      }
    }

    if (input.departmentId) {
      const dept = await DepartmentRepository.findById(input.departmentId)
      if (!dept) {
        throw new BadRequestError("Phòng ban không tồn tại")
      }
    }

    if (input.parentRoleId) {
      const parent = await RoleRepository.findById(input.parentRoleId)
      if (!parent) {
        throw new BadRequestError("Chức danh cha không tồn tại")
      }
    }

    const created = await RoleRepository.create(input)
    return {
      data: created,
      message: "Tạo chức danh thành công",
    }
  }

  static async update(id: number, input: UpdateRoleInput) {
    const existing = await RoleRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy chức danh")
    }

    if (input.code && input.code !== existing.role.code) {
      const codeConflict = await RoleRepository.findByCode(input.code)
      if (codeConflict) {
        throw new ConflictError("Mã chức danh đã tồn tại")
      }
    }

    if (input.departmentId !== undefined && input.departmentId !== null) {
      const dept = await DepartmentRepository.findById(input.departmentId)
      if (!dept) {
        throw new BadRequestError("Phòng ban không tồn tại")
      }
    }

    if (input.parentRoleId !== undefined && input.parentRoleId !== null) {
      if (input.parentRoleId === id) {
        throw new BadRequestError("Chức danh không thể là cha của chính nó")
      }

      const parent = await RoleRepository.findById(input.parentRoleId)
      if (!parent) {
        throw new BadRequestError("Chức danh cha không tồn tại")
      }

      const ancestors = await RoleRepository.getAncestorIds(input.parentRoleId)
      if (ancestors.includes(id)) {
        throw new BadRequestError(
          "Kế thừa không hợp lệ: Sẽ gây ra chu trình lặp vô tận giữa các chức danh",
        )
      }
    }

    const updated = await RoleRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật chức danh thành công",
    }
  }

  static async delete(id: number) {
    const existing = await RoleRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy chức danh")
    }

    const hasChildren = await RoleRepository.hasChildRoles(id)
    if (hasChildren) {
      throw new BadRequestError(
        "Không thể xóa chức danh đang có chức danh cấp dưới",
      )
    }

    const hasUsers = await RoleRepository.hasAssignedUsers(id)
    if (hasUsers) {
      throw new BadRequestError(
        "Không thể xóa chức danh đang được gán cho nhân sự",
      )
    }

    const hasProjects = await RoleRepository.hasAssignedProjects(id)
    if (hasProjects) {
      throw new BadRequestError(
        "Không thể xóa chức danh đang được phân bổ trong dự án",
      )
    }

    await RoleRepository.delete(id)
    return {
      data: { message: "Xóa chức danh thành công" },
      message: "Xóa chức danh thành công",
    }
  }
}
