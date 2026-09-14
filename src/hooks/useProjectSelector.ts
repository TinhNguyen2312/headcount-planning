import { useMemo, useState } from "react"
import { projectQueries } from "@/hooks/server/projects"
import type { ProjectResponse, ProjectRole } from "@/types"
import useAuth from "./useAuth"

export type ProjectFilterOption = Pick<ProjectResponse, "id" | "name">

export const useProjectSelector = (currentRole?: ProjectRole[]) => {
  const { user, isSuperUser } = useAuth()
  const { data: allProjectsData = [] } = projectQueries.useAllList(
    {},
    {
      enabled: isSuperUser,
    },
  )

  const projects = useMemo<ProjectFilterOption[]>(() => {
    if (isSuperUser) {
      return allProjectsData.map((p) => ({ id: p.id, name: p.name }))
    }
    const seen = new Set<number>()
    const rows =
      user?.projects?.filter((r) => {
        if (currentRole && !currentRole.includes(r.projectRole)) return false
        if (r.id == null || seen.has(r.id)) return false
        seen.add(r.id)
        return true
      }) ?? []

    return rows.map((r) => ({ id: r.id, name: r.name }))
  }, [user?.projects, currentRole, isSuperUser, allProjectsData])

  const [selectedId, setSelectedId] = useState<number>()

  const candidateId = selectedId ?? user?.currentProject?.id
  const selectedProjectId = projects.some((p) => p.id === candidateId)
    ? candidateId
    : projects[0]?.id

  return {
    projects,
    hasAnyProject: projects.length > 0,
    selectedProjectId,
    setSelectedProjectId: setSelectedId,
  }
}
