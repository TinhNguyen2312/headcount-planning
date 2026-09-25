import { mockStore } from "@/mocks/store"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  ProjectPropertiesMatrixResponse,
  PropertyCreate,
  PropertyQueryParams,
  PropertyResponse,
  PropertyUpdate,
  SaveProjectPropertiesPayload,
} from "@/types"

export const PropertiesAPI = {
  /** GET /api/properties */
  getAll: async (
    params: PropertyQueryParams = {},
  ): Promise<ListResponse<PropertyResponse>> => {
    return mockStore.getProperties(params)
  },

  /** GET /api/properties/{id} */
  getOne: async (id: number): Promise<ItemResponse<PropertyResponse>> => {
    const p = await mockStore.getProperty(id)
    return {
      code: 0,
      message: "Thành công",
      result: p,
    }
  },

  /** POST /api/properties */
  createOne: async (
    data: PropertyCreate,
  ): Promise<ItemResponse<PropertyResponse>> => {
    const created = await mockStore.createProperty(data)
    return {
      code: 0,
      message: "Tạo cơ sở định biên thành công",
      result: created,
    }
  },

  /** PATCH /api/properties/{id} */
  updateOne: async (
    id: number,
    data: PropertyUpdate,
  ): Promise<ItemResponse<PropertyResponse>> => {
    const updated = await mockStore.updateProperty(id, data)
    return {
      code: 0,
      message: "Cập nhật cơ sở định biên thành công",
      result: updated,
    }
  },

  /** DELETE /api/properties/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteProperty(id)
    return {
      code: 0,
      message: "Xóa cơ sở định biên thành công",
      result: { message: "Xóa cơ sở định biên thành công" },
    }
  },

  /** GET /api/projects/{projectId}/properties */
  getProjectProperties: async (
    projectId: number,
  ): Promise<ItemResponse<ProjectPropertiesMatrixResponse>> => {
    const matrix = await mockStore.getProjectProperties(projectId)
    return {
      code: 0,
      message: "Thành công",
      result: matrix,
    }
  },

  /** PUT /api/projects/{projectId}/properties (Batch Upsert) */
  saveProjectProperties: async (
    projectId: number,
    payload: SaveProjectPropertiesPayload,
  ): Promise<ItemResponse<null>> => {
    await mockStore.saveProjectProperties(projectId, payload)
    return {
      code: 0,
      message: "Lưu cơ sở định biên dự án thành công",
      result: null,
    }
  },
}
