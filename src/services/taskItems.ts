import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  BusinessMatrixResponse,
  EscalateLevel,
  ItemResponse,
  ListResponse,
  MessageResponse,
  RequirementType,
  TaskItemCreate,
  TaskItemQueryParams,
  TaskItemResponse,
  TaskItemUpdate,
} from "@/types"

const taskItemUrl = (path = "") => `${API_V1}/task-items${path}`

export const TaskItemsAPI = {
  getAll: (params: TaskItemQueryParams = {}) =>
    apiClient.get<ListResponse<TaskItemResponse>>(taskItemUrl(), {
      params,
    }),
  getBusinessMatrix: () =>
    apiClient.get<ListResponse<BusinessMatrixResponse>>(
      taskItemUrl("/business-matrix"),
    ),

  getOne: (id: number) =>
    apiClient.get<ItemResponse<TaskItemResponse>>(taskItemUrl(`/${id}`)),

  createOne: (data: TaskItemCreate) => {
    const payload: TaskItemCreate = {
      ...data,
      escalateLevel: data.escalateLevel
        ? (data.escalateLevel.toUpperCase() as EscalateLevel)
        : data.escalateLevel,
      requirementType: data.requirementType
        ? (data.requirementType.toUpperCase() as RequirementType)
        : data.requirementType,
    }
    return apiClient.post<ItemResponse<TaskItemResponse>>(
      taskItemUrl(),
      payload,
    )
  },

  updateOne: (id: number, data: TaskItemUpdate) => {
    return apiClient.patch<ItemResponse<TaskItemResponse>>(
      taskItemUrl(`/${id}`),
      data,
    )
  },

  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(taskItemUrl(`/${id}`)),
}
