import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  CreateAdhocTaskRequest,
  EvaluateTaskRequest,
  ItemResponse,
  ListResponse,
  MyTasksFilters,
  PendingApprovalFilters,
  SubordinateTaskFilters,
  TaskInstanceFilters,
  TaskInstanceHistoryResponse,
  TaskInstanceResponse,
  UpdateTaskStatusRequest,
} from "@/types"

const url = (path = "") => `${API_V1}/task-instances${path}`

export const TaskInstancesAPI = {
  getAll: (params: TaskInstanceFilters = {}) =>
    apiClient.get<ListResponse<TaskInstanceResponse>>(url(), {
      params,
    }),

  getOne: (id: number) =>
    apiClient.get<ItemResponse<TaskInstanceResponse>>(url(`/${id}`)),

  getMyTasks: (params: MyTasksFilters = {}) =>
    apiClient.get<ListResponse<TaskInstanceResponse>>(url("/my-tasks"), {
      params,
    }),

  getSubordinates: (params: SubordinateTaskFilters = {}) =>
    apiClient.get<ListResponse<TaskInstanceResponse>>(url("/subordinates"), {
      params,
    }),

  getPendingApprovals: (params: PendingApprovalFilters = {}) =>
    apiClient.get<ListResponse<TaskInstanceResponse>>(
      url("/pending-approvals"),
      { params },
    ),

  createAdhoc: (data: CreateAdhocTaskRequest) =>
    apiClient.post<ItemResponse<TaskInstanceResponse>>(url("/adhoc"), data),

  updateStatus: (id: number, data: UpdateTaskStatusRequest) =>
    apiClient.patch<ItemResponse<TaskInstanceResponse>>(
      url(`/${id}/status`),
      data,
    ),

  evaluate: (id: number, data: EvaluateTaskRequest) =>
    apiClient.patch<ItemResponse<TaskInstanceResponse>>(
      url(`/${id}/evaluate`),
      data,
    ),

  approve: (id: number, note?: string) =>
    apiClient.patch<ItemResponse<TaskInstanceResponse>>(
      url(`/${id}/approve`),
      undefined,
      { params: note ? { note } : undefined },
    ),

  getHistories: (id: number) =>
    apiClient.get<ListResponse<TaskInstanceHistoryResponse>>(
      url(`/${id}/histories`),
    ),
}
