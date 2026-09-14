import { queryOptions } from "@tanstack/react-query"
import { DepartmentsAPI } from "@/services/departments"
import type {
  DepartmentQueryParams,
  DepartmentResponse,
  DepartmentTreeNodeResponse,
  ItemResponse,
  ListResponse,
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

export const departmentQueries = {
  all: () => ["departments"] as const,
  lists: () => [...departmentQueries.all(), "list"] as const,
  details: () => [...departmentQueries.all(), "detail"] as const,
  treeKey: () => [...departmentQueries.all(), "tree"] as const,

  list: (params?: DepartmentQueryParams) =>
    queryOptions({
      queryKey: [...departmentQueries.lists(), params],
      queryFn: () => DepartmentsAPI.getAll(params),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...departmentQueries.details(), id] as const,
      queryFn: () => DepartmentsAPI.getOne(id),
    }),

  tree: () =>
    queryOptions({
      queryKey: departmentQueries.treeKey(),
      queryFn: () => DepartmentsAPI.getTree(),
    }),

  useSuspenseList: <TSelected = DepartmentResponse[]>(
    params?: DepartmentQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<DepartmentResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(departmentQueries.list(params), options),

  useSuspenseDetail: <TSelected = DepartmentResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<DepartmentResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(departmentQueries.detail(id), options),

  useSuspenseTree: <TSelected = DepartmentTreeNodeResponse[]>(
    options?: SuspenseQueryOptionsHelper<
      ListResponse<DepartmentTreeNodeResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(departmentQueries.tree(), options),

  useList: <TSelected = DepartmentResponse[]>(
    params?: DepartmentQueryParams,
    options?: QueryOptionsHelper<ListResponse<DepartmentResponse>, TSelected>,
  ) => useListQuery(departmentQueries.list(params), options),

  useDetail: <TSelected = DepartmentResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<DepartmentResponse>, TSelected>,
  ) =>
    useItemQuery(departmentQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useTree: <TSelected = DepartmentTreeNodeResponse[]>(
    options?: QueryOptionsHelper<
      ListResponse<DepartmentTreeNodeResponse>,
      TSelected
    >,
  ) => useListQuery(departmentQueries.tree(), options),

  useCreate: () =>
    useCreateItem(
      departmentQueries.all(),
      DepartmentsAPI.createOne,
      "Tạo phòng ban thành công!",
      "Tạo phòng ban thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      departmentQueries.all(),
      DepartmentsAPI.updateOne,
      "Cập nhật phòng ban thành công!",
      "Cập nhật phòng ban thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      departmentQueries.all(),
      DepartmentsAPI.deleteOne,
      "Xóa phòng ban thành công!",
      "Xóa phòng ban thất bại!",
    ),
}
