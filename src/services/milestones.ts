import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
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

const url = (path = "") => `${API_V1}/milestones${path}`

export const MilestonesAPI = {
  /** GET /api/milestones */
  getAll: (params: MilestoneQueryParams = {}) =>
    apiClient.get<ListResponse<MilestoneResponse>>(url(), { params }),

  /** GET /api/milestones/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<MilestoneResponse>>(url(`/${id}`)),

  /** POST /api/milestones */
  createOne: (data: MilestoneCreate) =>
    apiClient.post<ItemResponse<MilestoneResponse>>(url(), data),

  /** PATCH /api/milestones/{id} */
  updateOne: (id: number, data: MilestoneUpdate) =>
    apiClient.patch<ItemResponse<MilestoneResponse>>(url(`/${id}`), data),

  /** DELETE /api/milestones/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** GET /api/milestones/dependencies */
  getDependencies: () =>
    apiClient.get<ItemResponse<MilestoneDependencyResponse[]>>(
      url("/dependencies"),
    ),

  /** POST /api/milestones/dependencies */
  createDependency: (data: MilestoneDependencyCreate) =>
    apiClient.post<ItemResponse<MilestoneDependencyResponse>>(
      url("/dependencies"),
      data,
    ),

  /** DELETE /api/milestones/dependencies */
  deleteDependency: (params: {
    id?: number
    fromMilestoneId?: number
    toMilestoneId?: number
  }) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url("/dependencies"), {
      params,
    }),
}
