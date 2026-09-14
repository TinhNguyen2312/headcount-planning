import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  RoleCreate,
  RoleQueryParams,
  RoleResponse,
  RoleTreeNodeResponse,
  RoleUpdate,
} from "@/types"

const url = (path = "") => `${API_V1}/roles${path}`

export const RolesAPI = {
  /** GET /api/roles — supports keyword, departmentId, parentRoleId, page, limit, sortBy, order */
  getAll: (params: RoleQueryParams = {}) =>
    apiClient.get<ListResponse<RoleResponse>>(url(), {
      params: { limit: 100, ...params },
    }),

  /** GET /api/roles/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<RoleResponse>>(url(`/${id}`)),

  /** POST /api/roles */
  createOne: (data: RoleCreate) =>
    apiClient.post<ItemResponse<RoleResponse>>(url(), data),

  /** PUT /api/roles/{id} */
  updateOne: (id: number, data: RoleUpdate) =>
    apiClient.patch<ItemResponse<RoleResponse>>(url(`/${id}`), data),

  /** DELETE /api/roles/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** GET /api/roles/tree */
  getTree: () =>
    apiClient.get<ListResponse<RoleTreeNodeResponse>>(url("/tree")),
}
