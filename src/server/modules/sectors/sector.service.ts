import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { SectorRepository } from "./sector.repo"
import type {
  CreateSectorInput,
  QuerySectorInput,
  UpdateSectorInput,
} from "./sector.schema"

export class SectorService {
  static async list(query: QuerySectorInput) {
    const { rows, total, page, limit } =
      await SectorRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const sector = await SectorRepository.findById(id)
    if (!sector) {
      throw new NotFoundError("Không tìm thấy khu vực")
    }
    return sector
  }

  static async create(input: CreateSectorInput) {
    if (input.code) {
      const existing = await SectorRepository.findByCode(input.code)
      if (existing) {
        throw new ConflictError("Mã khu vực đã tồn tại")
      }
    }

    const created = await SectorRepository.create(input)
    return {
      data: created,
      message: "Tạo khu vực thành công",
    }
  }

  static async update(id: number, input: UpdateSectorInput) {
    const existing = await SectorRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy khu vực")
    }

    if (input.code && input.code !== existing.code) {
      const codeConflict = await SectorRepository.findByCode(input.code)
      if (codeConflict) {
        throw new ConflictError("Mã khu vực đã tồn tại")
      }
    }

    const updated = await SectorRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật khu vực thành công",
    }
  }

  static async delete(id: number) {
    const existing = await SectorRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy khu vực")
    }

    const hasRegions = await SectorRepository.hasRegions(id)
    if (hasRegions) {
      throw new BadRequestError("Không thể xóa khu vực đang chứa vùng dự án")
    }

    await SectorRepository.delete(id)
    return {
      data: { message: "Xóa khu vực thành công" },
      message: "Xóa khu vực thành công",
    }
  }
}
