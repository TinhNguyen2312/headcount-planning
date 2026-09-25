import { mockStore } from "@/mocks/store"
import type {
  DepartmentCreate,
  DepartmentQueryParams,
  DepartmentResponse,
  DepartmentTreeNodeResponse,
  DepartmentUpdate,
  ItemResponse,
  ListResponse,
  MessageResponse,
} from "@/types"

export const DepartmentsAPI = {
  /** GET /api/departments */
  getAll: async (
    params: DepartmentQueryParams = {},
  ): Promise<ListResponse<DepartmentResponse>> => {
    return mockStore.getDepartments(params)
  },

  /** GET /api/departments/{id} */
  getOne: async (id: number): Promise<ItemResponse<DepartmentResponse>> => {
    const dept = await mockStore.getDepartment(id)
    return {
      code: 0,
      message: "Thành công",
      result: dept,
    }
  },

  /** POST /api/departments */
  createOne: async (
    data: DepartmentCreate,
  ): Promise<ItemResponse<DepartmentResponse>> => {
    const created = await mockStore.createDepartment(data)
    return {
      code: 0,
      message: "Tạo phòng ban thành công",
      result: created,
    }
  },

  /** PUT /api/departments/{id} */
  updateOne: async (
    id: number,
    data: DepartmentUpdate,
  ): Promise<ItemResponse<DepartmentResponse>> => {
    const updated = await mockStore.updateDepartment(id, data)
    return {
      code: 0,
      message: "Cập nhật phòng ban thành công",
      result: updated,
    }
  },

  /** DELETE /api/departments/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteDepartment(id)
    return {
      code: 0,
      message: "Xóa phòng ban thành công",
      result: { message: "Xóa phòng ban thành công" },
    }
  },

  /** GET /api/departments/tree */
  getTree: async (): Promise<ListResponse<DepartmentTreeNodeResponse>> => {
    const tree = await mockStore.getDepartmentTree()
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
