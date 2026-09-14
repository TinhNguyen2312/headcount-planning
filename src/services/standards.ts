import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  EvaluateStandardPayload,
  HeadcountStandardCreatePayload,
  HeadcountStandardQueryParams,
  HeadcountStandardResponse,
  HeadcountStandardUpdatePayload,
  ItemResponse,
  ListResponse,
  MessageResponse,
  StandardMatchResult,
} from "@/types"

const url = (path = "") => `${API_V1}/standards${path}`

export const StandardsAPI = {
  /** GET /api/standards */
  getAll: (params: HeadcountStandardQueryParams = {}) =>
    apiClient.get<ListResponse<HeadcountStandardResponse>>(url(), { params }),

  /** GET /api/standards/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<HeadcountStandardResponse>>(url(`/${id}`)),

  /** POST /api/standards */
  createOne: (data: HeadcountStandardCreatePayload) =>
    apiClient.post<ItemResponse<HeadcountStandardResponse>>(url(), data),

  /** PATCH /api/standards/{id} */
  updateOne: (id: number, data: HeadcountStandardUpdatePayload) =>
    apiClient.patch<ItemResponse<HeadcountStandardResponse>>(
      url(`/${id}`),
      data,
    ),

  /** DELETE /api/standards/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** POST /api/standards/evaluate */
  evaluate: (payload: EvaluateStandardPayload) =>
    apiClient.post<ItemResponse<StandardMatchResult[]>>(
      url("/evaluate"),
      payload,
    ),
}
