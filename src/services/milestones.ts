import { mockStore } from "@/mocks/store"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  MilestoneCreate,
  MilestoneDependencyCreate,
  MilestoneDependencyResponse,
  MilestoneQueryParams,
  MilestoneResponse,
  MilestoneUpdate,
} from "@/types"

export const MilestonesAPI = {
  /** GET /api/milestones */
  getAll: async (
    params: MilestoneQueryParams = {},
  ): Promise<ListResponse<MilestoneResponse>> => {
    return mockStore.getMilestones(params)
  },

  /** GET /api/milestones/{id} */
  getOne: async (id: number): Promise<ItemResponse<MilestoneResponse>> => {
    const m = await mockStore.getMilestone(id)
    return {
      code: 0,
      message: "Thành công",
      result: m,
    }
  },

  /** POST /api/milestones */
  createOne: async (
    data: MilestoneCreate,
  ): Promise<ItemResponse<MilestoneResponse>> => {
    const created = await mockStore.createMilestone(data)
    return {
      code: 0,
      message: "Tạo mốc thành công",
      result: created,
    }
  },

  /** PATCH /api/milestones/{id} */
  updateOne: async (
    id: number,
    data: MilestoneUpdate,
  ): Promise<ItemResponse<MilestoneResponse>> => {
    const updated = await mockStore.updateMilestone(id, data)
    return {
      code: 0,
      message: "Cập nhật mốc thành công",
      result: updated,
    }
  },

  /** DELETE /api/milestones/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteMilestone(id)
    return {
      code: 0,
      message: "Xóa mốc thành công",
      result: { message: "Xóa mốc thành công" },
    }
  },

  /** GET /api/milestones/dependencies */
  getDependencies: async (): Promise<
    ItemResponse<MilestoneDependencyResponse[]>
  > => {
    const deps = await mockStore.getMilestoneDependencies()
    return {
      code: 0,
      message: "Thành công",
      result: deps,
    }
  },

  /** POST /api/milestones/dependencies */
  createDependency: async (
    data: MilestoneDependencyCreate,
  ): Promise<ItemResponse<MilestoneDependencyResponse>> => {
    const created = await mockStore.createMilestoneDependency(data)
    return {
      code: 0,
      message: "Tạo liên kết mốc thành công",
      result: created,
    }
  },

  /** DELETE /api/milestones/dependencies */
  deleteDependency: async (params: {
    id?: number
    fromMilestoneId?: number
    toMilestoneId?: number
  }): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteMilestoneDependency(params)
    return {
      code: 0,
      message: "Xóa liên kết mốc thành công",
      result: { message: "Xóa liên kết mốc thành công" },
    }
  },
}
