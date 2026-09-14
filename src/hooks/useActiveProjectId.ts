"use client"

import { useParams } from "next/navigation"
import { authStore } from "@/stores/authStore"

export const useActiveProjectId = (
  explicitProjectId?: number,
): number | undefined => {
  const params = useParams() as { projectId?: string }
  const fallbackProjectId = authStore(
    (s) => s.currentProject?.projectId ?? s.currentProject?.id,
  )

  if (explicitProjectId != null && !Number.isNaN(explicitProjectId)) {
    return explicitProjectId
  }

  if (params?.projectId) {
    const parsed = Number(params.projectId)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return fallbackProjectId
}

export default useActiveProjectId
