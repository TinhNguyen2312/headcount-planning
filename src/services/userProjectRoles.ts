import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  AssignReplacementRequest,
  ItemResponse,
  ListResponse,
  MessageResponse,
  UserProjectRoleCreate,
  UserProjectRoleDetailResponse,
  UserProjectRoleUpdate,
} from "@/types"

const url = (path = "") => `${API_V1}/user-project-roles${path}`

export const UserProjectRolesAPI = {
  /** GET /api/user-project-roles */
  getAll: (
    params: {
      userId?: number
      projectId?: number
      zoneId?: number
      roleId?: number
      status?: string
      page?: number
      limit?: number
      sortBy?: string
      order?: string
    } = {},
  ) =>
    apiClient.get<ListResponse<UserProjectRoleDetailResponse>>(url(), {
      params,
    }),

  /** GET /api/user-project-roles/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<UserProjectRoleDetailResponse>>(url(`/${id}`)),

  /** POST /api/user-project-roles */
  createOne: (data: UserProjectRoleCreate) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(url(), data),

  /** PATCH /api/user-project-roles/{id} */
  updateOne: (id: number, data: UserProjectRoleUpdate) =>
    apiClient.patch<ItemResponse<UserProjectRoleDetailResponse>>(
      url(`/${id}`),
      data,
    ),

  /** DELETE /api/user-project-roles/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** POST /api/users/{id}/project-roles */
  assignProjectRole: (id: number, data: UserProjectRoleCreate) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(
      `${API_V1}/users/${id}/project-roles`,
      {
        ...data,
        userId: data.userId ?? id,
      },
    ),

  /** POST /api/user-project-roles/{id}/assign-replacement */
  assignReplacement: (
    userProjectRoleId: number,
    data: AssignReplacementRequest,
  ) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(
      url(`/${userProjectRoleId}/assign-replacement`),
      data,
    ),

  /** POST /api/user-project-roles/{id}/cancel-replacement */
  cancelReplacement: (userProjectRoleId: number) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(
      url(`/${userProjectRoleId}/cancel-replacement`),
    ),
}
