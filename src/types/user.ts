import type { AppRole, ProjectRole, SystemRole, UserStatus } from "./auth"
import type { IBaseQuery } from "./common"

export interface ProjectSummary {
  id: number
  name: string
  roleId: number
  roleName: string
  projectRole: ProjectRole
  status: string
  projectId?: number
  projectName?: string
}

export interface UserResponse {
  id: number
  fullName: string
  phone: string | null
  email: string | null
  status: UserStatus
  systemRole?: SystemRole
  roleId?: number | null
  roleName?: string | null
  perNumber: string | null
  novatorStatus: number | null
  departmentCode: string | null
  divisionCode: string | null
  managerPerNumber: string | null
  managerName?: string | null
  provider?: string
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface UserMeResponse extends UserResponse {
  projects: ProjectSummary[]
  currentProject: ProjectSummary | null
  role: AppRole | null
}

export interface UserWithProjectsResponse extends UserResponse {
  projects: ProjectSummary[]
}

export interface UserTreeNodeResponse extends UserWithProjectsResponse {
  children: UserTreeNodeResponse[]
}

export interface GetUserTreeParams {
  projectId?: number
  zoneId?: number
  status?: string
  fromUserId?: number
}

export interface UsersResponse {
  data: UserWithProjectsResponse[]
  result?: UserWithProjectsResponse[]
  count?: number
  total?: number
}

export interface UserCreate {
  fullName: string
  email: string
  phone?: string | null
  role?: SystemRole
  password: string
  roleId?: number | null
  perNumber?: string | null
  departmentCode?: string | null
  divisionCode?: string | null
  managerPerNumber?: string | null
}

export type CreateLocalUserRequest = UserCreate

export interface UserUpdate {
  fullName?: string
  phone?: string | null
  email?: string | null
  roleId?: number | null
  perNumber?: string | null
  novatorStatus?: number | null
  departmentCode?: string | null
  divisionCode?: string | null
  managerPerNumber?: string | null
  status?: UserStatus
}

export interface UserStatusUpdate {
  status: UserStatus
}

export interface IQueryUsers extends IBaseQuery {
  fullName?: string
  keyword?: string
  status?: UserStatus
  role?: SystemRole
  provider?: string
  departmentId?: number
  projectId?: number
  zoneId?: number
}
