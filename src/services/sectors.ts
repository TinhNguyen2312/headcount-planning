import { mockStore } from "@/mocks/store"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  SectorCreate,
  SectorQueryParams,
  SectorResponse,
  SectorUpdate,
} from "@/types"

export const SectorsAPI = {
  /** GET /api/sectors */
  getAll: async (
    params: SectorQueryParams = {},
  ): Promise<ListResponse<SectorResponse>> => {
    return mockStore.getSectors(params)
  },

  /** GET /api/sectors/{id} */
  getOne: async (id: number): Promise<ItemResponse<SectorResponse>> => {
    const s = await mockStore.getSector(id)
    return {
      code: 0,
      message: "Thành công",
      result: s,
    }
  },

  /** POST /api/sectors */
  createOne: async (
    data: SectorCreate,
  ): Promise<ItemResponse<SectorResponse>> => {
    const created = await mockStore.createSector(data)
    return {
      code: 0,
      message: "Tạo khu vực thành công",
      result: created,
    }
  },

  /** PATCH /api/sectors/{id} */
  updateOne: async (
    id: number,
    data: SectorUpdate,
  ): Promise<ItemResponse<SectorResponse>> => {
    const updated = await mockStore.updateSector(id, data)
    return {
      code: 0,
      message: "Cập nhật khu vực thành công",
      result: updated,
    }
  },

  /** DELETE /api/sectors/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteSector(id)
    return {
      code: 0,
      message: "Xóa khu vực thành công",
      result: { message: "Xóa khu vực thành công" },
    }
  },
}
