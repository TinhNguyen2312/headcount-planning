import { useCallback, useMemo } from "react"
import type { Permission, ProjectRole } from "@/types"
import { hasPermission as checkPermission } from "@/types"
import { useActiveProjectId } from "./useActiveProjectId"
import useAuth from "./useAuth"

export const hasAnyProjectRole = (
  role: ProjectRole | null | undefined,
  ...roles: ProjectRole[]
): boolean => !!role && roles.includes(role)

export const MANAGER_PROJECT_ROLES: ProjectRole[] = [
  "PROJECT_ADMIN",
  "ZONE_ADMIN",
  "TASK_INSPECTOR",
]

export const useProjectAuth = (projectId?: number) => {
  const pid = useActiveProjectId(projectId)
  const { user, isSuperUser } = useAuth()

  const projects = useMemo(
    () => (user?.projects ?? []).filter((r) => r.id === pid),
    [user?.projects, pid],
  )

  const projectRole: ProjectRole | null = projects[0]?.projectRole ?? null

  const hasProjectRole = useCallback(
    (...roles: ProjectRole[]) =>
      isSuperUser || projects.some((r) => roles.includes(r.projectRole)),
    [isSuperUser, projects],
  )

  const hasPermission = useCallback(
    (permission: Permission) =>
      checkPermission(isSuperUser ? "SUPER_ADMIN" : projectRole, permission),
    [isSuperUser, projectRole],
  )

  const isProjectAdmin = hasProjectRole("PROJECT_ADMIN")
  const isInspector = hasProjectRole(
    "PROJECT_ADMIN",
    "ZONE_ADMIN",
    "TASK_INSPECTOR",
  )
  const isExecutor = hasProjectRole("TASK_EXECUTOR")

  const canEditSchedule =
    isSuperUser ||
    hasProjectRole("PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR")

  const canViewPersonalSchedule =
    isSuperUser ||
    hasProjectRole("PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR")

  const canManagePersonalSchedule =
    isSuperUser || hasProjectRole("TASK_INSPECTOR")

  return {
    projectId: pid,
    user,
    isSuperUser,
    projectRole,
    isProjectAdmin,
    isInspector,
    isExecutor,
    canEditSchedule,
    canViewPersonalSchedule,
    canManagePersonalSchedule,
    hasProjectRole,
    hasPermission,
  }
}

export default useProjectAuth
