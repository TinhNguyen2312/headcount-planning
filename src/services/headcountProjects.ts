import { mockStore } from "@/mocks/store"
import type {
  HeadcountProjectCreatePayload,
  HeadcountProjectQueryParams,
  HeadcountProjectResponse,
  HeadcountProjectUpdatePayload,
  ItemResponse,
  ListResponse,
  MessageResponse,
} from "@/types"

export interface AvailableProjectItem {
  id: number
  code: string | null
  name: string
  address?: string | null
  status: string
  regionId?: number | null
  regionName?: string | null
  sectorId?: number | null
  sectorName?: string | null
}

export const HeadcountProjectsAPI = {
  /** GET /api/headcount-projects */
  getAll: async (
    params?: HeadcountProjectQueryParams,
  ): Promise<ListResponse<HeadcountProjectResponse>> => {
    return mockStore.getHeadcountProjects(params)
  },

  /** GET /api/headcount-projects/{id} */
  getOne: async (
    id: number,
  ): Promise<ItemResponse<HeadcountProjectResponse>> => {
    const hp = await mockStore.getHeadcountProject(id)
    return {
      code: 0,
      message: "Thành công",
      result: hp,
    }
  },

  /** GET /api/headcount-projects/available-projects */
  getAvailableProjects: async (): Promise<
    ListResponse<AvailableProjectItem>
  > => {
    return mockStore.getAvailableProjects()
  },

  /** POST /api/headcount-projects */
  create: async (
    data: HeadcountProjectCreatePayload,
  ): Promise<ItemResponse<HeadcountProjectResponse>> => {
    const created = await mockStore.createHeadcountProject(data)
    return {
      code: 0,
      message: "Thêm dự án chạy định biên thành công",
      result: created,
    }
  },

  /** PATCH /api/headcount-projects/{id} */
  update: async (
    id: number,
    data: HeadcountProjectUpdatePayload,
  ): Promise<ItemResponse<HeadcountProjectResponse>> => {
    const updated = await mockStore.updateHeadcountProject(id, data)
    return {
      code: 0,
      message: "Cập nhật dự án chạy định biên thành công",
      result: updated,
    }
  },

  /** DELETE /api/headcount-projects/{id} */
  delete: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteHeadcountProject(id)
    return {
      code: 0,
      message: "Xóa dự án chạy định biên thành công",
      result: { message: "Xóa dự án chạy định biên thành công" },
    }
  },
}
