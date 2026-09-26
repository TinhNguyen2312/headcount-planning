import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useUI } from "@/hooks/useUI"
import { extractApiErrorMessage } from "@/lib/errors"
import { AccAPI } from "@/services/acc"
import type { IQuerySyncLogs, ListResponse, SyncLogResponse } from "@/types"
import { type QueryOptionsHelper, useListQuery } from "./base"
import { instanceQueries } from "./instances"
import { taskInstanceQueries } from "./taskInstances"

export const accQueries = {
  all: () => ["acc"] as const,
  syncLogsKey: (params?: IQuerySyncLogs) =>
    [...accQueries.all(), "sync-logs", params] as const,

  syncLogs: (params?: IQuerySyncLogs) =>
    queryOptions({
      queryKey: accQueries.syncLogsKey(params),
      queryFn: () => AccAPI.getSyncLogs(params),
    }),

  useSyncLogs: <TSelected = SyncLogResponse[]>(
    params?: IQuerySyncLogs,
    options?: QueryOptionsHelper<ListResponse<SyncLogResponse>, TSelected>,
  ) => useListQuery(accQueries.syncLogs(params), options),
}

export const useTriggerSubmittalSync = () => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AccAPI.triggerSubmittalSync(),
    onSuccess: (response) => {
      const count = response?.result ?? 0
      message.success(
        count > 0
          ? `Đồng bộ Submittals thành công! Đã xử lý ${count} thẻ việc từ ACC.`
          : "Đồng bộ Submittals thành công! Không có thẻ việc mới từ ACC.",
      )
      queryClient.invalidateQueries({
        queryKey: accQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: taskInstanceQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: instanceQueries.all(),
        exact: false,
      })
    },
    onError: (error) => {
      message.error(
        extractApiErrorMessage(error, "Đồng bộ Submittals từ ACC thất bại!"),
      )
    },
  })
}

export const useTriggerRfiSync = () => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AccAPI.triggerRfiSync(),
    onSuccess: (response) => {
      const count = response?.result ?? 0
      message.success(
        count > 0
          ? `Đồng bộ RFIs thành công! Đã xử lý ${count} thẻ việc từ ACC.`
          : "Đồng bộ RFIs thành công! Không có thẻ việc mới từ ACC.",
      )
      queryClient.invalidateQueries({
        queryKey: accQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: taskInstanceQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: instanceQueries.all(),
        exact: false,
      })
    },
    onError: (error) => {
      message.error(
        extractApiErrorMessage(error, "Đồng bộ RFIs từ ACC thất bại!"),
      )
    },
  })
}

export const useTriggerScheduleSync = () => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AccAPI.triggerScheduleSync(),
    onSuccess: () => {
      message.success(
        "Đồng bộ thành công, Schedule đang được trích xuất từ data connector và đồng sao 3-5 phút",
      )
      queryClient.invalidateQueries({
        queryKey: accQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: taskInstanceQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: instanceQueries.all(),
        exact: false,
      })
    },
    onError: (error) => {
      message.error(
        extractApiErrorMessage(error, "Đồng bộ Schedule từ ACC thất bại!"),
      )
    },
  })
}

export const useTriggerAllSync = () => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AccAPI.triggerAllSync(),
    onSuccess: (response) => {
      const count = response?.result ?? 0
      message.success(
        count > 0
          ? `Đồng bộ toàn bộ thành công! Đã xử lý ${count} thẻ việc từ ACC.`
          : "Đồng bộ toàn bộ thành công! Không có thẻ việc mới từ ACC.",
      )
      queryClient.invalidateQueries({
        queryKey: accQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: taskInstanceQueries.all(),
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: instanceQueries.all(),
        exact: false,
      })
    },
    onError: (error) => {
      message.error(
        extractApiErrorMessage(error, "Đồng bộ toàn bộ từ ACC thất bại!"),
      )
    },
  })
}
