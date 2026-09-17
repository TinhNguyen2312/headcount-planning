import { ConflictError, NotFoundError } from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { ProjectRepository } from "./project.repo"
import type {
  CreateProjectInput,
  QueryProjectInput,
  SaveProjectPropertiesInput,
  UpdateProjectInput,
} from "./project.schema"

export class ProjectService {
  static async list(query: QueryProjectInput) {
    const { rows, total, page, limit } =
      await ProjectRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const project = await ProjectRepository.findById(id)
    if (!project) {
      throw new NotFoundError("Không tìm thấy dự án")
    }
    return project
  }

  static async create(input: CreateProjectInput) {
    if (input.code) {
      const existing = await ProjectRepository.findByCode(input.code.trim())
      if (existing) {
        throw new ConflictError("Mã dự án đã tồn tại trong hệ thống")
      }
    }

    const created = await ProjectRepository.create(input)
    return {
      data: created,
      message: "Tạo dự án thành công",
    }
  }

  static async update(id: number, input: UpdateProjectInput) {
    const existing = await ProjectRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    if (input.code && input.code !== existing.project.code) {
      const codeConflict = await ProjectRepository.findByCode(input.code.trim())
      if (codeConflict && codeConflict.id !== id) {
        throw new ConflictError("Mã dự án đã tồn tại trong hệ thống")
      }
    }

    const updated = await ProjectRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật dự án thành công",
    }
  }

  static async delete(id: number) {
    const existing = await ProjectRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    await ProjectRepository.delete(id)
    return {
      data: { message: "Xóa dự án thành công" },
      message: "Xóa dự án thành công",
    }
  }

  static async getProperties(projectId: number) {
    const existing = await ProjectRepository.findById(projectId)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    const result = await ProjectRepository.getProperties(projectId)
    return {
      projectId,
      projectType: existing.project.projectType || "HIGH_RISE",
      properties: result.properties,
      values: result.values,
    }
  }

  static async saveProperties(
    projectId: number,
    input: SaveProjectPropertiesInput,
  ) {
    const existing = await ProjectRepository.findById(projectId)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy dự án")
    }

    await ProjectRepository.saveProperties(projectId, input.values)
    return {
      data: null,
      message: "Lưu cơ sở định biên dự án thành công",
    }
  }
}
