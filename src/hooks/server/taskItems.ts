import { queryOptions } from "@tanstack/react-query"
import { TaskItemsAPI } from "@/services/taskItems"
import type {
  BusinessMatrixResponse,
  ItemResponse,
  ListResponse,
  TaskItemCreate,
  TaskItemQueryParams,
  TaskItemResponse,
  TaskItemUpdate,
} from "@/types"
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

export const taskItemQueries = {
  all: () => ["task-items"] as const,
  lists: () => [...taskItemQueries.all(), "list"] as const,
  details: () => [...taskItemQueries.all(), "detail"] as const,
  treeKey: () => [...taskItemQueries.all(), "tree"] as const,
  businessMatrixKey: () =>
    [...taskItemQueries.all(), "business-matrix"] as const,

  list: (params?: TaskItemQueryParams) =>
    queryOptions({
      queryKey: [...taskItemQueries.lists(), params],
      queryFn: () => TaskItemsAPI.getAll(params),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...taskItemQueries.details(), id] as const,
      queryFn: () => TaskItemsAPI.getOne(id),
    }),
  businessMatrix: () =>
    queryOptions({
      queryKey: taskItemQueries.businessMatrixKey(),
      queryFn: () => TaskItemsAPI.getBusinessMatrix(),
    }),

  useSuspenseList: <TSelected = TaskItemResponse[]>(
    params?: TaskItemQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<TaskItemResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(taskItemQueries.list(params), options),

  useSuspenseDetail: <TSelected = TaskItemResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<TaskItemResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(taskItemQueries.detail(id), options),

  useSuspenseBusinessMatrix: <TSelected = BusinessMatrixResponse[]>(
    options?: SuspenseQueryOptionsHelper<
      ListResponse<BusinessMatrixResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(taskItemQueries.businessMatrix(), options),

  useList: <TSelected = TaskItemResponse[]>(
    params?: TaskItemQueryParams,
    options?: QueryOptionsHelper<ListResponse<TaskItemResponse>, TSelected>,
  ) => useListQuery(taskItemQueries.list(params), options),

  useDetail: <TSelected = TaskItemResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<TaskItemResponse>, TSelected>,
  ) =>
    useItemQuery(taskItemQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useBusinessMatrix: <TSelected = BusinessMatrixResponse[]>(
    options?: QueryOptionsHelper<
      ListResponse<BusinessMatrixResponse>,
      TSelected
    >,
  ) => useListQuery(taskItemQueries.businessMatrix(), options),

  useCreate: (relatedKeys?: unknown[][]) =>
    useCreateItem(
      taskItemQueries.all(),
      (data: TaskItemCreate) => TaskItemsAPI.createOne(data),
      "Thêm nghiệp vụ thành công!",
      "Thêm nghiệp vụ thất bại!",
      relatedKeys,
    ),

  useUpdate: (relatedKeys?: unknown[][]) =>
    useUpdateItem<TaskItemUpdate, unknown>(
      taskItemQueries.all(),
      TaskItemsAPI.updateOne,
      "Cập nhật nghiệp vụ thành công!",
      "Cập nhật nghiệp vụ thất bại!",
      relatedKeys,
    ),

  useDelete: (relatedKeys?: unknown[][]) =>
    useDeleteItem(
      taskItemQueries.all(),
      TaskItemsAPI.deleteOne,
      "Xóa nghiệp vụ thành công!",
      "Xóa nghiệp vụ thất bại!",
      relatedKeys,
    ),
}
