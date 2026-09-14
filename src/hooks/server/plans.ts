import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { PlansAPI } from "@/services/plans"
import type {
  ItemResponse,
  ListResponse,
  PlanCreatePayload,
  PlanResponse,
  PlanUpdatePayload,
} from "@/types"
import { useUI } from "@/hooks/useUI"
import { type QueryOptionsHelper, useItemQuery, useListQuery } from "./base"

export const planQueries = {
  all: () => ["plans"] as const,
  projectPlans: (projectId: number) =>
    [...planQueries.all(), projectId] as const,
  lists: (projectId: number) =>
    [...planQueries.projectPlans(projectId), "list"] as const,
  list: (projectId: number) =>
    queryOptions({
      queryKey: planQueries.lists(projectId),
      queryFn: () => PlansAPI.getAll(projectId),
      enabled: !isNaN(projectId) && projectId > 0,
    }),
  details: (projectId: number) =>
    [...planQueries.projectPlans(projectId), "detail"] as const,
  detail: (projectId: number, planId?: number) =>
    queryOptions({
      queryKey: [...planQueries.details(projectId), planId],
      queryFn: () => PlansAPI.getOne(projectId, planId!),
      enabled:
        !isNaN(projectId) &&
        projectId > 0 &&
        typeof planId === "number" &&
        planId > 0,
    }),

  useList: <TSelected = PlanResponse[]>(
    projectId: number,
    options?: QueryOptionsHelper<ListResponse<PlanResponse>, TSelected>,
  ) => useListQuery(planQueries.list(projectId), options),

  useDetail: <TSelected = PlanResponse>(
    projectId: number,
    planId?: number,
    options?: QueryOptionsHelper<ItemResponse<PlanResponse>, TSelected>,
  ) => useItemQuery(planQueries.detail(projectId, planId), options),

  useCreate: (projectId: number) => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: (data: PlanCreatePayload) =>
        PlansAPI.createOne(projectId, data),
      onSuccess: (res) => {
        message.success(res.message || "Tạo phiên bản kế hoạch thành công")
        queryClient.invalidateQueries({
          queryKey: planQueries.projectPlans(projectId),
        })
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message ||
            err.message ||
            "Lỗi khi tạo phiên bản",
        )
      },
    })
  },

  useUpdate: (projectId: number) => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: ({
        planId,
        data,
      }: {
        planId: number
        data: PlanUpdatePayload
      }) => PlansAPI.updateOne(projectId, planId, data),
      onSuccess: (res) => {
        message.success(res.message || "Cập nhật kế hoạch thành công")
        queryClient.invalidateQueries({
          queryKey: planQueries.projectPlans(projectId),
        })
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message ||
            err.message ||
            "Lỗi khi cập nhật kế hoạch",
        )
      },
    })
  },

  useDelete: (projectId: number) => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: (planId: number) => PlansAPI.deleteOne(projectId, planId),
      onSuccess: (res) => {
        message.success(res.message || "Xóa phiên bản thành công")
        queryClient.invalidateQueries({
          queryKey: planQueries.projectPlans(projectId),
        })
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message ||
            err.message ||
            "Lỗi khi xóa phiên bản",
        )
      },
    })
  },

  useActivate: (projectId: number) => {
    const queryClient = useQueryClient()
    const { message } = useUI()

    return useMutation({
      mutationFn: (planId: number) => PlansAPI.activateOne(projectId, planId),
      onSuccess: (res) => {
        message.success(res.message || "Đã kích hoạt phiên bản kế hoạch")
        queryClient.invalidateQueries({
          queryKey: planQueries.projectPlans(projectId),
        })
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message ||
            err.message ||
            "Lỗi khi kích hoạt phiên bản",
        )
      },
    })
  },
}
