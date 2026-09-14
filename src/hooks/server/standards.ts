import { queryOptions, useMutation } from "@tanstack/react-query"
import { StandardsAPI } from "@/services/standards"
import type {
  EvaluateStandardPayload,
  HeadcountStandardQueryParams,
  HeadcountStandardResponse,
  ItemResponse,
  ListResponse,
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

export const standardQueries = {
  all: () => ["standards"] as const,
  lists: () => [...standardQueries.all(), "list"] as const,
  list: (params?: HeadcountStandardQueryParams) =>
    queryOptions({
      queryKey: [...standardQueries.lists(), params],
      queryFn: () => StandardsAPI.getAll(params),
    }),
  details: () => [...standardQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...standardQueries.details(), id],
      queryFn: () => StandardsAPI.getOne(id),
    }),

  useSuspenseList: <TSelected = HeadcountStandardResponse[]>(
    params?: HeadcountStandardQueryParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<HeadcountStandardResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(standardQueries.list(params), options),

  useSuspenseDetail: <TSelected = HeadcountStandardResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<HeadcountStandardResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(standardQueries.detail(id), options),

  useList: <TSelected = HeadcountStandardResponse[]>(
    params?: HeadcountStandardQueryParams,
    options?: QueryOptionsHelper<
      ListResponse<HeadcountStandardResponse>,
      TSelected
    >,
  ) => useListQuery(standardQueries.list(params), options),

  useDetail: <TSelected = HeadcountStandardResponse>(
    id?: number,
    options?: QueryOptionsHelper<
      ItemResponse<HeadcountStandardResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(standardQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      standardQueries.all(),
      StandardsAPI.createOne,
      "Tạo định biên chuẩn thành công!",
      "Tạo định biên chuẩn thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      standardQueries.all(),
      StandardsAPI.updateOne,
      "Cập nhật định biên chuẩn thành công!",
      "Cập nhật định biên chuẩn thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      standardQueries.all(),
      StandardsAPI.deleteOne,
      "Xóa định biên chuẩn thành công!",
      "Xóa định biên chuẩn thất bại!",
    ),

  useEvaluate: () => {
    const { message } = useUI()
    return useMutation({
      mutationFn: (payload: EvaluateStandardPayload) =>
        StandardsAPI.evaluate(payload),
      onError: (error: any) => {
        console.error("Evaluate standard error:", error)
        message.error(
          error?.response?.data?.message || "Lỗi khi đánh giá định biên!",
        )
      },
    })
  },
}
