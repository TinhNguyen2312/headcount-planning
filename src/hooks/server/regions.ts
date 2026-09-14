import { queryOptions } from "@tanstack/react-query"
import { RegionsAPI } from "@/services/regions"
import type {
  ItemResponse,
  ListResponse,
  RegionDetail,
  RegionQueryParams,
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

export const regionQueries = {
  all: () => ["regions"] as const,
  lists: () => [...regionQueries.all(), "list"] as const,
  list: (params?: RegionQueryParams) =>
    queryOptions({
      queryKey: [...regionQueries.lists(), params],
      queryFn: () => RegionsAPI.getAll(params),
    }),
  details: () => [...regionQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...regionQueries.details(), id],
      queryFn: () => RegionsAPI.getOne(id),
    }),

  useSuspenseList: <TSelected = RegionDetail[]>(
    params?: RegionQueryParams,
    options?: SuspenseQueryOptionsHelper<ListResponse<RegionDetail>, TSelected>,
  ) => useSuspenseListQuery(regionQueries.list(params), options),

  useSuspenseDetail: <TSelected = RegionDetail>(
    id: number,
    options?: SuspenseQueryOptionsHelper<ItemResponse<RegionDetail>, TSelected>,
  ) => useSuspenseItemQuery(regionQueries.detail(id), options),

  useList: <TSelected = RegionDetail[]>(
    params?: RegionQueryParams,
    options?: QueryOptionsHelper<ListResponse<RegionDetail>, TSelected>,
  ) => useListQuery(regionQueries.list(params), options),

  useDetail: <TSelected = RegionDetail>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<RegionDetail>, TSelected>,
  ) =>
    useItemQuery(regionQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      regionQueries.all(),
      RegionsAPI.createOne,
      "Tạo vùng dự án thành công!",
      "Tạo vùng dự án thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      regionQueries.all(),
      RegionsAPI.updateOne,
      "Cập nhật vùng dự án thành công!",
      "Cập nhật vùng dự án thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      regionQueries.all(),
      RegionsAPI.deleteOne,
      "Xóa vùng dự án thành công!",
      "Xóa vùng dự án thất bại!",
    ),
}
