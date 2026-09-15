"use client"

import { Button, Tabs, Upload } from "antd"
import {
  Building2,
  CalendarDays,
  SlidersHorizontal,
  UploadCloud,
  Users,
} from "lucide-react"
import { useState } from "react"

import PageContainer from "@/components/Common/PageContainer"
import { ProjectPlanManagement } from "@/components/Projects/Plan"
import ProjectEditForm from "@/components/Projects/ProjectEditForm"
import ProjectPropertiesTab from "@/components/Projects/ProjectPropertiesTab"
import ProjectUsersTab from "@/components/Projects/ProjectUsersTab"
import { projectQueries } from "@/hooks/server/projects"
import { uploadMutations } from "@/hooks/server/uploads"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"

interface ProjectEditPageProps {
  projectId: number
  onBack: () => void
}

export default function ProjectEditPage({
  projectId,
  onBack,
}: ProjectEditPageProps) {
  const { data: project } = projectQueries.useSuspenseDetail(projectId)
  const { isSuperUser } = useProjectAuth(projectId)
  const canEdit = isSuperUser
  const uploadMutation = uploadMutations.useUploadFile()
  const updateMutation = projectQueries.useUpdate()
  const { message } = useUI()
  const [activeTab, setActiveTab] = useState<string>("general")

  const handleHeaderFileUpload = async (file: File) => {
    if (!file) return
    try {
      const res = await uploadMutation.mutateAsync(file)
      const fileUrl = res.result?.fileUrl || res.result?.url
      if (fileUrl) {
        await updateMutation.mutateAsync({
          id: projectId,
          data: {
            ...project,
            thumbnail: fileUrl,
          },
        })
        message.success(
          `Đã tải lên ảnh đại diện "${file.name}" và cập nhật dự án thành công!`,
        )
      }
    } catch {}
  }

  const tabItems = [
    {
      key: "general",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Building2 className="size-4" />
          Thông tin chung
        </span>
      ),
      children: <ProjectEditForm project={project!} viewOnly={!canEdit} />,
    },
    {
      key: "properties",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <SlidersHorizontal className="size-4" />
          Quy mô & Cơ sở định biên
        </span>
      ),
      children: (
        <ProjectPropertiesTab projectId={projectId} viewOnly={!canEdit} />
      ),
    },
    {
      key: "plans",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <CalendarDays className="size-4" />
          Kế hoạch tiến độ
        </span>
      ),
      children: (
        <ProjectPlanManagement
          projectId={projectId}
          projectStartDate={project?.startDate}
          projectEndDate={project?.endDate}
          viewOnly={!canEdit}
        />
      ),
    },
    {
      key: "users",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="size-4" />
          Quản lý nhân sự
        </span>
      ),
      children: <ProjectUsersTab projectId={projectId} />,
    },
  ]

  return (
    <PageContainer
      title={`${canEdit ? "Sửa dự án : " : ""} ${project?.name || ""} `}
      onBack={canEdit ? onBack : undefined}
      rightSlot={
        canEdit ? (
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
        ) : undefined
      }
    >
      <div className="pt-1">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          className="project-edit-tabs"
        />
      </div>
    </PageContainer>
  )
}
