import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  AccessRoleResponse,
  CreateAccessRolePayload,
  ItemResponse,
  ListResponse,
  MessageResponse,
  PermissionResponse,
  UpdateAccessRolePayload,
  UserAccessRoleResponse,
} from "@/types"

const url = (path = "") => `${API_V1}/access-roles${path}`

export interface AccessRoleQueryParams {
  scope?: "GLOBAL" | "PROJECT"
  keyword?: string
  parentId?: number
  page?: number
  limit?: number
  order?: "asc" | "desc"
}

export const AccessRolesAPI = {
  /** GET /api/access-roles */
  getAll: (params: AccessRoleQueryParams = {}) =>
    apiClient.get<ListResponse<AccessRoleResponse>>(url(), {
      params: { limit: 100, ...params },
    }),

  /** GET /api/access-roles/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<AccessRoleResponse>>(url(`/${id}`)),

  /** POST /api/access-roles */
  createOne: (data: CreateAccessRolePayload) =>
    apiClient.post<ItemResponse<AccessRoleResponse>>(url(), data),

  /** PATCH /api/access-roles/{id} */
  updateOne: (id: number, data: UpdateAccessRolePayload) =>
    apiClient.patch<ItemResponse<AccessRoleResponse>>(url(`/${id}`), data),

  /** DELETE /api/access-roles/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** GET /api/permissions */
  getPermissions: (params: { scope?: string; groupName?: string } = {}) =>
    apiClient.get<ListResponse<PermissionResponse>>(`${API_V1}/permissions`, {
      params,
    }),

  /** GET /api/users/{id}/access-roles */
  getUserAccessRoles: (userId: number) =>
    apiClient.get<ListResponse<UserAccessRoleResponse>>(
      `${API_V1}/users/${userId}/access-roles`,
    ),

  /** PUT /api/users/{id}/access-roles */
  updateUserAccessRoles: (userId: number, accessRoleIds: number[]) =>
    apiClient.put<ItemResponse<MessageResponse>>(
      `${API_V1}/users/${userId}/access-roles`,
      { accessRoleIds },
    ),
}
