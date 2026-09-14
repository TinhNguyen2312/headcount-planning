import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  SectorCreate,
  SectorQueryParams,
  SectorResponse,
  SectorUpdate,
} from "@/types"

const url = (path = "") => `${API_V1}/sectors${path}`

export const SectorsAPI = {
  /** GET /api/sectors */
  getAll: (params: SectorQueryParams = {}) =>
    apiClient.get<ListResponse<SectorResponse>>(url(), { params }),

  /** GET /api/sectors/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<SectorResponse>>(url(`/${id}`)),

  /** POST /api/sectors */
  createOne: (data: SectorCreate) =>
    apiClient.post<ItemResponse<SectorResponse>>(url(), data),

  /** PATCH /api/sectors/{id} */
  updateOne: (id: number, data: SectorUpdate) =>
    apiClient.patch<ItemResponse<SectorResponse>>(url(`/${id}`), data),

  /** DELETE /api/sectors/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),
}
