import { queryOptions } from "@tanstack/react-query"
import { InstancesAPI } from "@/services/instances"
import type {
  GenerateInstanceRequest,
  InstanceResponse,
  IQueryTaskInstances,
  ItemResponse,
  ListResponse,
  UpdateInstanceStatusRequest,
} from "@/types"
import {
  type QueryOptionsHelper,
  type SuspenseQueryOptionsHelper,
  useCreateItem,
  useItemQuery,
  useListQuery,
  useSuspenseItemQuery,
} from "./base"

export const instanceQueries = {
  all: () => ["instances"] as const,
  lists: () => [...instanceQueries.all(), "list"] as const,
  list: (params?: IQueryTaskInstances) =>
    queryOptions({
      queryKey: [...instanceQueries.lists(), params],
      queryFn: () => InstancesAPI.getAll(params),
    }),
  details: () => [...instanceQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...instanceQueries.details(), id],
      queryFn: () => InstancesAPI.getOne(id),
    }),

  useSuspenseDetail: <TSelected = InstanceResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<InstanceResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(instanceQueries.detail(id), options),

  useList: <TSelected = InstanceResponse[]>(
    params?: IQueryTaskInstances,
    options?: QueryOptionsHelper<ListResponse<InstanceResponse>, TSelected>,
  ) => useListQuery(instanceQueries.list(params), options),
  useDetail: <TSelected = InstanceResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<InstanceResponse>, TSelected>,
  ) =>
    useItemQuery(instanceQueries.detail(Number(id)), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useGenerate: () =>
    useCreateItem(
      instanceQueries.all(),
      (data: GenerateInstanceRequest) => InstancesAPI.generate(data),
      "Sinh công việc thành công!",
      "Sinh công việc thất bại!",
    ),
  useUpdateStatus: (id: number) =>
    useCreateItem(
      instanceQueries.detail(id).queryKey,
      (data: UpdateInstanceStatusRequest) =>
        InstancesAPI.updateStatus(id, data),
      "Cập nhật trạng thái thành công!",
      "Cập nhật trạng thái thất bại!",
      [instanceQueries.all()],
    ),
}

export { taskInstanceQueries } from "./taskInstances"
