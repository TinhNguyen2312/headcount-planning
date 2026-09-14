import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
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

const url = (path = "") => `${API_V1}/departments${path}`

export const DepartmentsAPI = {
  /** GET /api/departments */
  getAll: (params: DepartmentQueryParams = {}) =>
    apiClient.get<ListResponse<DepartmentResponse>>(url(), { params }),

  /** GET /api/departments/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<DepartmentResponse>>(url(`/${id}`)),

  /** POST /api/departments */
  createOne: (data: DepartmentCreate) =>
    apiClient.post<ItemResponse<DepartmentResponse>>(url(), data),

  /** PUT /api/departments/{id} */
  updateOne: (id: number, data: DepartmentUpdate) =>
    apiClient.patch<ItemResponse<DepartmentResponse>>(url(`/${id}`), data),

  /** DELETE /api/departments/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(url(`/${id}`)),

  /** GET /api/departments/tree */
  getTree: () =>
    apiClient.get<ListResponse<DepartmentTreeNodeResponse>>(url("/tree")),
}
