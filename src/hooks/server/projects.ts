import { queryOptions } from "@tanstack/react-query"
import { ProjectsAPI, ZonesAPI } from "@/services/projects"
import { UserProjectRolesAPI } from "@/services/users"
import type {
  IQueryProjects,
  ItemResponse,
  ListResponse,
  ProjectResponse,
  ProjectRole,
  UserProjectRoleDetailResponse,
  UserProjectRoleResponse,
  UserProjectRoleUpdate,
} from "@/types"
import {
  type AllPagesConfig,
  fetchAllPages,
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

export interface AddProjectUserData {
  userId: number
  roleId: number
  zoneId?: number | null
  projectRole: ProjectRole
  effectiveFrom: string
  effectiveTo?: string | null
  isPrimary?: boolean
  status?: UserProjectRoleResponse["status"] | null
}

export const projectQueries = {
  all: () => ["projects"] as const,
  lists: () => [...projectQueries.all(), "list"] as const,
  list: (params?: IQueryProjects) =>
    queryOptions({
      queryKey: [...projectQueries.lists(), params],
      queryFn: () => ProjectsAPI.getAll(params),
    }),
  allList: (params?: IQueryProjects, config?: AllPagesConfig) =>
    queryOptions({
      queryKey: [...projectQueries.lists(), "all-pages", params, config],
      queryFn: () => fetchAllPages(ProjectsAPI.getAll, params, config),
    }),
  details: () => [...projectQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...projectQueries.details(), id],
      queryFn: () => ProjectsAPI.getOne(id),
    }),
  users: (
    projectId: number,
    params?: {
      status?: string
      limit?: number
      page?: number
      keyword?: string
      zoneId?: number
      roleId?: number
    },
  ) =>
    queryOptions({
      queryKey: [...projectQueries.all(), projectId, "users", params] as const,
      queryFn: () =>
        UserProjectRolesAPI.getAll({
          projectId,
          status: params?.status ?? "ACTIVE",
          limit: params?.limit ?? 500,
          ...params,
        }),
    }),

  useSuspenseList: <TSelected = ProjectResponse[]>(
    params?: IQueryProjects,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<ProjectResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(projectQueries.list(params), options),
  useSuspenseDetail: <TSelected = ProjectResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<ProjectResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(projectQueries.detail(id), options),
  useSuspenseUsers: <TSelected = UserProjectRoleDetailResponse[]>(
    projectId: number,
    params?: {
      status?: string
      limit?: number
      page?: number
      keyword?: string
      zoneId?: number
      roleId?: number
    },
    options?: SuspenseQueryOptionsHelper<
      ListResponse<UserProjectRoleDetailResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(projectQueries.users(projectId, params), options),

  useList: <TSelected = ProjectResponse[]>(
    params?: IQueryProjects,
    options?: QueryOptionsHelper<ListResponse<ProjectResponse>, TSelected>,
  ) => useListQuery(projectQueries.list(params), options),
  useAllList: <TSelected = ProjectResponse[]>(
    params?: IQueryProjects,
    options?: QueryOptionsHelper<ListResponse<ProjectResponse>, TSelected>,
    config?: AllPagesConfig,
  ) => useListQuery(projectQueries.allList(params, config), options),
  useDetail: <TSelected = ProjectResponse>(
    id?: number,
    options?: QueryOptionsHelper<ItemResponse<ProjectResponse>, TSelected>,
  ) =>
    useItemQuery(projectQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useUsers: <TSelected = UserProjectRoleDetailResponse[]>(
    projectId?: number,
    params?: {
      status?: string
      limit?: number
      page?: number
      keyword?: string
      zoneId?: number
      roleId?: number
    },
    options?: QueryOptionsHelper<
      ListResponse<UserProjectRoleDetailResponse>,
      TSelected
    >,
  ) =>
    useListQuery(projectQueries.users(projectId!, params), {
      enabled: !!projectId && options?.enabled !== false,
      ...options,
    }),

  useCreate: () =>
    useCreateItem(
      projectQueries.all(),
      ProjectsAPI.createOne,
      "Tạo dự án thành công!",
      "Tạo dự án thất bại!",
    ),
  useUpdate: () =>
    useUpdateItem(
      projectQueries.all(),
      ProjectsAPI.updateOne,
      "Cập nhật dự án thành công!",
      "Cập nhật dự án thất bại!",
    ),
  useDelete: () =>
    useDeleteItem(
      projectQueries.all(),
      ProjectsAPI.deleteOne,
      "Xóa dự án thành công!",
      "Xóa dự án thất bại!",
    ),

  useAddUser: (projectId: number) =>
    useCreateItem(
      projectQueries.users(projectId).queryKey,
      (data: AddProjectUserData) =>
        UserProjectRolesAPI.createOne({
          ...data,
          projectId,
        }),
      "Thêm nhân sự vào dự án thành công!",
      "Thêm nhân sự vào dự án thất bại!",
    ),
  useUpdateUserRole: (projectId: number) =>
    useUpdateItem<UserProjectRoleUpdate, unknown>(
      projectQueries.users(projectId).queryKey,
      UserProjectRolesAPI.updateOne,
      "Cập nhật quyền thành công!",
      "Cập nhật quyền thất bại!",
    ),
  useRemoveUser: (projectId: number) =>
    useDeleteItem(
      projectQueries.users(projectId).queryKey,
      UserProjectRolesAPI.deleteOne,
      "Đã gỡ nhân sự khỏi dự án",
      "Gỡ nhân sự khỏi dự án thất bại!",
    ),
}

export const zoneQueries = {
  all: () => ["zones"] as const,
  lists: () => [...zoneQueries.all(), "list"] as const,
  list: (params?: {
    keyword?: string
    projectId?: number
    page?: number
    limit?: number
    sortBy?: string
    order?: string
  }) =>
    queryOptions({
      queryKey: [...zoneQueries.lists(), params],
      queryFn: () => ZonesAPI.getAll(params),
    }),
  details: () => [...zoneQueries.all(), "detail"] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...zoneQueries.details(), id],
      queryFn: () => ZonesAPI.getOne(id),
    }),
  useList: (
    params?: {
      keyword?: string
      projectId?: number
      page?: number
      limit?: number
      sortBy?: string
      order?: string
    },
    options?: { enabled?: boolean },
  ) => useListQuery(zoneQueries.list(params), options),
  useDetail: (id?: number, options?: { enabled?: boolean }) =>
    useItemQuery(zoneQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),
}

export interface UserProjectRoleListParams {
  userId?: number
  projectId?: number
  zoneId?: number
  status?: string
  keyword?: string
  page?: number
  limit?: number
  roleId?: number
}

export const userProjectRoleQueries = {
  all: () => ["user-project-roles"] as const,
  lists: () => [...userProjectRoleQueries.all(), "list"] as const,
  list: (params?: UserProjectRoleListParams) =>
    queryOptions({
      queryKey: [...userProjectRoleQueries.lists(), params],
      queryFn: () => UserProjectRolesAPI.getAll(params),
    }),
  useList: (
    params?: UserProjectRoleListParams,
    options?: { enabled?: boolean },
  ) => useListQuery(userProjectRoleQueries.list(params), options),
}
