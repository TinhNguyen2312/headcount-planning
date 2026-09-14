"use client"

import { Flex } from "antd"
import { Users } from "lucide-react"

import PageContainer from "@/components/Common/PageContainer"
import ProtectedButton from "@/components/Common/ProtectedButton"
import ProjectEditForm from "@/components/Projects/ProjectEditForm"
import { projectQueries } from "@/hooks/server/projects"
import { useProjectAuth } from "@/hooks/useProjectAuth"

interface ProjectEditPageProps {
  projectId: number
  onBack: () => void
  onNavigateUsers: () => void
}

export default function ProjectEditPage({
  projectId,
  onBack,
  onNavigateUsers,
}: ProjectEditPageProps) {
  const { data: project } = projectQueries.useSuspenseDetail(projectId)
  const { isSuperUser } = useProjectAuth(projectId)
  const canEdit = isSuperUser

  return (
    <PageContainer
      title={`${canEdit ? "Sửa dự án : " : ""} ${project?.name || ""} `}
      onBack={canEdit ? onBack : undefined}
      rightSlot={
        <>
          <ProtectedButton
            projectRoles={[]}
            onClick={onNavigateUsers}
            icon={<Users className="size-4" />}
          >
            Quản lý nhân sự
          </ProtectedButton>
        </>
      }
    >
      <Flex>
        <ProjectEditForm project={project!} viewOnly={!canEdit} />
      </Flex>
    </PageContainer>
  )
}
