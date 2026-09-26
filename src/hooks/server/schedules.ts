import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  getISOWeekNumber,
  toISODate,
} from "@/components/Schedules/scheduleUtils"
import { extractApiErrorMessage } from "@/lib/errors"
import { InstancesAPI } from "@/services/instances"
import { SchedulesAPI } from "@/services/schedules"
import type {
  CopyScheduleRequest,
  IQuerySchedules,
  ItemResponse,
  ListResponse,
  SaveCoverageRequest,
  ScheduleMatrixResponse,
  ScheduleResponse,
  ToggleDayRequest,
} from "@/types"
import { useUI } from "../useUI"
import {
  type QueryOptionsHelper,
  type SuspenseQueryOptionsHelper,
  useCreateItem,
  useDeleteItem,
  useItemQuery,
  useListQuery,
  useSuspenseItemQuery,
  useSuspenseListQuery,
  useUpdateItem,
} from "./base"

export const scheduleQueries = {
  all: () => ["schedules"] as const,
  lists: () => [...scheduleQueries.all(), "list"] as const,
  coverageBase: (projectId: number) =>
    ["schedule-coverage", projectId] as const,
  coverage: (projectId: number, weekStart?: string) =>
    [
      ...scheduleQueries.coverageBase(projectId),
      weekStart ?? "current",
    ] as const,
  matrixKey: (params: {
    projectId: number
    fromDate: string
    toDate: string
    zoneId?: number
  }) => ["schedule-matrix", params] as const,

  list: (params?: IQuerySchedules) =>
    queryOptions({
      queryKey: [...scheduleQueries.lists(), params],
      queryFn: () => SchedulesAPI.getAll(params),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: [...scheduleQueries.all(), "detail", id] as const,
      queryFn: () => SchedulesAPI.getOne(id),
    }),
  scheduleMatrix: (params: {
    projectId: number
    fromDate: string
    toDate: string
    zoneId?: number
  }) =>
    queryOptions({
      queryKey: scheduleQueries.matrixKey(params),
      queryFn: () => SchedulesAPI.getMatrix(params),
      enabled: !!params.projectId,
    }),

  useSuspenseList: <TSelected = ScheduleResponse[]>(
    params?: IQuerySchedules,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<ScheduleResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(scheduleQueries.list(params), options),
  useSuspenseDetail: <TSelected = ScheduleResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ScheduleResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(scheduleQueries.detail(id), options),

  useList: <TSelected = ScheduleResponse[]>(
    params?: IQuerySchedules,
    options?: QueryOptionsHelper<ListResponse<ScheduleResponse>, TSelected>,
  ) => useListQuery(scheduleQueries.list(params), options),
  useDetail: <TSelected = ScheduleResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<ScheduleResponse>, TSelected>,
  ) =>
    useItemQuery(scheduleQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),
  useScheduleMatrix: <TSelected = ScheduleMatrixResponse[]>(
    params: {
      projectId: number
      fromDate: string
      toDate: string
      zoneId?: number
    },
    options?: QueryOptionsHelper<
      ListResponse<ScheduleMatrixResponse>,
      TSelected
    >,
  ) => useListQuery(scheduleQueries.scheduleMatrix(params), options),

  useCreate: () =>
    useCreateItem(
      scheduleQueries.all(),
      SchedulesAPI.createOne,
      "Tạo lịch thành công!",
      "Tạo lịch thất bại!",
    ),
  useUpdate: () =>
    useUpdateItem(
      scheduleQueries.all(),
      SchedulesAPI.updateOne,
      "Cập nhật lịch thành công!",
      "Cập nhật lịch thất bại!",
    ),
  useDelete: () =>
    useDeleteItem(
      scheduleQueries.all(),
      SchedulesAPI.deleteOne,
      "Xóa lịch thành công!",
      "Xóa lịch thất bại!",
    ),

  useToggleZoneCoverageDay: () => {
    const { message } = useUI()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (data: ToggleDayRequest) =>
        SchedulesAPI.toggleCoverageDay(data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["schedule-matrix"],
        })
      },
      onError: (error) => {
        message.error(extractApiErrorMessage(error, "Cập nhật lịch thất bại!"))
      },
    })
  },

  useSaveZoneCoverage: (_projectId?: number) => {
    const { message } = useUI()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (data: SaveCoverageRequest) =>
        SchedulesAPI.saveCoverage(data),
      onSuccess: (res) => {
        message.success(res.message || "Lưu lịch làm việc thành công!")
        queryClient.invalidateQueries({
          queryKey: ["schedule-matrix"],
        })
      },
      onError: (error) =>
        message.error(
          extractApiErrorMessage(error, "Lưu lịch làm việc thất bại!"),
        ),
    })
  },

  useCopyScheduleWeek: (projectId: number) => {
    const { message } = useUI()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (data: Omit<CopyScheduleRequest, "projectId">) =>
        SchedulesAPI.copyRange({ ...data, projectId }),
      onSuccess: () => {
        message.success("Sao chép lịch thành công!")
        queryClient.invalidateQueries({
          queryKey: ["schedule-matrix"],
        })
      },
      onError: (error) =>
        message.error(
          extractApiErrorMessage(error, "Sao chép lịch tuần thất bại!"),
        ),
    })
  },

  useGenerateWeekInstances: (projectId: number) => {
    const { message } = useUI()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({
        weekStart,
        zoneId,
      }: {
        weekStart: Date
        zoneId?: number
      }) => {
        const start = new Date(weekStart)
        const dates: string[] = []
        for (let i = 0; i < 7; i++) {
          const d = new Date(start)
          d.setDate(d.getDate() + i)
          dates.push(toISODate(d))
        }
        const results = await Promise.all(
          dates.map((workDate) =>
            InstancesAPI.generate({
              projectId,
              zoneId: zoneId ?? null,
              workDate,
            }),
          ),
        )
        return {
          results,
          weekStart,
        }
      },
      onSuccess: ({ results, weekStart }) => {
        const totalCreated = results.reduce(
          (sum, res) =>
            sum + (Array.isArray(res?.result) ? res.result.length : 0),
          0,
        )
        const weekNumber = getISOWeekNumber(weekStart)
        if (totalCreated > 0) {
          message.success(
            `Đã tạo ${totalCreated} công việc cho tuần ${weekNumber}.`,
          )
        }
        queryClient.invalidateQueries({
          queryKey: ["schedule-matrix"],
        })
        queryClient.invalidateQueries({ queryKey: ["instances"] })
      },
      onError: (error) =>
        message.error(extractApiErrorMessage(error, "Tạo công việc thất bại!")),
    })
  },
}
