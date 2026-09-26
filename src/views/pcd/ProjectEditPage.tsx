import { Button, Tabs, Upload } from "antd"
import { Building2, MapPin, UploadCloud } from "lucide-react"

import PageContainer from "@/components/Common/PageContainer"
import ProtectedButton from "@/components/Common/ProtectedButton"
import ProjectEditForm from "@/components/Projects/ProjectEditForm"
import { projectQueries } from "@/hooks/server/projects"
import { uploadMutations } from "@/hooks/server/uploads"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"
import { useState } from "react"

interface ProjectEditPageProps {
  projectId: number
  onBack: () => void
  onNavigatePCD: () => void
  onNavigateBoundary: () => void
}

export default function ProjectEditPage({
  projectId,
  onBack,
  onNavigatePCD,
  onNavigateBoundary,
}: ProjectEditPageProps) {
  const { data: project } = projectQueries.useSuspenseDetail(projectId)
  const { isSuperUser } = useProjectAuth(projectId)
  const canEdit = isSuperUser
  const uploadMutation = uploadMutations.useUploadFile()
  const updateMutation = projectQueries.useUpdate()
  const [activeTab, setActiveTab] = useState<string>("general")
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
    // {
    //   key: "properties",
    //   label: (
    //     <span className="flex items-center gap-1.5 font-medium">
    //       <SlidersHorizontal className="size-4" />
    //       Quy mô & Cơ sở định biên
    //     </span>
    //   ),
    //   children: (
    //     <ProjectPropertiesTab projectId={projectId} viewOnly={!canEdit} />
    //   ),
    // },
    // {
    //   key: "plans",
    //   label: (
    //     <span className="flex items-center gap-1.5 font-medium">
    //       <CalendarDays className="size-4" />
    //       Kế hoạch tiến độ
    //     </span>
    //   ),
    //   children: (
    //     <ProjectPlanManagement
    //       projectId={projectId}
    //       projectStartDate={project?.startDate}
    //       projectEndDate={project?.endDate}
    //       viewOnly={!canEdit}
    //     />
    //   ),
    // },
    // {
    //   key: "users",
    //   label: (
    //     <span className="flex items-center gap-1.5 font-medium">
    //       <Users className="size-4" />
    //       Quản lý nhân sự
    //     </span>
    //   ),
    //   children: <ProjectUsersPage projectId={projectId} />,
    // },
  ]

  return (
    <PageContainer
      title={
        canEdit ? `Sửa dự án: ${project?.name || ""}` : project?.name || ""
      }
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
          {/* {canEditSchedule && (
            <ProtectedButton
              projectRoles={[]}
              onClick={onNavigateSchedules}
              icon={<CalendarClock className="size-4" />}
            >
              Lịch làm việc
            </ProtectedButton>
          )} */}
          <ProtectedButton
            projectRoles={[]}
            onClick={onNavigatePCD}
            // icon={< className="size-4" />}
          >
            PCD
          </ProtectedButton>
          <Button
            onClick={onNavigateBoundary}
            icon={<MapPin className="size-4" />}
          >
            Định vị dự án
          </Button>
        </>
      }
    >
      <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          className="project-edit-tabs"
        />
        {/* <ProjectEditForm project={project!} viewOnly={!canEdit} /> */}
    </PageContainer>
  )
}
