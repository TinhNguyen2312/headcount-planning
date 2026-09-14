import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { PropertiesAPI } from "@/services/properties"
import type {
  ItemResponse,
  ListResponse,
  ProjectPropertiesMatrixResponse,
  PropertyQueryParams,
  PropertyResponse,
  SaveProjectPropertiesPayload,
} from "@/types"
import { useUI } from "@/hooks/useUI"
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

export const propertyQueries = {
  all: () => ["properties"] as const,
  lists: () => [...propertyQueries.all(), "list"] as const,
  list: (params?: PropertyQueryParams) =>
    queryOptions({
      queryKey: [...propertyQueries.lists(), params],
      queryFn: () => PropertiesAPI.getAll(params),
    }),
  details: () => [...propertyQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...propertyQueries.details(), id],
      queryFn: () => PropertiesAPI.getOne(id),
    }),
  projectProperties: (projectId: number) =>
    queryOptions({
      queryKey: [...propertyQueries.all(), "project", projectId],
      queryFn: () => PropertiesAPI.getProjectProperties(projectId),
    }),

  useSuspenseList: <TSelected = PropertyResponse[]>(
    params?: PropertyQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<PropertyResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(propertyQueries.list(params), options),

  useSuspenseDetail: <TSelected = PropertyResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<PropertyResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(propertyQueries.detail(id), options),

  useList: <TSelected = PropertyResponse[]>(
    params?: PropertyQueryParams,
    options?: QueryOptionsHelper<ListResponse<PropertyResponse>, TSelected>,
  ) => useListQuery(propertyQueries.list(params), options),

  useDetail: <TSelected = PropertyResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<PropertyResponse>, TSelected>,
  ) =>
    useItemQuery(propertyQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      propertyQueries.all(),
      PropertiesAPI.createOne,
      "Tạo cơ sở định biên thành công!",
      "Tạo cơ sở định biên thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      propertyQueries.all(),
      PropertiesAPI.updateOne,
      "Cập nhật cơ sở định biên thành công!",
      "Cập nhật cơ sở định biên thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      propertyQueries.all(),
      PropertiesAPI.deleteOne,
      "Xóa cơ sở định biên thành công!",
      "Xóa cơ sở định biên thất bại!",
    ),

  useProjectProperties: (projectId: number) =>
    useQuery({
      ...propertyQueries.projectProperties(projectId),
      enabled: !!projectId,
    }),

  useSaveProjectProperties: (projectId: number) => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: (payload: SaveProjectPropertiesPayload) =>
        PropertiesAPI.saveProjectProperties(projectId, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: propertyQueries.projectProperties(projectId).queryKey,
        })
        message.success("Lưu cơ sở định biên dự án thành công!")
      },
      onError: (error: any) => {
        console.error("Save project properties error:", error)
        message.error(
          error?.response?.data?.message || "Lỗi lưu cơ sở định biên dự án!",
        )
      },
    })
  },
}
