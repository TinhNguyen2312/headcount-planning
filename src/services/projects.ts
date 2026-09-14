import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  IQueryProjects,
  ItemResponse,
  ListResponse,
  MessageResponse,
  ProjectCreate,
  ProjectResponse,
  ProjectUpdate,
  ZoneCreate,
  ZoneResponse,
  ZoneUpdate,
} from "@/types"

const url = (path = "") => `${API_V1}/projects${path}`

export const ProjectsAPI = {
  /** GET /api/projects */
  getAll: (params: IQueryProjects = {}) =>
    apiClient.get<ListResponse<ProjectResponse>>(url(), { params }),

  /** GET /api/projects/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<ProjectResponse>>(url(`/${id}`)),

  /** POST /api/projects */
  createOne: (data: ProjectCreate) =>
    apiClient.post<ItemResponse<ProjectResponse>>(url(), data),

  /** PUT /api/projects/{id} */
  updateOne: (id: number, data: ProjectUpdate) =>
    apiClient.patch<ItemResponse<ProjectResponse>>(url(`/${id}`), data),

  /** DELETE /api/projects/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),
}

export const ZonesAPI = {
  /** GET /api/zones */
  getAll: (
    params: {
      keyword?: string
      projectId?: number
      page?: number
      limit?: number
      sortBy?: string
      order?: string
    } = {},
  ) =>
    apiClient.get<ListResponse<ZoneResponse>>(`${API_V1}/zones`, {
      params,
    }),

  /** GET /api/zones/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<ZoneResponse>>(`${API_V1}/zones/${id}`),

  /** POST /api/zones */
  createOne: (data: ZoneCreate) =>
    apiClient.post<ItemResponse<ZoneResponse>>(`${API_V1}/zones`, data),

  /** PUT /api/zones/{id} */
  updateOne: (id: number, data: ZoneUpdate) =>
    apiClient.patch<ItemResponse<ZoneResponse>>(`${API_V1}/zones/${id}`, data),

  /** DELETE /api/zones/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(`${API_V1}/zones/${id}`),
}
