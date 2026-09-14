import type { ReactNode } from "react"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import type { ProjectRole } from "@/types"

export interface ShowForProps {
  children: ReactNode
  projectRoles?: ProjectRole[]
  fallback?: ReactNode
}

const ShowFor = ({ children, projectRoles, fallback = null }: ShowForProps) => {
  const { hasProjectRole, isSuperUser } = useProjectAuth()

  const hasAccess =
    isSuperUser ||
    (!!projectRoles &&
      projectRoles.length > 0 &&
      hasProjectRole(...projectRoles))

  if (!hasAccess) return <>{fallback}</>

  return <>{children}</>
}

export default ShowFor
