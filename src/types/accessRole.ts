export type AccessRoleScope = "GLOBAL" | "PROJECT"

export interface PermissionResponse {
  id: number
  key: string
  label: string
  groupName: string
  scope: AccessRoleScope
  description: string | null
}

export interface AccessRoleResponse {
  id: number
  name: string
  scope: AccessRoleScope
  isSystem: boolean
  description: string | null
  parentId: number | null
  parentName?: string | null
  createdAt: string
  updatedAt: string
  permissionsCount?: number
  permissionIds?: number[]
  permissions?: PermissionResponse[]
}

export interface AccessRoleQueryParams {
  scope?: AccessRoleScope
  keyword?: string
  parentId?: number
  page?: number
  limit?: number
  order?: "asc" | "desc"
}

export interface CreateAccessRolePayload {
  name: string
  scope: AccessRoleScope
  description?: string
  parentId?: number | null
  permissionIds: number[]
}

export interface UpdateAccessRolePayload {
  name?: string
  scope?: AccessRoleScope
  description?: string | null
  parentId?: number | null
  permissionIds?: number[]
}

export interface UserAccessRoleResponse {
  id: number
  name: string
  scope: AccessRoleScope
  isSystem: boolean
  description: string | null
  grantedAt?: string
}
