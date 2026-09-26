import { type QueryKey, queryOptions } from "@tanstack/react-query"
import { TaskInstancesAPI } from "@/services/taskInstances"
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
import {
  type QueryOptionsHelper,
  type SuspenseQueryOptionsHelper,
  useCreateItem,
  useItemQuery,
  useListQuery,
  useSuspenseItemQuery,
  useSuspenseListQuery,
} from "./base"
import { instanceQueries } from "./instances"

export const taskInstanceQueries = {
  all: () => ["task-instances"] as const,
  lists: () => [...taskInstanceQueries.all(), "list"] as const,
  list: (params?: TaskInstanceFilters) =>
    queryOptions({
      queryKey: [...taskInstanceQueries.lists(), params],
      queryFn: () => TaskInstancesAPI.getAll(params),
    }),
  myTasks: (params?: MyTasksFilters) =>
    queryOptions({
      queryKey: [...taskInstanceQueries.all(), "my-tasks", params] as const,
      queryFn: () => TaskInstancesAPI.getMyTasks(params),
    }),
  subordinates: (params?: SubordinateTaskFilters) =>
    queryOptions({
      queryKey: [...taskInstanceQueries.all(), "subordinates", params] as const,
      queryFn: () => TaskInstancesAPI.getSubordinates(params),
    }),
  pendingApprovals: (params?: PendingApprovalFilters) =>
    queryOptions({
      queryKey: [
        ...taskInstanceQueries.all(),
        "pending-approvals",
        params,
      ] as const,
      queryFn: () => TaskInstancesAPI.getPendingApprovals(params),
    }),
  details: () => [...taskInstanceQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...taskInstanceQueries.details(), id],
      queryFn: () => TaskInstancesAPI.getOne(id),
    }),
  histories: (id: number) =>
    queryOptions({
      queryKey: [...taskInstanceQueries.all(), id, "histories"] as const,
      queryFn: () => TaskInstancesAPI.getHistories(id),
    }),

  useSuspenseList: <TSelected = TaskInstanceResponse[]>(
    params?: TaskInstanceFilters,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<TaskInstanceResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(taskInstanceQueries.list(params), options),
  useSuspenseDetail: <TSelected = TaskInstanceResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<TaskInstanceResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(taskInstanceQueries.detail(id), options),

  useList: <TSelected = TaskInstanceResponse[]>(
    params?: TaskInstanceFilters,
    options?: QueryOptionsHelper<ListResponse<TaskInstanceResponse>, TSelected>,
  ) => useListQuery(taskInstanceQueries.list(params), options),
  useMyTasks: <TSelected = TaskInstanceResponse[]>(
    params?: MyTasksFilters,
    options?: QueryOptionsHelper<ListResponse<TaskInstanceResponse>, TSelected>,
  ) => useListQuery(taskInstanceQueries.myTasks(params), options),
  useSubordinates: <TSelected = TaskInstanceResponse[]>(
    params?: SubordinateTaskFilters,
    options?: QueryOptionsHelper<ListResponse<TaskInstanceResponse>, TSelected>,
  ) => useListQuery(taskInstanceQueries.subordinates(params), options),
  usePendingApprovals: <TSelected = TaskInstanceResponse[]>(
    params?: PendingApprovalFilters,
    options?: QueryOptionsHelper<ListResponse<TaskInstanceResponse>, TSelected>,
  ) => useListQuery(taskInstanceQueries.pendingApprovals(params), options),
  useDetail: <TSelected = TaskInstanceResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<TaskInstanceResponse>, TSelected>,
  ) =>
    useItemQuery(taskInstanceQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),
  useHistories: <TSelected = TaskInstanceHistoryResponse[]>(
    id?: number,
    options?: QueryOptionsHelper<
      ListResponse<TaskInstanceHistoryResponse>,
      TSelected
    >,
  ) =>
    useListQuery(taskInstanceQueries.histories(id as number), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useUpdateStatus: (taskId: number, relatedKeys?: QueryKey[]) =>
    useCreateItem(
      taskInstanceQueries.detail(taskId).queryKey,
      (data: UpdateTaskStatusRequest) =>
        TaskInstancesAPI.updateStatus(taskId, data),
      "Cập nhật trạng thái thành công!",
      "Cập nhật trạng thái thất bại!",
      relatedKeys,
    ),
  useEvaluate: (taskId: number, relatedKeys?: QueryKey[]) =>
    useCreateItem(
      taskInstanceQueries.detail(taskId).queryKey,
      (data: EvaluateTaskRequest) => TaskInstancesAPI.evaluate(taskId, data),
      "Đánh giá thành công!",
      "Đánh giá thất bại!",
      relatedKeys,
    ),
  useApprove: (taskId: number, relatedKeys?: QueryKey[]) =>
    useCreateItem(
      taskInstanceQueries.detail(taskId).queryKey,
      (note: string | undefined) => TaskInstancesAPI.approve(taskId, note),
      "Duyệt thành công!",
      "Duyệt thất bại!",
      relatedKeys,
    ),
  useCreateAdhoc: () =>
    useCreateItem(
      taskInstanceQueries.all(),
      (data: CreateAdhocTaskRequest) => TaskInstancesAPI.createAdhoc(data),
      "Tạo công việc đột xuất thành công!",
      "Tạo công việc đột xuất thất bại!",
      [instanceQueries.all()],
    ),
}
