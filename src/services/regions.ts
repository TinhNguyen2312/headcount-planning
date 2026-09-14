import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
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

const url = (path = "") => `${API_V1}/regions${path}`

export const RegionsAPI = {
  /** GET /api/regions */
  getAll: (params: RegionQueryParams = {}) =>
    apiClient.get<ListResponse<RegionDetail>>(url(), { params }),

  /** GET /api/regions/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<RegionDetail>>(url(`/${id}`)),

  /** POST /api/regions */
  createOne: (data: RegionCreate) =>
    apiClient.post<ItemResponse<RegionResponse>>(url(), data),

  /** PATCH /api/regions/{id} */
  updateOne: (id: number, data: RegionUpdate) =>
    apiClient.patch<ItemResponse<RegionResponse>>(url(`/${id}`), data),

  /** DELETE /api/regions/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),
}
