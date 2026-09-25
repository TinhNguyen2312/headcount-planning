/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockStore } from "@/mocks/store"
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

export const UsersAPI = {
  /** GET /api/users */
  getAll: async (
    params: IQueryUsers = {},
  ): Promise<ListResponse<UserWithProjectsResponse>> => {
    return mockStore.getUsers(params)
  },

  /** GET /api/users/tree */
  getTree: async (
    params?: GetUserTreeParams,
  ): Promise<ListResponse<UserTreeNodeResponse>> => {
    const tree = await mockStore.getUserTree(params)
    return {
      code: 0,
      message: "Thành công",
      result: tree,
      meta: {
        page: 1,
        size: tree.length,
        totalElements: tree.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    }
  },

  /** GET /api/users/{id} */
  getOne: async (id: number): Promise<ItemResponse<UserResponse>> => {
    const user = await mockStore.getUser(id)
    return {
      code: 0,
      message: "Thành công",
      result: user,
    }
  },

  /** POST /api/users */
  createOne: async (data: UserCreate): Promise<ItemResponse<UserResponse>> => {
    const created = await mockStore.createUser(data)
    return {
      code: 0,
      message: "Tạo nhân viên thành công",
      result: created,
    }
  },

  /** PATCH /api/users/{id} */
  updateOne: async (
    id: number,
    data: UserUpdate,
  ): Promise<ItemResponse<UserResponse>> => {
    const updated = await mockStore.updateUser(id, data)
    return {
      code: 0,
      message: "Cập nhật nhân sự thành công",
      result: updated,
    }
  },

  /** DELETE /api/users/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteUser(id)
    return {
      code: 0,
      message: "Xóa nhân sự thành công",
      result: { message: "Xóa nhân sự thành công" },
    }
  },

  /** PATCH /api/users/{id}  */
  updateStatus: async (
    id: number,
    data: UserStatusUpdate,
  ): Promise<ItemResponse<UserResponse>> => {
    const updated = await mockStore.updateUser(id, { status: data.status })
    return {
      code: 0,
      message: "Cập nhật trạng thái thành công",
      result: updated,
    }
  },

  /** PATCH /api/users/{id}/role — update systemRole / role */
  updateRole: async (
    id: number,
    data: UpdateRoleRequest | { systemRole: string },
  ): Promise<ItemResponse<UserResponse>> => {
    const roleValue = (data as any).role || (data as any).systemRole
    const updated = await mockStore.updateUser(id, {
      roleId: typeof roleValue === "number" ? roleValue : undefined,
    })
    return {
      code: 0,
      message: "Cập nhật quyền thành công",
      result: updated,
    }
  },

  /** PATCH /api/users/{id}/block */
  blockUser: async (id: number): Promise<ItemResponse<UserResponse>> => {
    const u = await mockStore.getUser(id)
    const nextStatus = u.status === "LOCKED" ? "ACTIVE" : "LOCKED"
    const updated = await mockStore.updateUser(id, { status: nextStatus })
    return {
      code: 0,
      message: nextStatus === "LOCKED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      result: updated,
    }
  },

  /** POST /api/users/{id}/reset-password */
  resetPassword: async (
    _id: number,
    _data: { newPassword: string },
  ): Promise<ItemResponse<MessageResponse>> => {
    return {
      code: 0,
      message: "Đặt lại mật khẩu thành công",
      result: { message: "Đặt lại mật khẩu thành công" },
    }
  },

  /** POST /api/users/import */
  importUsers: async (_file: File): Promise<ItemResponse<MessageResponse>> => {
    return {
      code: 0,
      message: "Import danh sách nhân sự thành công",
      result: { message: "Import danh sách nhân sự thành công" },
    }
  },

  /** GET /api/users/export */
  exportUsers: async (): Promise<Blob> => {
    return new Blob(["Mock export data"], { type: "text/csv" })
  },

  /** GET /api/users/{id}/project-roles */
  getProjectRoles: async (
    id: number,
  ): Promise<ListResponse<UserProjectRoleDetailResponse>> => {
    const list = await mockStore.getUserProjectRoles(id)
    return {
      code: 0,
      message: "Thành công",
      result: list,
      meta: {
        page: 1,
        size: list.length,
        totalElements: list.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    }
  },

  /** POST /api/users/{id}/project-roles */
  assignProjectRole: async (
    id: number,
    data: UserProjectRoleCreate,
  ): Promise<ItemResponse<UserProjectRoleDetailResponse>> => {
    const res = await mockStore.createUserProjectRole({
      ...data,
      userId: data.userId ?? id,
    })
    return {
      code: 0,
      message: "Phân bổ nhân sự thành công",
      result: res,
    }
  },

  /** POST /api/user-project-roles/{id}/assign-replacement */
  assignReplacement: async (
    userProjectRoleId: number,
    data: AssignReplacementRequest,
  ): Promise<ItemResponse<UserProjectRoleDetailResponse>> => {
    const updated = await mockStore.updateUserProjectRole(userProjectRoleId, {
      ...data,
    } as any)
    return {
      code: 0,
      message: "Gán nhân sự thay thế thành công",
      result: updated,
    }
  },

  /** POST /api/user-project-roles/{id}/cancel-replacement */
  cancelReplacement: async (
    userProjectRoleId: number,
  ): Promise<ItemResponse<UserProjectRoleDetailResponse>> => {
    const updated = await mockStore.updateUserProjectRole(userProjectRoleId, {
      status: "ACTIVE",
    } as any)
    return {
      code: 0,
      message: "Hủy nhân sự thay thế thành công",
      result: updated,
    }
  },
}

export const UserProjectRolesAPI = {
  /** GET /api/user-project-roles */
  getAll: async (
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
  ): Promise<ListResponse<UserProjectRoleDetailResponse>> => {
    return mockStore.getAllUserProjectRoles(params)
  },

  /** GET /api/user-project-roles/{id} */
  getOne: async (
    id: number,
  ): Promise<ItemResponse<UserProjectRoleDetailResponse>> => {
    const list = await mockStore.getAllUserProjectRoles()
    const item = list.result.find((a) => a.id === Number(id))
    if (!item) throw new Error(`UserProjectRole #${id} not found`)
    return {
      code: 0,
      message: "Thành công",
      result: item,
    }
  },

  /** POST /api/user-project-roles */
  createOne: async (
    data: UserProjectRoleCreate,
  ): Promise<ItemResponse<UserProjectRoleDetailResponse>> => {
    const created = await mockStore.createUserProjectRole(data)
    return {
      code: 0,
      message: "Tạo phân bổ thành công",
      result: created,
    }
  },

  /** PUT /api/user-project-roles/{id} */
  updateOne: async (
    id: number,
    data: UserProjectRoleUpdate,
  ): Promise<ItemResponse<UserProjectRoleDetailResponse>> => {
    const updated = await mockStore.updateUserProjectRole(id, data)
    return {
      code: 0,
      message: "Cập nhật phân bổ thành công",
      result: updated,
    }
  },

  /** DELETE /api/user-project-roles/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteUserProjectRole(id)
    return {
      code: 0,
      message: "Xóa phân bổ thành công",
      result: { message: "Xóa phân bổ thành công" },
    }
  },
}
