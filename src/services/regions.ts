import { mockStore } from "@/mocks/store"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  RegionCreate,
  RegionDetail,
  RegionQueryParams,
  RegionResponse,
  RegionUpdate,
} from "@/types"

export const RegionsAPI = {
  /** GET /api/regions */
  getAll: async (
    params: RegionQueryParams = {},
  ): Promise<ListResponse<RegionDetail>> => {
    return mockStore.getRegions(params)
  },

  /** GET /api/regions/{id} */
  getOne: async (id: number): Promise<ItemResponse<RegionDetail>> => {
    const r = await mockStore.getRegion(id)
    return {
      code: 0,
      message: "Thành công",
      result: r,
    }
  },

  /** POST /api/regions */
  createOne: async (
    data: RegionCreate,
  ): Promise<ItemResponse<RegionResponse>> => {
    const created = await mockStore.createRegion(data)
    return {
      code: 0,
      message: "Tạo vùng thành công",
      result: created,
    }
  },

  /** PATCH /api/regions/{id} */
  updateOne: async (
    id: number,
    data: RegionUpdate,
  ): Promise<ItemResponse<RegionResponse>> => {
    const updated = await mockStore.updateRegion(id, data)
    return {
      code: 0,
      message: "Cập nhật vùng thành công",
      result: updated,
    }
  },

  /** DELETE /api/regions/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteRegion(id)
    return {
      code: 0,
      message: "Xóa vùng thành công",
      result: { message: "Xóa vùng thành công" },
    }
  },
}
