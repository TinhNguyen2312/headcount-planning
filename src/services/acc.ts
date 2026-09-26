import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  IQuerySyncLogs,
  ItemResponse,
  ListResponse,
  SyncLogResponse,
} from "@/types"

const url = (path = "") => `${API_V1}/acc${path}`

export const AccAPI = {
  triggerSubmittalSync: () =>
    apiClient.post<ItemResponse<number>>(url("/sync/submittals")),

  triggerRfiSync: () => apiClient.post<ItemResponse<number>>(url("/sync/rfis")),
  triggerScheduleSync: () =>
    apiClient.post<ItemResponse<number>>(url("/sync/schedule")),

  triggerAllSync: () => apiClient.post<ItemResponse<number>>(url("/sync/all")),

  getSyncLogs: (params: IQuerySyncLogs = {}) =>
    apiClient.get<ListResponse<SyncLogResponse>>(url("/sync/logs"), {
      params,
    }),
}
