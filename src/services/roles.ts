import { mockStore } from "@/mocks/store"
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

export const RolesAPI = {
  /** GET /api/roles — supports keyword, departmentId, parentRoleId, page, limit, sortBy, order */
  getAll: async (
    params: RoleQueryParams = {},
  ): Promise<ListResponse<RoleResponse>> => {
    return mockStore.getRoles(params)
  },

  /** GET /api/roles/{id} */
  getOne: async (id: number): Promise<ItemResponse<RoleResponse>> => {
    const role = await mockStore.getRole(id)
    return {
      code: 0,
      message: "Thành công",
      result: role,
    }
  },

  /** POST /api/roles */
  createOne: async (data: RoleCreate): Promise<ItemResponse<RoleResponse>> => {
    const created = await mockStore.createRole(data)
    return {
      code: 0,
      message: "Tạo chức vụ thành công",
      result: created,
    }
  },

  /** PUT /api/roles/{id} */
  updateOne: async (
    id: number,
    data: RoleUpdate,
  ): Promise<ItemResponse<RoleResponse>> => {
    const updated = await mockStore.updateRole(id, data)
    return {
      code: 0,
      message: "Cập nhật chức vụ thành công",
      result: updated,
    }
  },

  /** DELETE /api/roles/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteRole(id)
    return {
      code: 0,
      message: "Xóa chức vụ thành công",
      result: { message: "Xóa chức vụ thành công" },
    }
  },

  /** GET /api/roles/tree */
  getTree: async (): Promise<ListResponse<RoleTreeNodeResponse>> => {
    const tree = await mockStore.getRoleTree()
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
}
