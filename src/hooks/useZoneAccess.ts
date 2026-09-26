import { useCallback, useMemo } from "react"
import { userProjectRoleQueries } from "@/hooks/server/userProjectRoles"
import { useProjectAuth } from "./useProjectAuth"

export const useZoneAccess = (projectId: number) => {
  const { user, isSuperUser, isProjectAdmin, hasProjectRole } =
    useProjectAuth(projectId)
  const userId = user?.id ?? 0

  const { data: myProjectRoles, isLoading } = userProjectRoleQueries.useList(
    { userId, projectId, status: "ACTIVE", limit: 100 },
    { enabled: Boolean(userId && projectId && !isSuperUser) },
  )
  const { hasFullProjectAccess, myZones } = useMemo(() => {
    if (isSuperUser || isProjectAdmin) {
      return { hasFullProjectAccess: true, myZones: new Set<number>() }
    }

    const hasGlobal = myProjectRoles.some(
      (r) => r.projectRole === "PROJECT_ADMIN" || r.zoneId == null,
    )
    if (hasGlobal) {
      return { hasFullProjectAccess: true, myZones: new Set<number>() }
    }

    const myZones = new Set(
      myProjectRoles.flatMap((r) => (r.zoneId != null ? [r.zoneId] : [])),
    )
    return { hasFullProjectAccess: false, myZones }
  }, [isSuperUser, isProjectAdmin, myProjectRoles])

  const canManageZone = useCallback(
    (x: number) => (hasFullProjectAccess ? true : myZones.has(x)),
    [hasFullProjectAccess, myZones],
  )

  const isZoneAdminOnly =
    !isSuperUser && !isProjectAdmin && hasProjectRole("ZONE_ADMIN")

  const hasZoneAccess = useCallback(
    (zones: { id: number }[]) => zones.some((z) => canManageZone(z.id)),
    [canManageZone],
  )

  return {
    isLoading,
    myProjectRoles,
    hasFullProjectAccess,
    assignedZoneIds: myZones,
    canManageZone,
    isZoneAdminOnly,
    hasZoneAccess,
  }
}

export default useZoneAccess
