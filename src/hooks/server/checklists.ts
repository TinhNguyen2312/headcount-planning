/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions } from "@tanstack/react-query"
import { ChecklistInstancesAPI, ChecklistsAPI } from "@/services/checklists"
import type {
  ChecklistCreate,
  ChecklistInstanceCreate,
  ChecklistInstanceItemResponse,
  ChecklistInstanceItemUpdate,
  ChecklistInstanceResponse,
  ChecklistItemCreate,
  ChecklistItemReorderEntry,
  ChecklistItemTreeNodeResponse,
  ChecklistItemUpdate,
  ChecklistQueryParams,
  ChecklistResponse,
  ChecklistUpdate,
  ItemResponse,
  ListResponse,
  ReorderChecklistItemsRequest,
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

export const checklistQueries = {
  all: () => ["checklists"] as const,
  lists: () => [...checklistQueries.all(), "list"] as const,
  list: (params?: ChecklistQueryParams) =>
    queryOptions({
      queryKey: [...checklistQueries.lists(), params],
      queryFn: () => ChecklistsAPI.getAll(params),
    }),
  details: () => [...checklistQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...checklistQueries.details(), id],
      queryFn: () => ChecklistsAPI.getOne(id),
    }),
  items: (checklistId: number) =>
    queryOptions({
      queryKey: [...checklistQueries.all(), checklistId, "items"] as const,
      queryFn: () => ChecklistsAPI.getItemsTree(checklistId),
    }),

  instancesAll: () => ["checklist-instances"] as const,
  instanceForTask: (taskInstanceId: number) =>
    queryOptions({
      queryKey: [
        ...checklistQueries.instancesAll(),
        "for-task",
        taskInstanceId,
      ] as const,
      queryFn: async () => {
        try {
          return await ChecklistInstancesAPI.getForTask(taskInstanceId)
        } catch (error: any) {
          if (error?.response?.status === 404) return null
          throw error
        }
      },
    }),
  instanceItems: (taskInstanceId: number, checklistInstanceId: number) =>
    queryOptions({
      queryKey: [
        ...checklistQueries.instancesAll(),
        taskInstanceId,
        checklistInstanceId,
        "items",
      ] as const,
      queryFn: () =>
        ChecklistInstancesAPI.getItems(taskInstanceId, checklistInstanceId),
    }),

  useSuspenseList: <TSelected = ChecklistResponse[]>(
    params?: ChecklistQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<ChecklistResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(checklistQueries.list(params), options),
  useSuspenseDetail: <TSelected = ChecklistResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ChecklistResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(checklistQueries.detail(id), options),
  useSuspenseItems: <TSelected = ChecklistItemTreeNodeResponse[]>(
    checklistId: number,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<ChecklistItemTreeNodeResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(checklistQueries.items(checklistId), options),

  useList: <TSelected = ChecklistResponse[]>(
    params?: ChecklistQueryParams,
    options?: QueryOptionsHelper<ListResponse<ChecklistResponse>, TSelected>,
  ) => useListQuery(checklistQueries.list(params), options),
  useDetail: <TSelected = ChecklistResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<ChecklistResponse>, TSelected>,
  ) =>
    useItemQuery(checklistQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),
  useItems: <TSelected = ChecklistItemTreeNodeResponse[]>(
    checklistId?: number,
    options?: QueryOptionsHelper<
      ListResponse<ChecklistItemTreeNodeResponse>,
      TSelected
    >,
  ) =>
    useListQuery(checklistQueries.items(checklistId!), {
      enabled: !!checklistId && options?.enabled !== false,
      ...options,
    }),

  useInstanceForTask: <TSelected = ChecklistInstanceResponse | null>(
    taskInstanceId?: number,
    options?: QueryOptionsHelper<
      ItemResponse<ChecklistInstanceResponse | null>,
      TSelected
    >,
  ) =>
    useItemQuery(checklistQueries.instanceForTask(taskInstanceId as number), {
      enabled: !!taskInstanceId && options?.enabled !== false,
      ...options,
    }),
  useInstanceItems: <TSelected = ChecklistInstanceItemResponse[]>(
    taskInstanceId?: number,
    checklistInstanceId?: number,
    options?: QueryOptionsHelper<
      ListResponse<ChecklistInstanceItemResponse>,
      TSelected
    >,
  ) =>
    useListQuery(
      checklistQueries.instanceItems(
        taskInstanceId as number,
        checklistInstanceId as number,
      ),
      {
        enabled:
          !!taskInstanceId &&
          !!checklistInstanceId &&
          options?.enabled !== false,
        ...options,
      },
    ),

  useCreate: () =>
    useCreateItem<ChecklistCreate>(
      checklistQueries.all(),
      ChecklistsAPI.createOne,
      "Tạo checklist thành công!",
      "Tạo thất bại!",
    ),
  useUpdate: () =>
    useUpdateItem<ChecklistUpdate>(
      checklistQueries.all(),
      ChecklistsAPI.updateOne,
      "Cập nhật thành công!",
      "Cập nhật thất bại!",
    ),
  useDelete: () =>
    useDeleteItem(
      checklistQueries.all(),
      ChecklistsAPI.deleteOne,
      "Xóa thành công!",
      "Xóa thất bại!",
    ),
  useActivate: () =>
    useUpdateItem(
      checklistQueries.all(),
      (id: number) => ChecklistsAPI.activate(id),
      "Kích hoạt checklist thành công!",
      "Kích hoạt thất bại!",
    ),
  useDeactivate: () =>
    useUpdateItem(
      checklistQueries.all(),
      (id: number) => ChecklistsAPI.deactivate(id),
      "Hủy kích hoạt checklist thành công!",
      "Hủy kích hoạt thất bại!",
    ),
  useReorderItems: (checklistId?: number) =>
    useUpdateItem(
      [...checklistQueries.all(), checklistId, "items"],
      (
        id: number,
        data:
          | ReorderChecklistItemsRequest
          | { orders: ChecklistItemReorderEntry[] }
          | ChecklistItemReorderEntry[],
      ) => {
        const items = Array.isArray(data)
          ? data
          : "items" in data
            ? data.items
            : data.orders
        return ChecklistsAPI.reorderItems(id, items)
      },
      "Cập nhật thứ tự thành công!",
      "Cập nhật thứ tự thất bại!",
    ),
  useAddItem: (checklistId?: number) =>
    useCreateItem(
      [...checklistQueries.all(), checklistId, "items"],
      (data: ChecklistItemCreate) =>
        ChecklistsAPI.addItem(checklistId as number, data),
      "Thêm mục kiểm tra thành công!",
      "Thêm thất bại!",
    ),
  useUpdateItem: (checklistId?: number) =>
    useUpdateItem(
      [...checklistQueries.all(), checklistId, "items"],
      (id: number, data: ChecklistItemUpdate) =>
        ChecklistsAPI.updateItem(checklistId as number, id, data),
      "Cập nhật thành công!",
      "Cập nhật thất bại!",
    ),
  useDeleteItem: (checklistId?: number) =>
    useDeleteItem(
      [...checklistQueries.all(), checklistId, "items"],
      (id: number) => ChecklistsAPI.deleteItem(checklistId as number, id),
      "Xóa mục thành công!",
      "Xóa thất bại!",
    ),

  useCreateInstance: (taskInstanceId: number) =>
    useCreateItem(
      checklistQueries.instanceForTask(taskInstanceId).queryKey,
      (data: ChecklistInstanceCreate) =>
        ChecklistInstancesAPI.createForTask(taskInstanceId, data),
      "Tạo phiếu nghiệm thu thành công!",
      "Tạo thất bại!",
    ),
  useUpdateInstanceItem: (
    taskInstanceId?: number,
    checklistInstanceId?: number,
  ) =>
    useUpdateItem(
      checklistQueries.instanceItems(
        taskInstanceId ?? 0,
        checklistInstanceId ?? 0,
      ).queryKey,
      (itemId: number, data: ChecklistInstanceItemUpdate) =>
        ChecklistInstancesAPI.updateItem(
          taskInstanceId as number,
          checklistInstanceId as number,
          itemId,
          data,
        ),
      "Cập nhật kết quả thành công!",
      "Cập nhật thất bại!",
    ),
}
