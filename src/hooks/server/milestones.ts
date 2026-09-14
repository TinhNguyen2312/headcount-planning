import { queryOptions } from "@tanstack/react-query"
import { MilestonesAPI } from "@/services/milestones"
import type {
  ItemResponse,
  ListResponse,
  MilestoneQueryParams,
  MilestoneResponse,
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

export const milestoneQueries = {
  all: () => ["milestones"] as const,
  lists: () => [...milestoneQueries.all(), "list"] as const,
  list: (params?: MilestoneQueryParams) =>
    queryOptions({
      queryKey: [...milestoneQueries.lists(), params],
      queryFn: () => MilestonesAPI.getAll(params),
    }),
  details: () => [...milestoneQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...milestoneQueries.details(), id],
      queryFn: () => MilestonesAPI.getOne(id),
    }),

  useSuspenseList: <TSelected = MilestoneResponse[]>(
    params?: MilestoneQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<MilestoneResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(milestoneQueries.list(params), options),

  useSuspenseDetail: <TSelected = MilestoneResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<MilestoneResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(milestoneQueries.detail(id), options),

  useList: <TSelected = MilestoneResponse[]>(
    params?: MilestoneQueryParams,
    options?: QueryOptionsHelper<ListResponse<MilestoneResponse>, TSelected>,
  ) => useListQuery(milestoneQueries.list(params), options),

  useDetail: <TSelected = MilestoneResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<MilestoneResponse>, TSelected>,
  ) =>
    useItemQuery(milestoneQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      milestoneQueries.all(),
      MilestonesAPI.createOne,
      "Tạo mốc tiến độ thành công!",
      "Tạo mốc tiến độ thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      milestoneQueries.all(),
      MilestonesAPI.updateOne,
      "Cập nhật mốc tiến độ thành công!",
      "Cập nhật mốc tiến độ thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      milestoneQueries.all(),
      MilestonesAPI.deleteOne,
      "Xóa mốc tiến độ thành công!",
      "Xóa mốc tiến độ thất bại!",
    ),
}
