import dayjs from "dayjs"
import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  GenerateInstanceRequest,
  InstanceResponse,
  IQueryTaskInstances,
  ItemResponse,
  ListResponse,
  TaskInstanceResponse,
  UpdateInstanceStatusRequest,
} from "@/types"

const url = (path = "") => `${API_V1}/instances${path}`

export interface TaskInstanceTreeNode extends TaskInstanceResponse {
  children: TaskInstanceTreeNode[]
}

export function buildTaskTree(
  tasks: TaskInstanceResponse[] = [],
): TaskInstanceTreeNode[] {
  const map = new Map<number, TaskInstanceTreeNode>()
  const roots: TaskInstanceTreeNode[] = []

  for (const t of tasks) {
    map.set(t.id, { ...t, children: [] })
  }

  for (const t of tasks) {
    const node = map.get(t.id)!
    if (t.parentTaskInstanceId && map.has(t.parentTaskInstanceId)) {
      map.get(t.parentTaskInstanceId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export const InstancesAPI = {
  generate: (data: GenerateInstanceRequest) =>
    apiClient.post<ListResponse<InstanceResponse>>(url("/generate"), data),

  getAll: (params: IQueryTaskInstances = {}) =>
    apiClient.get<ListResponse<InstanceResponse>>(url(), {
      params: {
        limit: 100,
        ...params,
      },
    }),

  getToday: (params: IQueryTaskInstances = {}) => {
    const { workDate, limit = 100, ...rest } = params
    const dateStr = workDate ?? dayjs().format("YYYY-MM-DD")
    return apiClient.get<ListResponse<InstanceResponse>>(url(), {
      params: {
        workDate: dateStr,
        limit,
        ...rest,
      },
    })
  },

  getOne: (id: number) =>
    apiClient.get<ItemResponse<InstanceResponse>>(url(`/${id}`)),
  updateStatus: (id: number, data: UpdateInstanceStatusRequest) =>
    apiClient.patch<ItemResponse<InstanceResponse>>(url(`/${id}/status`), data),
}
