import { useNavigate } from "@/lib/routerAdapter"
import { Button, Card, Form, message } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { PlusSquare, Send } from "lucide-react"
import { useEffect, useState } from "react"
import {
  ProjectAndAssigneeSection,
  TaskAttachmentsSection,
  TaskDetailsSection,
  useTaskAttachments,
} from "@/components/AdhocTask"
import PageContainer from "@/components/Common/PageContainer"
import { taskInstanceQueries } from "@/hooks/server/taskInstances"
import useAuth from "@/hooks/useAuth"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import { useSubordinateAssignment } from "@/hooks/useSubordinateAssignment"
import { useZoneAccess } from "@/hooks/useZoneAccess"
import type {
  CreateAdhocTaskRequest,
  ProjectMemberResponse,
  ProjectMemberRoleResponse,
} from "@/types"

export type CreateAdhocTaskFormValues = Omit<
  CreateAdhocTaskRequest,
  "workDate" | "roleId" | "attachments" | "projectId"
> & {
  projectId?: number
  workDate: Dayjs
}

export default function CreateAdhocTaskPage() {
  const navigate = useNavigate()
  const { user, isSuperUser } = useAuth()
  const { setSelectedProjectId, selectedProjectId } = useProjectSelector()

  const { isAssignableUser } = useSubordinateAssignment(selectedProjectId)
  const { canManageZone } = useZoneAccess(selectedProjectId ?? 0)

  const [form] = Form.useForm<CreateAdhocTaskFormValues>()
  const [selectedMember, setSelectedMember] =
    useState<ProjectMemberResponse | null>(null)
  const [selectedRole, setSelectedRole] =
    useState<ProjectMemberRoleResponse | null>(null)

  const {
    attachedFiles,
    isUploading,
    handleUploadFile,
    handleRemoveAttachedFile,
  } = useTaskAttachments()

  const createAdhoc = taskInstanceQueries.useCreateAdhoc()

  useEffect(() => {
    if (selectedProjectId) {
      form.setFieldValue("projectId", selectedProjectId)
    }
  }, [selectedProjectId, form])
  const handleProjectChange = (pId?: number) => {
    setSelectedProjectId(pId)
    setSelectedMember(null)
    setSelectedRole(null)
  }

  const handleMemberSelect = (
    userId: number,
    member?: ProjectMemberResponse,
    role?: ProjectMemberRoleResponse,
  ) => {
    form.setFieldValue("assignedUserId", userId)
    if (member) {
      setSelectedMember(member)
    }
    if (role) {
      setSelectedRole(role)
    }
  }

  const handleFinish = async (values: CreateAdhocTaskFormValues) => {
    if (!selectedProjectId) {
      message.error("Vui lòng chọn dự án!")
      return
    }

    if (values.zoneId && !canManageZone(values.zoneId)) {
      message.error("Bạn không có quyền tại phân khu này!")
      return
    }

    if (!isAssignableUser(values.assignedUserId)) {
      message.error("Bạn chỉ có thể giao việc cho chính mình hoặc cấp dưới!")
      return
    }

    const roleId =
      selectedRole?.roleId || selectedMember?.roles[0]?.roleId || user?.roleId
    if (!roleId) {
      message.error("Không xác định được chức danh của nhân sự được giao việc!")
      return
    }

    try {
      await createAdhoc.mutateAsync({
        ...values,
        projectId: selectedProjectId,
        roleId,
        title: values.title.trim(),
        workDate: values.workDate.format("YYYY-MM-DD"),
        description: values.description?.trim() || null,
        attachments: attachedFiles.map((f) => f.url),
      })
      handleBack()
    } catch {}
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate({ to: isSuperUser ? "." : "/my-task" })
    }
  }

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-2">
          <PlusSquare className="size-4 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Giao việc đột xuất
          </h1>
        </div>
      }
      subtitle="Tạo công việc phát sinh đột xuất cho chính mình hoặc nhân sự cấp dưới."
      onBack={handleBack}
      rightSlot={
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            icon={<Send className="size-4" />}
            loading={createAdhoc.isPending}
            disabled={isUploading}
            onClick={() => form.submit()}
          >
            Giao việc
          </Button>
        </div>
      }
    >
      <Card className="shadow-xs border-border mt-2">
        <Form<CreateAdhocTaskFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            projectId: selectedProjectId,
            assignedUserId: user?.id,
            zoneId: undefined,
            workDate: dayjs(),
            slaHours: 4,
            approvalLevel: 1,
            title: "",
            description: "",
          }}
          className="flex flex-col gap-5"
        >
          <ProjectAndAssigneeSection
            projectId={selectedProjectId ?? 0}
            onProjectChange={handleProjectChange}
            onMemberSelect={handleMemberSelect}
          />

          <TaskDetailsSection />

          <TaskAttachmentsSection
            attachedFiles={attachedFiles}
            isUploading={isUploading}
            disabled={createAdhoc.isPending}
            onUploadFile={handleUploadFile}
            onRemoveFile={handleRemoveAttachedFile}
          />

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              onClick={handleBack}
              disabled={createAdhoc.isPending || isUploading}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<Send className="size-4" />}
              loading={createAdhoc.isPending}
              disabled={isUploading}
              onClick={() => form.submit()}
            >
              Giao việc
            </Button>
          </div>
        </Form>
      </Card>
    </PageContainer>
  )
}
