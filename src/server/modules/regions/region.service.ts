import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/server/core/errors"
import { createPaginationMeta } from "@/server/core/pagination"
import { SectorRepository } from "@/server/modules/sectors/sector.repo"
import { RegionRepository } from "./region.repo"
import type {
  CreateRegionInput,
  QueryRegionInput,
  UpdateRegionInput,
} from "./region.schema"

export class RegionService {
  static async list(query: QueryRegionInput) {
    const { rows, total, page, limit } =
      await RegionRepository.findManyAndCount(query)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, total),
    }
  }

  static async getById(id: number) {
    const region = await RegionRepository.findById(id)
    if (!region) {
      throw new NotFoundError("Không tìm thấy vùng")
    }
    return region
  }

  static async create(input: CreateRegionInput) {
    if (input.code) {
      const existing = await RegionRepository.findByCode(input.code)
      if (existing) {
        throw new ConflictError("Mã vùng đã tồn tại")
      }
    }

    const sector = await SectorRepository.findById(input.sectorId)
    if (!sector) {
      throw new BadRequestError("Khu vực không tồn tại")
    }

    const created = await RegionRepository.create(input)
    return {
      data: created,
      message: "Tạo vùng thành công",
    }
  }

  static async update(id: number, input: UpdateRegionInput) {
    const existing = await RegionRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy vùng")
    }

    if (input.code && input.code !== existing.region.code) {
      const codeConflict = await RegionRepository.findByCode(input.code)
      if (codeConflict) {
        throw new ConflictError("Mã vùng đã tồn tại")
      }
    }

    if (input.sectorId !== undefined) {
      const sector = await SectorRepository.findById(input.sectorId)
      if (!sector) {
        throw new BadRequestError("Khu vực không tồn tại")
      }
    }

    const updated = await RegionRepository.update(id, input)
    return {
      data: updated,
      message: "Cập nhật vùng thành công",
    }
  }

  static async delete(id: number) {
    const existing = await RegionRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Không tìm thấy vùng")
    }

    const hasProjects = await RegionRepository.hasProjects(id)
    if (hasProjects) {
      throw new BadRequestError("Không thể xóa vùng đang có dự án")
    }

    await RegionRepository.delete(id)
    return {
      data: { message: "Xóa vùng thành công" },
      message: "Xóa vùng thành công",
    }
  }
}
