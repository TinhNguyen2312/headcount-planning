import { queryOptions } from "@tanstack/react-query"
import { RolesAPI } from "@/services/roles"
import type {
  ItemResponse,
  ListResponse,
  RoleQueryParams,
  RoleResponse,
  RoleTreeNodeResponse,
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

export const roleQueries = {
  all: () => ["roles"] as const,
  lists: () => [...roleQueries.all(), "list"] as const,
  list: (params?: RoleQueryParams) =>
    queryOptions({
      queryKey: [...roleQueries.lists(), params],
      queryFn: () => RolesAPI.getAll(params),
    }),
  details: () => [...roleQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...roleQueries.details(), id],
      queryFn: () => RolesAPI.getOne(id),
    }),
  tree: () =>
    queryOptions({
      queryKey: [...roleQueries.all(), "tree"] as const,
      queryFn: RolesAPI.getTree,
    }),

  useSuspenseList: <TSelected = RoleResponse[]>(
    params?: RoleQueryParams,
    options?: SuspenseQueryOptionsHelper<ListResponse<RoleResponse>, TSelected>,
  ) => useSuspenseListQuery(roleQueries.list(params), options),
  useSuspenseDetail: <TSelected = RoleResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<ItemResponse<RoleResponse>, TSelected>,
  ) => useSuspenseItemQuery(roleQueries.detail(id), options),
  useSuspenseTree: <TSelected = RoleTreeNodeResponse[]>(
    options?: SuspenseQueryOptionsHelper<
      ListResponse<RoleTreeNodeResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(roleQueries.tree(), options),

  useList: <TSelected = RoleResponse[]>(
    params?: RoleQueryParams,
    options?: QueryOptionsHelper<ListResponse<RoleResponse>, TSelected>,
  ) => useListQuery(roleQueries.list(params), options),
  useDetail: <TSelected = RoleResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<RoleResponse>, TSelected>,
  ) =>
    useItemQuery(roleQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),
  useTree: <TSelected = RoleTreeNodeResponse[]>(
    options?: QueryOptionsHelper<ListResponse<RoleTreeNodeResponse>, TSelected>,
  ) => useListQuery(roleQueries.tree(), options),

  useCreate: () =>
    useCreateItem(
      roleQueries.all(),
      RolesAPI.createOne,
      "Tạo chức vụ thành công!",
      "Tạo chức vụ thất bại!",
    ),
  useUpdate: () =>
    useUpdateItem(
      roleQueries.all(),
      RolesAPI.updateOne,
      "Cập nhật chức vụ thành công!",
      "Cập nhật chức vụ thất bại!",
    ),
  useDelete: () =>
    useDeleteItem(
      roleQueries.all(),
      RolesAPI.deleteOne,
      "Xóa chức vụ thành công!",
      "Xóa chức vụ thất bại!",
    ),
}
