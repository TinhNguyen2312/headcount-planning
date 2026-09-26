import { queryOptions } from "@tanstack/react-query"
import { UserProjectRolesAPI } from "@/services/userProjectRoles"
import type {
  AssignReplacementRequest,
  ItemResponse,
  ListResponse,
  UserProjectRoleCreate,
  UserProjectRoleDetailResponse,
  UserProjectRoleUpdate,
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

export interface UserProjectRoleListParams {
  userId?: number
  projectId?: number
  zoneId?: number
  roleId?: number
  status?: string
  keyword?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: string
}

export const userProjectRoleQueries = {
  all: () => ["user-project-roles"] as const,
  lists: () => [...userProjectRoleQueries.all(), "list"] as const,
  list: (params?: UserProjectRoleListParams) =>
    queryOptions({
      queryKey: [...userProjectRoleQueries.lists(), params],
      queryFn: () => UserProjectRolesAPI.getAll(params),
    }),
  details: () => [...userProjectRoleQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...userProjectRoleQueries.details(), id],
      queryFn: () => UserProjectRolesAPI.getOne(id),
    }),
  byProject: (
    projectId: number,
    params?: Omit<UserProjectRoleListParams, "projectId">,
  ) =>
    queryOptions({
      queryKey: [
        ...userProjectRoleQueries.all(),
        "project",
        projectId,
        params,
      ] as const,
      queryFn: () =>
        UserProjectRolesAPI.getAll({
          projectId,
          status: params?.status ?? "ACTIVE",
          limit: params?.limit ?? 500,
          ...params,
        }),
    }),
  byUser: (
    userId: number,
    params?: Omit<UserProjectRoleListParams, "userId">,
  ) =>
    queryOptions({
      queryKey: [
        ...userProjectRoleQueries.all(),
        "user",
        userId,
        params,
      ] as const,
      queryFn: () =>
        UserProjectRolesAPI.getAll({
          userId,
          ...params,
        }),
    }),

  useList: <TSelected = UserProjectRoleDetailResponse[]>(
    params?: UserProjectRoleListParams,
    options?: QueryOptionsHelper<
      ListResponse<UserProjectRoleDetailResponse>,
      TSelected
    >,
  ) => useListQuery(userProjectRoleQueries.list(params), options),

  useSuspenseList: <TSelected = UserProjectRoleDetailResponse[]>(
    params?: UserProjectRoleListParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<UserProjectRoleDetailResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(userProjectRoleQueries.list(params), options),

  useDetail: <TSelected = UserProjectRoleDetailResponse>(
    id?: number,
    options?: QueryOptionsHelper<
      ItemResponse<UserProjectRoleDetailResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(userProjectRoleQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useSuspenseDetail: <TSelected = UserProjectRoleDetailResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<UserProjectRoleDetailResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(userProjectRoleQueries.detail(id), options),

  // Mutations
  useCreate: (options?: { projectId?: number }) =>
    useCreateItem(
      userProjectRoleQueries.all(),
      UserProjectRolesAPI.createOne,
      "Thêm nhân sự vào dự án thành công!",
      "Thêm nhân sự vào dự án thất bại!",
      options?.projectId
        ? [
            ["projects", options.projectId, "users"],
            ["projects", options.projectId, "members"],
          ]
        : undefined,
    ),

  useUpdate: (options?: { projectId?: number }) =>
    useUpdateItem<UserProjectRoleUpdate, unknown>(
      userProjectRoleQueries.all(),
      UserProjectRolesAPI.updateOne,
      "Cập nhật quyền thành công!",
      "Cập nhật quyền thất bại!",
      options?.projectId
        ? [
            ["projects", options.projectId, "users"],
            ["projects", options.projectId, "members"],
          ]
        : undefined,
    ),

  useDelete: (options?: { projectId?: number }) =>
    useDeleteItem(
      userProjectRoleQueries.all(),
      UserProjectRolesAPI.deleteOne,
      "Đã gỡ nhân sự khỏi dự án",
      "Gỡ nhân sự khỏi dự án thất bại!",
      options?.projectId
        ? [
            ["projects", options.projectId, "users"],
            ["projects", options.projectId, "members"],
          ]
        : undefined,
    ),

  useAssignRole: (userId: number) =>
    useCreateItem(
      userProjectRoleQueries.all(),
      (data: UserProjectRoleCreate) =>
        UserProjectRolesAPI.assignProjectRole(userId, data),
      "Gán vai trò thành công!",
      "Gán vai trò thất bại!",
      [["users", userId, "project-roles"], ["users"]],
    ),

  useAssignReplacement: (projectId?: number) =>
    useCreateItem(
      userProjectRoleQueries.all(),
      ({
        userProjectRoleId,
        data,
      }: {
        userProjectRoleId: number
        data: AssignReplacementRequest
      }) => UserProjectRolesAPI.assignReplacement(userProjectRoleId, data),
      "Gán nhân sự thay thế thành công!",
      "Gán nhân sự thay thế thất bại!",
      projectId
        ? [
            ["projects", projectId, "users"],
            ["projects", projectId, "members"],
          ]
        : [["users"]],
    ),

  useCancelReplacement: (projectId?: number) =>
    useCreateItem(
      userProjectRoleQueries.all(),
      (userProjectRoleId: number) =>
        UserProjectRolesAPI.cancelReplacement(userProjectRoleId),
      "Hủy nhân sự thay thế thành công!",
      "Hủy nhân sự thay thế thất bại!",
      projectId
        ? [
            ["projects", projectId, "users"],
            ["projects", projectId, "members"],
          ]
        : [["users"]],
    ),
}

/** Alias for convenience */
export const userProjectQueries = userProjectRoleQueries
export const UserProjectRoleQueries = userProjectRoleQueries
export const UserProjectQueries = userProjectRoleQueries
