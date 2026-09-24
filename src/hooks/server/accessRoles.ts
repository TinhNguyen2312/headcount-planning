import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"
import {
  AccessRoleQueryParams,
  AccessRolesAPI,
} from "@/services/accessRoles"
import type {
  AccessRoleResponse,
  CreateAccessRolePayload,
  ItemResponse,
  ListResponse,
  PermissionResponse,
  UpdateAccessRolePayload,
  UserAccessRoleResponse,
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

export const accessRoleQueries = {
  all: () => ["accessRoles"] as const,
  lists: () => [...accessRoleQueries.all(), "list"] as const,
  list: (params?: AccessRoleQueryParams) =>
    queryOptions({
      queryKey: [...accessRoleQueries.lists(), params],
      queryFn: () => AccessRolesAPI.getAll(params),
    }),
  details: () => [...accessRoleQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...accessRoleQueries.details(), id],
      queryFn: () => AccessRolesAPI.getOne(id),
    }),
  permissions: (params?: { scope?: string; groupName?: string }) =>
    queryOptions({
      queryKey: [...accessRoleQueries.all(), "permissions", params] as const,
      queryFn: () => AccessRolesAPI.getPermissions(params),
    }),
  userAccessRoles: (userId: number) =>
    queryOptions({
      queryKey: [...accessRoleQueries.all(), "user", userId] as const,
      queryFn: () => AccessRolesAPI.getUserAccessRoles(userId),
    }),

  useSuspenseList: <TSelected = AccessRoleResponse[]>(
    params?: AccessRoleQueryParams,
    options?: SuspenseQueryOptionsHelper<ListResponse<AccessRoleResponse>, TSelected>,
  ) => useSuspenseListQuery(accessRoleQueries.list(params), options),

  useSuspenseDetail: <TSelected = AccessRoleResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<ItemResponse<AccessRoleResponse>, TSelected>,
  ) => useSuspenseItemQuery(accessRoleQueries.detail(id), options),

  useList: <TSelected = AccessRoleResponse[]>(
    params?: AccessRoleQueryParams,
    options?: QueryOptionsHelper<ListResponse<AccessRoleResponse>, TSelected>,
  ) => useListQuery(accessRoleQueries.list(params), options),

  useDetail: <TSelected = AccessRoleResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<AccessRoleResponse>, TSelected>,
  ) =>
    useItemQuery(accessRoleQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  usePermissions: <TSelected = PermissionResponse[]>(
    params?: { scope?: string; groupName?: string },
    options?: QueryOptionsHelper<ListResponse<PermissionResponse>, TSelected>,
  ) => useListQuery(accessRoleQueries.permissions(params), options),

  useUserAccessRoles: <TSelected = UserAccessRoleResponse[]>(
    userId?: number,
    options?: QueryOptionsHelper<ListResponse<UserAccessRoleResponse>, TSelected>,
  ) =>
    useListQuery(accessRoleQueries.userAccessRoles(userId!), {
      enabled: !!userId && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      accessRoleQueries.all(),
      (data: CreateAccessRolePayload) => AccessRolesAPI.createOne(data),
      "Tạo vai trò truy cập thành công!",
      "Tạo vai trò truy cập thất bại!",
    ),

  useUpdate: () =>
    useUpdateItem(
      accessRoleQueries.all(),
      AccessRolesAPI.updateOne,
      "Cập nhật vai trò truy cập thành công!",
      "Cập nhật vai trò truy cập thất bại!",
    ),

  useDelete: () =>
    useDeleteItem(
      accessRoleQueries.all(),
      AccessRolesAPI.deleteOne,
      "Xóa vai trò truy cập thành công!",
      "Xóa vai trò truy cập thất bại!",
    ),

  useUpdateUserRoles: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        userId,
        accessRoleIds,
      }: {
        userId: number
        accessRoleIds: number[]
      }) => AccessRolesAPI.updateUserAccessRoles(userId, accessRoleIds),
      onSuccess: (_, { userId }) => {
        message.success("Cập nhật vai trò người dùng thành công!")
        queryClient.invalidateQueries({
          queryKey: [...accessRoleQueries.all(), "user", userId],
        })
        queryClient.invalidateQueries({ queryKey: ["users"] })
      },
      onError: (err: any) => {
        message.error(err?.message || "Cập nhật vai trò người dùng thất bại!")
      },
    })
  },
}
