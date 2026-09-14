"use client"

import { Button, Flex, Tabs, Upload } from "antd"
import { FileText, SlidersHorizontal, UploadCloud, Users } from "lucide-react"

import PageContainer from "@/components/Common/PageContainer"
import ProtectedButton from "@/components/Common/ProtectedButton"
import ProjectEditForm from "@/components/Projects/ProjectEditForm"
import ProjectPropertiesTab from "@/components/Projects/ProjectPropertiesTab"
import { projectQueries } from "@/hooks/server/projects"
import { uploadMutations } from "@/hooks/server/uploads"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"

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
  const uploadMutation = uploadMutations.useUploadFile()
  const updateMutation = projectQueries.useUpdate()
  const { message } = useUI()

  const handleHeaderFileUpload = async (file: File) => {
    if (!file) return
    try {
      const res = await uploadMutation.mutateAsync(file)
      const fileUrl = res.result?.fileUrl || res.result?.url
      if (fileUrl) {
        await updateMutation.mutateAsync({
          id: projectId,
          data: {
            name: project.name,
            address: project.address,
            generalInfo: project.generalInfo,
            region: project.region,
            sector: project.sector,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            thumbnail: fileUrl,
            accProjectId: project.accProjectId,
          },
        })
        message.success(
          `Đã tải lên ảnh đại diện "${file.name}" và cập nhật dự án thành công!`,
        )
      }
    } catch {}
  }

  return (
    <PageContainer
      title={`${canEdit ? "Sửa dự án : " : ""} ${project?.name || ""} `}
      onBack={canEdit ? onBack : undefined}
      rightSlot={
        <>
          {canEdit && (
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(file) => {
                handleHeaderFileUpload(file as File)
                return false
              }}
              disabled={uploadMutation.isPending || updateMutation.isPending}
            >
              <Button
                icon={<UploadCloud className="size-4" />}
                loading={uploadMutation.isPending || updateMutation.isPending}
              >
                Tải ảnh đại diện
              </Button>
            </Upload>
          )}
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
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: (
              <span className="flex items-center gap-1.5">
                <FileText className="size-4" />
                Thông tin chung
              </span>
            ),
            children: (
              <Flex className="pt-2">
                <ProjectEditForm project={project!} viewOnly={!canEdit} />
              </Flex>
            ),
          },
          {
            key: "properties",
            label: (
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="size-4" />
                Quy mô & Cơ sở định biên
              </span>
            ),
            children: (
              <div className="pt-2">
                <ProjectPropertiesTab
                  projectId={projectId}
                  viewOnly={!canEdit}
                />
              </div>
            ),
          },
        ]}
      />
    </PageContainer>
  )
}
