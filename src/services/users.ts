import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  AssignReplacementRequest,
  GetUserTreeParams,
  IQueryUsers,
  ItemResponse,
  ListResponse,
  MessageResponse,
  UserCreate,
  UserProjectRoleCreate,
  UserProjectRoleDetailResponse,
  UserProjectRoleUpdate,
  UserResponse,
  UserStatusUpdate,
  UserTreeNodeResponse,
  UserUpdate,
  UserWithProjectsResponse,
} from "@/types"
import type { UpdateRoleRequest } from "@/types/auth"

const url = (path = "") => `${API_V1}/users${path}`

export const UsersAPI = {
  /** GET /api/usersd */
  getAll: (params: IQueryUsers = {}) =>
    apiClient.get<ListResponse<UserWithProjectsResponse>>(url(), {
      params,
    }),

  /** GET /api/users/tree */
  getTree: (params?: GetUserTreeParams) =>
    apiClient.get<ListResponse<UserTreeNodeResponse>>(url("/tree"), {
      params,
    }),

  /** GET /api/users/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<UserResponse>>(url(`/${id}`)),

  /** POST /api/users */
  createOne: (data: UserCreate) =>
    apiClient.post<ItemResponse<UserResponse>>(url("/local"), data),

  /** PATCH /api/users/{id} */
  updateOne: (id: number, data: UserUpdate) =>
    apiClient.patch<ItemResponse<UserResponse>>(url(`/${id}`), data),

  /** DELETE /api/users/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** PATCH /api/users/{id}  */
  updateStatus: (id: number, data: UserStatusUpdate) =>
    apiClient.patch<ItemResponse<UserResponse>>(url(`/${id}`), data),

  /** PATCH /api/users/{id}/role — update systemRole / role */
  updateRole: (
    id: number,
    data: UpdateRoleRequest | { systemRole: string },
  ) => {
    return apiClient.patch<ItemResponse<UserResponse>>(url(`/${id}/role`), data)
  },

  /** PATCH /api/users/{id}/block */
  blockUser: (id: number) =>
    apiClient.patch<ItemResponse<UserResponse>>(url(`/${id}/block`)),

  /** POST /api/users/{id}/reset-password */
  resetPassword: (id: number, data: { newPassword: string }) =>
    apiClient.post<ItemResponse<MessageResponse>>(
      url(`/${id}/reset-password`),
      data,
    ),

  /** POST /api/users/import */
  importUsers: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post<ItemResponse<MessageResponse>>(
      url("/import"),
      formData,
    )
  },

  /** GET /api/users/export */
  exportUsers: () => apiClient.get(url("/export"), { responseType: "blob" }),

  /** GET /api/users/{id}/project-roles */
  getProjectRoles: (id: number) =>
    apiClient.get<ListResponse<UserProjectRoleDetailResponse>>(
      url(`/${id}/project-roles`),
    ),

  /** POST /api/users/{id}/project-roles */
  assignProjectRole: (id: number, data: UserProjectRoleCreate) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(
      url(`/${id}/project-roles`),
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
      `${API_V1}/user-project-roles/${userProjectRoleId}/assign-replacement`,
      data,
    ),

  /** POST /api/user-project-roles/{id}/cancel-replacement */
  cancelReplacement: (userProjectRoleId: number) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(
      `${API_V1}/user-project-roles/${userProjectRoleId}/cancel-replacement`,
    ),
}

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
    apiClient.get<ListResponse<UserProjectRoleDetailResponse>>(
      `${API_V1}/user-project-roles`,
      {
        params,
      },
    ),

  /** GET /api/user-project-roles/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<UserProjectRoleDetailResponse>>(
      `${API_V1}/user-project-roles/${id}`,
    ),

  /** POST /api/user-project-roles */
  createOne: (data: UserProjectRoleCreate) =>
    apiClient.post<ItemResponse<UserProjectRoleDetailResponse>>(
      `${API_V1}/user-project-roles`,
      data,
    ),

  /** PUT /api/user-project-roles/{id} */
  updateOne: (id: number, data: UserProjectRoleUpdate) =>
    apiClient.patch<ItemResponse<UserProjectRoleDetailResponse>>(
      `${API_V1}/user-project-roles/${id}`,
      data,
    ),

  /** DELETE /api/user-project-roles/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(
      `${API_V1}/user-project-roles/${id}`,
    ),
}
