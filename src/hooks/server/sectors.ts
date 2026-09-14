import { queryOptions } from "@tanstack/react-query"
import { SectorsAPI } from "@/services/sectors"
import type {
  ItemResponse,
  ListResponse,
  SectorQueryParams,
  SectorResponse,
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

export const sectorQueries = {
  all: () => ["sectors"] as const,
  lists: () => [...sectorQueries.all(), "list"] as const,
  list: (params?: SectorQueryParams) =>
    queryOptions({
      queryKey: [...sectorQueries.lists(), params],
      queryFn: () => SectorsAPI.getAll(params),
    }),
  details: () => [...sectorQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...sectorQueries.details(), id],
      queryFn: () => SectorsAPI.getOne(id),
    }),

  useSuspenseList: <TSelected = SectorResponse[]>(
    params?: SectorQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<SectorResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(sectorQueries.list(params), options),

  useSuspenseDetail: <TSelected = SectorResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<SectorResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(sectorQueries.detail(id), options),

  useList: <TSelected = SectorResponse[]>(
    params?: SectorQueryParams,
    options?: QueryOptionsHelper<ListResponse<SectorResponse>, TSelected>,
  ) => useListQuery(sectorQueries.list(params), options),

  useDetail: <TSelected = SectorResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<SectorResponse>, TSelected>,
  ) =>
    useItemQuery(sectorQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      sectorQueries.all(),
      SectorsAPI.createOne,
      "Tạo khu vực thành công!",
      "Tạo khu vực thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      sectorQueries.all(),
      SectorsAPI.updateOne,
      "Cập nhật khu vực thành công!",
      "Cập nhật khu vực thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      sectorQueries.all(),
      SectorsAPI.deleteOne,
      "Xóa khu vực thành công!",
      "Xóa khu vực thất bại!",
    ),
}
