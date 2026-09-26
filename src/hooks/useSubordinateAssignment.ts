import { useCallback, useMemo } from "react"
import { userQueries } from "@/hooks/server/users"
import { flattenTree } from "@/lib/tree"
import { UserResponse } from "@/types"
import useAuth from "./useAuth"
import { useProjectAuth } from "./useProjectAuth"

export const useSubordinateAssignment = (projectId?: number) => {
  const { user, isSuperUser } = useAuth()
  const { isInspector } = useProjectAuth(projectId)
  const userId = user?.id ?? 0

  const { data: userTree = [], isLoading } = userQueries.useTree(
    {
      projectId: projectId,
      status: "ACTIVE",
      fromUserId: !isSuperUser ? userId : undefined,
    },
    {
      enabled: Boolean(userId),
    },
  )

  const subordinateUserIds = useMemo(() => {
    if (!userId) return new Set<number>()
    const flatUsers = flattenTree<UserResponse>(userTree)
    return new Set<number>(flatUsers.map((s) => s.id))
  }, [userTree, userId])

  const canAssign = isSuperUser || isInspector

  const isAssignableUser = useCallback(
    (x: number) => {
      if (!x) return false

      if (x === userId || isSuperUser || subordinateUserIds.has(x)) {
        return true
      }

      return false
    },
    [userId, isSuperUser, subordinateUserIds],
  )
  return {
    isLoading,
    userTree,
    subordinateUserIds,
    canAssign,
    isAssignableUser,
  }
}

export default useSubordinateAssignment
