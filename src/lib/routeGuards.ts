import { redirect } from "next/navigation"
import type { ProjectRole, UserMeResponse } from "@/types"
import { isSuperAdminUser } from "@/types"

export const requireSuperAdmin = ({
  context,
}: {
  context: { user?: UserMeResponse }
}) => {
  if (!isSuperAdminUser(context.user)) {
    redirect("/projects")
  }
}

export const requireProjectRole =
  (...roles: ProjectRole[]) =>
  <TRouteParams>({
    context,
    params,
  }: {
    context: { user?: UserMeResponse }
    params?: TRouteParams
  }) => {
    const user = context.user
    if (!user) {
      redirect("/login")
    }
    if (isSuperAdminUser(user)) return

    const routeParams =
      typeof params === "object" && params !== null
        ? (params as { projectId?: unknown })
        : undefined

    if (routeParams?.projectId !== undefined && routeParams.projectId !== "") {
      const targetProjectId = Number(routeParams.projectId)
      if (Number.isNaN(targetProjectId)) {
        redirect("/projects")
      }

      const activeProjects = (user.projects ?? []).filter(
        (r) =>
          (r.projectId ?? r.id) === targetProjectId && r.status !== "ENDED",
      )
      const hasRoleInTargetProject = activeProjects.some((r) =>
        roles.includes(r.projectRole),
      )
      if (!hasRoleInTargetProject) {
        redirect("/projects")
      }
      return
    }

    const currentRole = user.currentProject?.projectRole
    if (currentRole && roles.includes(currentRole)) {
      return
    }

    const hasRoleInAnyProject = (user.projects ?? []).some(
      (r) => r.status !== "ENDED" && roles.includes(r.projectRole),
    )
    if (!hasRoleInAnyProject) {
      redirect("/projects")
    }
  }
