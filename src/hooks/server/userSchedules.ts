import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { extractApiErrorMessage } from "@/lib/errors"
import { UserSchedulesAPI } from "@/services/userSchedules"
import type {
  ItemResponse,
  SaveUserCoverageRequest,
  ScheduleCoverageResponse,
  UserScheduleConfigResponse,
} from "@/types"
import { useUI } from "../useUI"
import {
  type QueryOptionsHelper,
  type SuspenseQueryOptionsHelper,
  useItemQuery,
  useSuspenseItemQuery,
} from "./base"

export const userScheduleQueries = {
  all: () => ["user-schedules"] as const,
  configKey: (projectId: number, userId: number) =>
    [...userScheduleQueries.all(), "config", projectId, userId] as const,
  coverageBase: (projectId: number, userId: number) =>
    [...userScheduleQueries.all(), "coverage", projectId, userId] as const,
  coverageKey: (projectId: number, userId: number, weekStart?: string) =>
    [
      ...userScheduleQueries.coverageBase(projectId, userId),
      weekStart ?? "current",
    ] as const,

  // Query Options
  config: (projectId: number, userId: number) =>
    queryOptions({
      queryKey: userScheduleQueries.configKey(projectId, userId),
      queryFn: () => UserSchedulesAPI.getConfig(projectId, userId),
      enabled: !!projectId && !!userId,
    }),
  coverage: (projectId: number, userId: number, weekStart?: string) =>
    queryOptions({
      queryKey: userScheduleQueries.coverageKey(projectId, userId, weekStart),
      queryFn: () => UserSchedulesAPI.getCoverage(projectId, userId, weekStart),
      enabled: !!projectId && !!userId,
    }),

  // Query Option Aliases
  schedulePage: (projectId: number, userId: number) =>
    userScheduleQueries.config(projectId, userId),
  personalCoverageMatrix: (
    projectId: number,
    userId: number,
    weekStart?: string,
  ) => userScheduleQueries.coverage(projectId, userId, weekStart),

  // Suspense Hooks
  useSuspenseConfig: <TSelected = UserScheduleConfigResponse>(
    projectId: number,
    userId: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<UserScheduleConfigResponse>,
      TSelected
    >,
  ) =>
    useSuspenseItemQuery(
      userScheduleQueries.config(projectId, userId),
      options,
    ),
  useSuspenseCoverage: <TSelected = ScheduleCoverageResponse>(
    projectId: number,
    userId: number,
    weekStart?: string,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ScheduleCoverageResponse>,
      TSelected
    >,
  ) =>
    useSuspenseItemQuery(
      userScheduleQueries.coverage(projectId, userId, weekStart),
      options,
    ),
  useSuspenseSchedulePage: <TSelected = UserScheduleConfigResponse>(
    projectId: number,
    userId: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<UserScheduleConfigResponse>,
      TSelected
    >,
  ) => userScheduleQueries.useSuspenseConfig(projectId, userId, options),
  useSuspensePersonalCoverageMatrix: <TSelected = ScheduleCoverageResponse>(
    projectId: number,
    userId: number,
    weekStart?: string,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ScheduleCoverageResponse>,
      TSelected
    >,
  ) =>
    userScheduleQueries.useSuspenseCoverage(
      projectId,
      userId,
      weekStart,
      options,
    ),

  // Standard Query Hooks
  useConfig: <TSelected = UserScheduleConfigResponse>(
    projectId: number,
    userId: number,
    options?: QueryOptionsHelper<
      ItemResponse<UserScheduleConfigResponse>,
      TSelected
    >,
  ) => useItemQuery(userScheduleQueries.config(projectId, userId), options),
  useCoverage: <TSelected = ScheduleCoverageResponse>(
    projectId: number,
    userId: number,
    weekStart?: string,
    options?: QueryOptionsHelper<
      ItemResponse<ScheduleCoverageResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(
      userScheduleQueries.coverage(projectId, userId, weekStart),
      options,
    ),
  useSchedulePage: <TSelected = UserScheduleConfigResponse>(
    projectId: number,
    userId: number,
    options?: QueryOptionsHelper<
      ItemResponse<UserScheduleConfigResponse>,
      TSelected
    >,
  ) => userScheduleQueries.useConfig(projectId, userId, options),
  usePersonalCoverageMatrix: <TSelected = ScheduleCoverageResponse>(
    projectId: number,
    userId: number,
    weekStart?: string,
    options?: QueryOptionsHelper<
      ItemResponse<ScheduleCoverageResponse>,
      TSelected
    >,
  ) => userScheduleQueries.useCoverage(projectId, userId, weekStart, options),

  // Mutations
  useSaveCoverage: (projectId: number, userId: number) => {
    const { message } = useUI()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (data: SaveUserCoverageRequest) =>
        UserSchedulesAPI.saveCoverage(data),
      onSuccess: (res) => {
        message.success(res.message || "Lưu lịch cá nhân thành công!")
        queryClient.invalidateQueries({
          queryKey: userScheduleQueries.coverageBase(projectId, userId),
        })
      },
      onError: (error) => {
        message.error(
          extractApiErrorMessage(error, "Lưu lịch cá nhân thất bại!"),
        )
      },
    })
  },
  useSavePersonalCoverage: (projectId: number, userId: number) =>
    userScheduleQueries.useSaveCoverage(projectId, userId),
}
