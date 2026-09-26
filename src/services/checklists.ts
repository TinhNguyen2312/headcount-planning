import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  ChecklistCreate,
  ChecklistInstanceCreate,
  ChecklistInstanceItemResponse,
  ChecklistInstanceItemUpdate,
  ChecklistInstanceResponse,
  ChecklistItemCreate,
  ChecklistItemReorderEntry,
  ChecklistItemResponse,
  ChecklistItemTreeNodeResponse,
  ChecklistItemUpdate,
  ChecklistQueryParams,
  ChecklistResponse,
  ChecklistUpdate,
  ItemResponse,
  ListResponse,
  MessageResponse,
  RequirementType,
} from "@/types"

const chkUrl = (path = "") => `${API_V1}/checklists${path}`
const taskChecklistUrl = (taskInstanceId: number, path = "") =>
  `${API_V1}/task-instances/${taskInstanceId}/checklist-instances${path}`

export const ChecklistsAPI = {
  getAll: (params: ChecklistQueryParams = {}) =>
    apiClient.get<ListResponse<ChecklistResponse>>(chkUrl(), { params }),

  getOne: (id: number) =>
    apiClient.get<ItemResponse<ChecklistResponse>>(chkUrl(`/${id}`)),

  createOne: (data: ChecklistCreate) =>
    apiClient.post<ItemResponse<ChecklistResponse>>(chkUrl(), data),

  updateOne: (id: number, data: ChecklistUpdate) =>
    apiClient.patch<ItemResponse<ChecklistResponse>>(chkUrl(`/${id}`), data),

  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse | undefined>>(
      chkUrl(`/${id}`),
    ),

  getItemsTree: (id: number) =>
    apiClient.get<ListResponse<ChecklistItemTreeNodeResponse>>(
      chkUrl(`/${id}/items`),
    ),

  addItem: (checklistId: number, data: ChecklistItemCreate) => {
    const payload: ChecklistItemCreate = {
      ...data,
      requirementType: data.requirementType
        ? (data.requirementType.toUpperCase() as RequirementType)
        : data.requirementType,
    }
    return apiClient.post<ItemResponse<ChecklistItemResponse>>(
      chkUrl(`/${checklistId}/items`),
      payload,
    )
  },

  updateItem: (
    checklistId: number,
    itemId: number,
    data: ChecklistItemUpdate,
  ) => {
    const payload: ChecklistItemUpdate = {
      ...data,
      ...(data.requirementType !== undefined
        ? {
            requirementType: data.requirementType
              ? (data.requirementType.toUpperCase() as RequirementType)
              : null,
          }
        : {}),
    }
    return apiClient.patch<ItemResponse<ChecklistItemResponse>>(
      chkUrl(`/${checklistId}/items/${itemId}`),
      payload,
    )
  },

  deleteItem: (checklistId: number, itemId: number) =>
    apiClient.delete<ItemResponse<MessageResponse | undefined>>(
      chkUrl(`/${checklistId}/items/${itemId}`),
    ),

  activate: (id: number) =>
    apiClient.patch<ItemResponse<ChecklistResponse>>(chkUrl(`/${id}/activate`)),

  deactivate: (id: number) =>
    apiClient.patch<ItemResponse<ChecklistResponse>>(
      chkUrl(`/${id}/deactivate`),
    ),

  reorderItems: (checklistId: number, items: ChecklistItemReorderEntry[]) =>
    apiClient.patch<ListResponse<ChecklistItemResponse>>(
      chkUrl(`/${checklistId}/items/reorder`),
      { items },
    ),
}

export const ChecklistTemplatesAPI = ChecklistsAPI

// A task instance has at most one checklist instance, addressed by taskInstanceId
export const ChecklistInstancesAPI = {
  getForTask: (taskInstanceId: number) =>
    apiClient.get<ItemResponse<ChecklistInstanceResponse>>(
      taskChecklistUrl(taskInstanceId),
    ),

  createForTask: (taskInstanceId: number, data: ChecklistInstanceCreate) =>
    apiClient.post<ItemResponse<ChecklistInstanceResponse>>(
      taskChecklistUrl(taskInstanceId),
      data,
    ),

  getById: (taskInstanceId: number, checklistInstanceId: number) =>
    apiClient.get<ItemResponse<ChecklistInstanceResponse>>(
      taskChecklistUrl(taskInstanceId, `/${checklistInstanceId}`),
    ),

  deleteOne: (taskInstanceId: number, checklistInstanceId: number) =>
    apiClient.delete<ItemResponse<MessageResponse | undefined>>(
      taskChecklistUrl(taskInstanceId, `/${checklistInstanceId}`),
    ),

  getItems: async (
    taskInstanceId: number,
    checklistInstanceId: number,
  ): Promise<ListResponse<ChecklistInstanceItemResponse>> => {
    const res = await apiClient.get<
      ListResponse<ChecklistInstanceItemResponse>
    >(taskChecklistUrl(taskInstanceId, `/${checklistInstanceId}/items`))
    return res
  },

  updateItem: async (
    taskInstanceId: number,
    checklistInstanceId: number,
    itemId: number,
    data: ChecklistInstanceItemUpdate,
  ): Promise<ItemResponse<ChecklistInstanceItemResponse>> => {
    const res = await apiClient.patch<
      ItemResponse<ChecklistInstanceItemResponse>
    >(
      taskChecklistUrl(
        taskInstanceId,
        `/${checklistInstanceId}/items/${itemId}`,
      ),
      data,
    )
    return res
  },
}
