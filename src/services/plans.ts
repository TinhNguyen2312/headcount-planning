import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  PlanCreatePayload,
  PlanResponse,
  PlanUpdatePayload,
} from "@/types"

const getBaseUrl = (projectId: number, path = "") =>
  `${API_V1}/projects/${projectId}/plans${path}`

export const PlansAPI = {
  /** GET /api/projects/{projectId}/plans */
  getAll: (projectId: number) =>
    apiClient.get<ListResponse<PlanResponse>>(getBaseUrl(projectId)),

  /** GET /api/projects/{projectId}/plans/{planId} */
  getOne: (projectId: number, planId: number) =>
    apiClient.get<ItemResponse<PlanResponse>>(
      getBaseUrl(projectId, `/${planId}`),
    ),

  /** POST /api/projects/{projectId}/plans */
  createOne: (projectId: number, data: PlanCreatePayload) =>
    apiClient.post<ItemResponse<PlanResponse>>(getBaseUrl(projectId), data),

  /** PATCH /api/projects/{projectId}/plans/{planId} */
  updateOne: (projectId: number, planId: number, data: PlanUpdatePayload) =>
    apiClient.patch<ItemResponse<PlanResponse>>(
      getBaseUrl(projectId, `/${planId}`),
      data,
    ),

  /** DELETE /api/projects/{projectId}/plans/{planId} */
  deleteOne: (projectId: number, planId: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(
      getBaseUrl(projectId, `/${planId}`),
    ),

  /** POST /api/projects/{projectId}/plans/{planId}/activate */
  activateOne: (projectId: number, planId: number) =>
    apiClient.post<ItemResponse<PlanResponse>>(
      getBaseUrl(projectId, `/${planId}/activate`),
      {},
    ),
}
