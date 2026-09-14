import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
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

const url = (path = "") => `${API_V1}/properties${path}`
const projectUrl = (projectId: number, path = "") =>
  `${API_V1}/projects/${projectId}/properties${path}`

export const PropertiesAPI = {
  /** GET /api/properties */
  getAll: (params: PropertyQueryParams = {}) =>
    apiClient.get<ListResponse<PropertyResponse>>(url(), { params }),

  /** GET /api/properties/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<PropertyResponse>>(url(`/${id}`)),

  /** POST /api/properties */
  createOne: (data: PropertyCreate) =>
    apiClient.post<ItemResponse<PropertyResponse>>(url(), data),

  /** PATCH /api/properties/{id} */
  updateOne: (id: number, data: PropertyUpdate) =>
    apiClient.patch<ItemResponse<PropertyResponse>>(url(`/${id}`), data),

  /** DELETE /api/properties/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** GET /api/projects/{projectId}/properties */
  getProjectProperties: (projectId: number) =>
    apiClient.get<ItemResponse<ProjectPropertiesMatrixResponse>>(
      projectUrl(projectId),
    ),

  /** PUT /api/projects/{projectId}/properties (Batch Upsert) */
  saveProjectProperties: (
    projectId: number,
    payload: SaveProjectPropertiesPayload,
  ) => apiClient.put<ItemResponse<null>>(projectUrl(projectId), payload),
}
