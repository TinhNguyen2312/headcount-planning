import { queryOptions } from "@tanstack/react-query"
import { ReportsAPI } from "@/services/reports"
import type {
  AtRiskTaskReportResponse,
  IQueryAtRiskReport,
  IQueryLeaderboardReport,
  IQueryOverdueReport,
  IQueryProgressReport,
  IQueryProgressTrendReport,
  IQueryRolePerformanceReport,
  IQueryUserPerformanceReport,
  IQueryUserTaskBreakdown,
  IQueryUserWorkloadHeatmap,
  ItemResponse,
  LeaderboardUserResponse,
  ListResponse,
  OverdueTaskReportResponse,
  ProgressTrendReportResponse,
  ProjectProgressReportResponse,
  RolePerformanceReportResponse,
  TaskBreakdownNode,
  UserPerformanceReportResponse,
  UserWorkloadHeatmapItem,
} from "@/types"
import {
  type QueryOptionsHelper,
  type SuspenseQueryOptionsHelper,
  useItemQuery,
  useListQuery,
  useSuspenseItemQuery,
  useSuspenseListQuery,
} from "./base"

export const reportQueries = {
  all: () => ["reports"] as const,
  progressKey: (params?: IQueryProgressReport) =>
    [...reportQueries.all(), "progress", params] as const,
  progressTrendKey: (params?: IQueryProgressTrendReport) =>
    [...reportQueries.all(), "progress-trend", params] as const,
  byRoleKey: (params?: IQueryRolePerformanceReport) =>
    [...reportQueries.all(), "by-role", params] as const,
  overdueKey: (params?: IQueryOverdueReport) =>
    [...reportQueries.all(), "overdue", params] as const,
  atRiskKey: (params?: IQueryAtRiskReport) =>
    [...reportQueries.all(), "at-risk", params] as const,
  leaderboardKey: (params?: IQueryLeaderboardReport) =>
    [...reportQueries.all(), "leaderboard", params] as const,
  userHistoryKey: (params: IQueryUserPerformanceReport) =>
    [...reportQueries.all(), "user-history", params] as const,
  userWorkloadHeatmapKey: (params: IQueryUserWorkloadHeatmap) =>
    [...reportQueries.all(), "user-workload-heatmap", params] as const,
  userTaskBreakdownKey: (params: IQueryUserTaskBreakdown) =>
    [...reportQueries.all(), "user-task-breakdown", params] as const,

  progress: (params?: IQueryProgressReport) =>
    queryOptions({
      queryKey: reportQueries.progressKey(params),
      queryFn: () => ReportsAPI.getProgress(params!),
      enabled: !!params?.projectId,
    }),

  progressTrend: (params: IQueryProgressTrendReport) =>
    queryOptions({
      queryKey: reportQueries.progressTrendKey(params),
      queryFn: () => ReportsAPI.getProgressTrend(params),
      enabled: !!params?.projectId,
    }),

  byRole: (params?: IQueryRolePerformanceReport) =>
    queryOptions({
      queryKey: reportQueries.byRoleKey(params),
      queryFn: () => ReportsAPI.getByRole(params),
    }),

  overdue: (params?: IQueryOverdueReport) =>
    queryOptions({
      queryKey: reportQueries.overdueKey(params),
      queryFn: () => ReportsAPI.getOverdue(params),
    }),

  atRisk: (params: IQueryAtRiskReport) =>
    queryOptions({
      queryKey: reportQueries.atRiskKey(params),
      queryFn: () => ReportsAPI.getAtRisk(params),
      enabled: !!params?.projectId,
    }),

  leaderboard: (params?: IQueryLeaderboardReport) =>
    queryOptions({
      queryKey: reportQueries.leaderboardKey(params),
      queryFn: () => ReportsAPI.getLeaderboard(params),
    }),

  userHistory: (params: IQueryUserPerformanceReport) =>
    queryOptions({
      queryKey: reportQueries.userHistoryKey(params),
      queryFn: () => ReportsAPI.getUserHistory(params),
      enabled: !!params.userId,
    }),

  userWorkloadHeatmap: (params: IQueryUserWorkloadHeatmap) =>
    queryOptions({
      queryKey: reportQueries.userWorkloadHeatmapKey(params),
      queryFn: () => ReportsAPI.getUserWorkloadHeatmap(params),
      enabled: !!params.userId,
    }),

  userTaskBreakdown: (params: IQueryUserTaskBreakdown) =>
    queryOptions({
      queryKey: reportQueries.userTaskBreakdownKey(params),
      queryFn: () => ReportsAPI.getUserTaskBreakdown(params),
      enabled: !!params.userId,
    }),

  useSuspenseProgress: <TSelected = ProjectProgressReportResponse>(
    params: IQueryProgressReport,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ProjectProgressReportResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(reportQueries.progress(params), options),

  useSuspenseProgressTrend: <TSelected = ProgressTrendReportResponse>(
    params: IQueryProgressTrendReport,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ProgressTrendReportResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(reportQueries.progressTrend(params), options),

  useSuspenseByRole: <TSelected = RolePerformanceReportResponse[]>(
    params?: IQueryRolePerformanceReport,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<RolePerformanceReportResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(reportQueries.byRole(params), options),

  useSuspenseOverdue: <TSelected = OverdueTaskReportResponse[]>(
    params?: IQueryOverdueReport,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<OverdueTaskReportResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(reportQueries.overdue(params), options),

  useSuspenseAtRisk: <TSelected = AtRiskTaskReportResponse[]>(
    params: IQueryAtRiskReport,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<AtRiskTaskReportResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(reportQueries.atRisk(params), options),

  useSuspenseLeaderboard: <TSelected = LeaderboardUserResponse[]>(
    params?: IQueryLeaderboardReport,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<LeaderboardUserResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(reportQueries.leaderboard(params), options),

  useProgress: <TSelected = ProjectProgressReportResponse>(
    params?: IQueryProgressReport,
    options?: QueryOptionsHelper<
      ItemResponse<ProjectProgressReportResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(reportQueries.progress(params), {
      enabled: !!params?.projectId && options?.enabled !== false,
      ...options,
    }),

  useProgressTrend: <TSelected = ProgressTrendReportResponse>(
    params: IQueryProgressTrendReport,
    options?: QueryOptionsHelper<
      ItemResponse<ProgressTrendReportResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(reportQueries.progressTrend(params), {
      enabled: !!params?.projectId && options?.enabled !== false,
      ...options,
    }),

  useByRole: <TSelected = RolePerformanceReportResponse[]>(
    params?: IQueryRolePerformanceReport,
    options?: QueryOptionsHelper<
      ListResponse<RolePerformanceReportResponse>,
      TSelected
    >,
  ) => useListQuery(reportQueries.byRole(params), options),

  useOverdue: <TSelected = OverdueTaskReportResponse[]>(
    params?: IQueryOverdueReport,
    options?: QueryOptionsHelper<
      ListResponse<OverdueTaskReportResponse>,
      TSelected
    >,
  ) => useListQuery(reportQueries.overdue(params), options),

  useAtRisk: <TSelected = AtRiskTaskReportResponse[]>(
    params: IQueryAtRiskReport,
    options?: QueryOptionsHelper<
      ListResponse<AtRiskTaskReportResponse>,
      TSelected
    >,
  ) =>
    useListQuery(reportQueries.atRisk(params), {
      enabled: !!params?.projectId && options?.enabled !== false,
      ...options,
    }),

  useLeaderboard: <TSelected = LeaderboardUserResponse[]>(
    params?: IQueryLeaderboardReport,
    options?: QueryOptionsHelper<
      ListResponse<LeaderboardUserResponse>,
      TSelected
    >,
  ) => useListQuery(reportQueries.leaderboard(params), options),

  useUserHistory: <TSelected = UserPerformanceReportResponse>(
    params: IQueryUserPerformanceReport,
    options?: QueryOptionsHelper<
      ItemResponse<UserPerformanceReportResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(reportQueries.userHistory(params), {
      enabled: !!params?.userId && options?.enabled !== false,
      ...options,
    }),

  useSuspenseUserWorkloadHeatmap: <TSelected = UserWorkloadHeatmapItem[]>(
    params: IQueryUserWorkloadHeatmap,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<UserWorkloadHeatmapItem>,
      TSelected
    >,
  ) => useSuspenseListQuery(reportQueries.userWorkloadHeatmap(params), options),

  useUserWorkloadHeatmap: <TSelected = UserWorkloadHeatmapItem[]>(
    params: IQueryUserWorkloadHeatmap,
    options?: QueryOptionsHelper<
      ListResponse<UserWorkloadHeatmapItem>,
      TSelected
    >,
  ) =>
    useListQuery(reportQueries.userWorkloadHeatmap(params), {
      enabled: !!params?.userId && options?.enabled !== false,
      ...options,
    }),

  useSuspenseUserTaskBreakdown: <TSelected = TaskBreakdownNode[]>(
    params: IQueryUserTaskBreakdown,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<TaskBreakdownNode>,
      TSelected
    >,
  ) => useSuspenseListQuery(reportQueries.userTaskBreakdown(params), options),

  useUserTaskBreakdown: <TSelected = TaskBreakdownNode[]>(
    params: IQueryUserTaskBreakdown,
    options?: QueryOptionsHelper<ListResponse<TaskBreakdownNode>, TSelected>,
  ) =>
    useListQuery(reportQueries.userTaskBreakdown(params), {
      enabled: !!params?.userId && options?.enabled !== false,
      ...options,
    }),
}
