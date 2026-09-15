import UnauthorizedAccess from "@/components/Common/UnauthorizedAccess"
import useAuth from "@/hooks/useAuth"
import ProjectUsersPage from "../components/Projects/ProjectUsersTab"

export default function StaffPage() {
  const { user } = useAuth()
  const project = user?.currentProject

  if (project == null || project.id == null) {
    return <UnauthorizedAccess />
  }

  return <ProjectUsersPage projectId={project.id} />
}
