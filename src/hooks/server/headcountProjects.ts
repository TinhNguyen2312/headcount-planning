import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  type AvailableProjectItem,
  HeadcountProjectsAPI,
} from "@/services/headcountProjects"
import type {
  HeadcountProjectCreatePayload,
  HeadcountProjectQueryParams,
  HeadcountProjectResponse,
  HeadcountProjectUpdatePayload,
  ItemResponse,
  ListResponse,
} from "@/types"
import { useUI } from "@/hooks/useUI"
import { type QueryOptionsHelper, useItemQuery, useListQuery } from "./base"

export const headcountProjectQueries = {
  all: () => ["headcount-projects"] as const,
  lists: () => [...headcountProjectQueries.all(), "list"] as const,
  list: (params?: HeadcountProjectQueryParams) =>
    queryOptions({
      queryKey: [...headcountProjectQueries.lists(), params],
      queryFn: () => HeadcountProjectsAPI.getAll(params),
    }),
  details: () => [...headcountProjectQueries.all(), "detail"] as const,
  detail: (id?: number) =>
    queryOptions({
      queryKey: [...headcountProjectQueries.details(), id],
      queryFn: () => HeadcountProjectsAPI.getOne(id!),
      enabled: typeof id === "number" && id > 0,
    }),
  availableProjects: () =>
    queryOptions({
      queryKey: [...headcountProjectQueries.all(), "available-projects"],
      queryFn: () => HeadcountProjectsAPI.getAvailableProjects(),
    }),

  useList: <TSelected = HeadcountProjectResponse[]>(
    params?: HeadcountProjectQueryParams,
    options?: QueryOptionsHelper<
      ListResponse<HeadcountProjectResponse>,
      TSelected
    >,
  ) => useListQuery(headcountProjectQueries.list(params), options),

  useDetail: <TSelected = HeadcountProjectResponse>(
    id?: number,
    options?: QueryOptionsHelper<
      ItemResponse<HeadcountProjectResponse>,
      TSelected
    >,
  ) => useItemQuery(headcountProjectQueries.detail(id), options),

  useAvailableProjects: <TSelected = AvailableProjectItem[]>(
    options?: QueryOptionsHelper<ListResponse<AvailableProjectItem>, TSelected>,
  ) => useListQuery(headcountProjectQueries.availableProjects(), options),

  useCreate: () => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: (data: HeadcountProjectCreatePayload) =>
        HeadcountProjectsAPI.create(data),
      onSuccess: () => {
        message.success("Kích hoạt dự án chạy định biên thành công")
        queryClient.invalidateQueries({
          queryKey: headcountProjectQueries.all(),
        })
      },
      onError: (error: any) => {
        message.error(error.message || "Lỗi khi kích hoạt dự án định biên")
      },
    })
  },

  useUpdate: () => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: HeadcountProjectUpdatePayload
      }) => HeadcountProjectsAPI.update(id, data),
      onSuccess: () => {
        message.success("Cập nhật trạng thái dự án định biên thành công")
        queryClient.invalidateQueries({
          queryKey: headcountProjectQueries.all(),
        })
      },
      onError: (error: any) => {
        message.error(error.message || "Lỗi khi cập nhật dự án định biên")
      },
    })
  },

  useDelete: () => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: (id: number) => HeadcountProjectsAPI.delete(id),
      onSuccess: () => {
        message.success("Đã hủy dự án khỏi danh sách định biên")
        queryClient.invalidateQueries({
          queryKey: headcountProjectQueries.all(),
        })
      },
      onError: (error: any) => {
        message.error(error.message || "Lỗi khi hủy dự án định biên")
      },
    })
  },
}
