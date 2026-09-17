import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { DepartmentRepository } from "./department.repo"
import type {
  CreateDepartmentInput,
  QueryDepartmentInput,
  UpdateDepartmentInput,
} from "./department.schema"

export class DepartmentService {
  static async list(query: QueryDepartmentInput) {
    const { rows, total, page, limit } =
      await DepartmentRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const dept = await DepartmentRepository.findById(id)
    if (!dept) {
      throw new NotFoundError("Không tìm thấy phòng ban")
    }
    return dept
  }

  static async create(input: CreateDepartmentInput) {
    const existing = await DepartmentRepository.findByCode(input.code)
    if (existing) {
      throw new ConflictError("Mã phòng ban đã tồn tại")
    }

    if (input.parentId) {
      const parent = await DepartmentRepository.findById(input.parentId)
      if (!parent) {
        throw new BadRequestError("Phòng ban cha không tồn tại")
      }
    }

    const created = await DepartmentRepository.create(input)
    return {
      data: created,
      message: "Tạo phòng ban thành công",
    }
  }

  static async update(id: number, input: UpdateDepartmentInput) {
    const existing = await DepartmentRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy phòng ban")
    }

    if (input.code && input.code !== existing.code) {
      const codeConflict = await DepartmentRepository.findByCode(input.code)
      if (codeConflict) {
        throw new ConflictError("Mã phòng ban đã tồn tại")
      }
    }

    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === id) {
        throw new BadRequestError("Phòng ban không thể là cha của chính nó")
      }
      const parent = await DepartmentRepository.findById(input.parentId)
      if (!parent) {
        throw new BadRequestError("Phòng ban cha không tồn tại")
      }
    }

    const updated = await DepartmentRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật phòng ban thành công",
    }
  }

  static async delete(id: number) {
    const existing = await DepartmentRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy phòng ban")
    }

    const hasChildren = await DepartmentRepository.hasChildDepartments(id)
    if (hasChildren) {
      throw new BadRequestError(
        "Không thể xóa phòng ban đang có đơn vị trực thuộc",
      )
    }

    const hasRoles = await DepartmentRepository.hasAssignedRoles(id)
    if (hasRoles) {
      throw new BadRequestError(
        "Không thể xóa phòng ban đang có chức danh gán vào",
      )
    }

    await DepartmentRepository.delete(id)
    return {
      data: { message: "Xóa phòng ban thành công" },
      message: "Xóa phòng ban thành công",
    }
  }
}
