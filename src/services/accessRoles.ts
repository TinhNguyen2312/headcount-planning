import { mockStore } from "@/mocks/store"
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
  getAll: async (
    params: AccessRoleQueryParams = {},
  ): Promise<ListResponse<AccessRoleResponse>> => {
    return mockStore.getAccessRoles(params)
  },

  /** GET /api/access-roles/{id} */
  getOne: async (id: number): Promise<ItemResponse<AccessRoleResponse>> => {
    const r = await mockStore.getAccessRole(id)
    return {
      code: 0,
      message: "Thành công",
      result: r,
    }
  },

  /** POST /api/access-roles */
  createOne: async (
    data: CreateAccessRolePayload,
  ): Promise<ItemResponse<AccessRoleResponse>> => {
    const created = await mockStore.createAccessRole(data)
    return {
      code: 0,
      message: "Tạo vai trò thành công",
      result: created,
    }
  },

  /** PATCH /api/access-roles/{id} */
  updateOne: async (
    id: number,
    data: UpdateAccessRolePayload,
  ): Promise<ItemResponse<AccessRoleResponse>> => {
    const updated = await mockStore.updateAccessRole(id, data)
    return {
      code: 0,
      message: "Cập nhật vai trò thành công",
      result: updated,
    }
  },

  /** DELETE /api/access-roles/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteAccessRole(id)
    return {
      code: 0,
      message: "Xóa vai trò thành công",
      result: { message: "Xóa vai trò thành công" },
    }
  },

  /** GET /api/permissions */
  getPermissions: async (
    params: { scope?: string; groupName?: string } = {},
  ): Promise<ListResponse<PermissionResponse>> => {
    return mockStore.getPermissions(params)
  },

  /** GET /api/users/{id}/access-roles */
  getUserAccessRoles: async (
    userId: number,
  ): Promise<ListResponse<UserAccessRoleResponse>> => {
    const roles = await mockStore.getUserAccessRoles(userId)
    return {
      code: 0,
      message: "Thành công",
      result: roles,
      meta: {
        page: 1,
        size: roles.length,
        totalElements: roles.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    }
  },

  /** PUT /api/users/{id}/access-roles */
  updateUserAccessRoles: async (
    userId: number,
    accessRoleIds: number[],
  ): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.updateUserAccessRoles(userId, accessRoleIds)
    return {
      code: 0,
      message: "Cập nhật vai trò người dùng thành công",
      result: { message: "Cập nhật vai trò người dùng thành công" },
    }
  },
}
