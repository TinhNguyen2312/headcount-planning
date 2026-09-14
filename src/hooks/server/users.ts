import { queryOptions } from "@tanstack/react-query"
import { userProjectRoleQueries } from "@/hooks/server/projects"
import { UserProjectRolesAPI, UsersAPI } from "@/services/users"
import type {
  AssignReplacementRequest,
  GetUserTreeParams,
  IQueryUsers,
  ItemResponse,
  ListResponse,
  UserProjectRoleCreate,
  UserResponse,
  UserTreeNodeResponse,
  UserWithProjectsResponse,
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

export const userQueries = {
  all: () => ["users"] as const,
  lists: () => [...userQueries.all(), "list"] as const,
  list: (params?: IQueryUsers) =>
    queryOptions({
      queryKey: [...userQueries.lists(), params],
      queryFn: () => UsersAPI.getAll(params),
    }),
  details: () => [...userQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => UsersAPI.getOne(id),
    }),
  tree: (params?: GetUserTreeParams) =>
    queryOptions({
      queryKey: [...userQueries.all(), "tree", params] as const,
      queryFn: () => UsersAPI.getTree(params),
    }),
  projectRoles: (userId: number) =>
    queryOptions({
      queryKey: [...userQueries.all(), userId, "project-roles"] as const,
      queryFn: () => UsersAPI.getProjectRoles(userId),
    }),

  useSuspenseList: <TSelected = UserWithProjectsResponse[]>(
    params?: IQueryUsers,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<UserWithProjectsResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(userQueries.list(params), options),
  useSuspenseDetail: <TSelected = UserResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<ItemResponse<UserResponse>, TSelected>,
  ) => useSuspenseItemQuery(userQueries.detail(id), options),
  useSuspenseTree: <TSelected = UserTreeNodeResponse[]>(
    params?: GetUserTreeParams,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<UserTreeNodeResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(userQueries.tree(params), options),
  useList: <TSelected = UserWithProjectsResponse[]>(
    params?: IQueryUsers,
    options?: QueryOptionsHelper<
      ListResponse<UserWithProjectsResponse>,
      TSelected
    >,
  ) => useListQuery(userQueries.list(params), options),
  useDetail: <TSelected = UserResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<UserResponse>, TSelected>,
  ) =>
    useItemQuery(userQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),
  useTree: <TSelected = UserTreeNodeResponse[]>(
    params?: GetUserTreeParams,
    options?: QueryOptionsHelper<ListResponse<UserTreeNodeResponse>, TSelected>,
  ) => useListQuery(userQueries.tree(params), options),

  useCreate: () =>
    useCreateItem(
      userQueries.all(),
      UsersAPI.createOne,
      "Tạo nhân sự thành công!",
      "Tạo nhân sự thất bại!",
    ),
  useUpdate: () =>
    useUpdateItem(
      userQueries.all(),
      UsersAPI.updateOne,
      "Cập nhật nhân sự thành công!",
      "Cập nhật nhân sự thất bại!",
    ),
  useDelete: () =>
    useDeleteItem(
      userQueries.all(),
      UsersAPI.deleteOne,
      "Xóa nhân sự thành công!",
      "Xóa nhân sự thất bại!",
    ),
  useUpdateStatus: () =>
    useUpdateItem(
      userQueries.all(),
      UsersAPI.updateStatus,
      "Cập nhật trạng thái thành công!",
      "Cập nhật trạng thái thất bại!",
    ),
  useAssignProjectRole: (userId: number) =>
    useCreateItem(
      userQueries.projectRoles(userId).queryKey,
      (data: UserProjectRoleCreate) => UsersAPI.assignProjectRole(userId, data),
      "Gán vai trò thành công!",
      "Gán vai trò thất bại!",
      [userProjectRoleQueries.all()],
    ),
  useUpdateProjectRole: () =>
    useUpdateItem(
      userQueries.all(),
      UserProjectRolesAPI.updateOne,
      "Cập nhật vai trò thành công!",
      "Cập nhật vai trò thất bại!",
      [userProjectRoleQueries.all()],
    ),
  useDeleteProjectRole: () =>
    useDeleteItem(
      userQueries.all(),
      UserProjectRolesAPI.deleteOne,
      "Xóa vai trò thành công!",
      "Xóa vai trò thất bại!",
      [userProjectRoleQueries.all()],
    ),
  useAssignReplacement: (projectId?: number) =>
    useCreateItem(
      projectId ? ["projects", projectId, "users"] : userQueries.all(),
      ({
        userProjectRoleId,
        data,
      }: {
        userProjectRoleId: number
        data: AssignReplacementRequest
      }) => UsersAPI.assignReplacement(userProjectRoleId, data),
      "Gán nhân sự thay thế thành công!",
      "Gán nhân sự thay thế thất bại!",
    ),
  useCancelReplacement: (projectId?: number) =>
    useCreateItem(
      projectId ? ["projects", projectId, "users"] : userQueries.all(),
      (userProjectRoleId: number) =>
        UsersAPI.cancelReplacement(userProjectRoleId),
      "Hủy nhân sự thay thế thành công!",
      "Hủy nhân sự thay thế thất bại!",
    ),
  useResetPassword: () =>
    useCreateItem(
      userQueries.all(),
      ({ id, data }: { id: number; data: { newPassword: string } }) =>
        UsersAPI.resetPassword(id, data),
      "Đặt lại mật khẩu thành công!",
      "Đặt lại mật khẩu thất bại!",
    ),
  useImportUsers: () =>
    useCreateItem(
      userQueries.all(),
      (file: File) => UsersAPI.importUsers(file),
      "Import danh sách nhân sự thành công!",
      "Import thất bại!",
    ),
}
