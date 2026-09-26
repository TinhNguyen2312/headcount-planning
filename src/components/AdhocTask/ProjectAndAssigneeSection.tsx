/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, Form, Input, Row } from "antd"
import { useEffect } from "react"
import ProjectFilterSelect from "@/components/Common/ProjectFilterSelect"
import ProjectUserSelect from "@/components/Common/ProjectUserSelect"
import ZoneSelect from "@/components/Common/ZoneSelect"
import useAuth from "@/hooks/useAuth"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import { useSubordinateAssignment } from "@/hooks/useSubordinateAssignment"
import { useZoneAccess } from "@/hooks/useZoneAccess"
import type { CreateAdhocTaskFormValues } from "@/views/pcd/CreateAdhocTaskPage"
import type { ProjectMemberResponse, ProjectMemberRoleResponse } from "@/types"

interface ProjectAndAssigneeSectionProps {
  form?: import("antd").FormInstance<CreateAdhocTaskFormValues>
  projectId?: number
  onProjectChange: (projectId?: number) => void
  onMemberSelect: (
    userId: number,
    member?: ProjectMemberResponse,
    role?: ProjectMemberRoleResponse,
  ) => void
}

interface SelfAssigneeDisplayProps {
  value?: number
  name?: string
  [key: string]: any
}

const SelfAssigneeDisplay = ({
  name,
  value: _value,
  ...props
}: SelfAssigneeDisplayProps) => {
  return <Input value={name} readOnly {...props} />
}

export const ProjectAndAssigneeSection = ({
  form: propForm,
  projectId,
  onProjectChange,
  onMemberSelect,
}: ProjectAndAssigneeSectionProps) => {
  const contextForm = Form.useFormInstance<CreateAdhocTaskFormValues>()
  const form = propForm ?? contextForm
  const { user } = useAuth()
  const { projects: myProjects } = useProjectSelector()

  const { canAssign, isAssignableUser } = useSubordinateAssignment(projectId)
  const { canManageZone } = useZoneAccess(projectId ?? 0)
  const currentZoneId = Form.useWatch("zoneId", form)

  useEffect(() => {
    if (user?.id != null) {
      const currentAssigned = form.getFieldValue("assignedUserId")
      if (!canAssign || !currentAssigned) {
        form.setFieldValue("assignedUserId", user.id)
        onMemberSelect(user.id, undefined, undefined)
      }
    }
  }, [canAssign, user?.id, form, onMemberSelect])

  const handleProjectSelect = (pId?: number) => {
    form.setFieldValue("projectId", pId)
    form.setFieldValue("zoneId", undefined)
    form.setFieldValue("assignedUserId", null)
    onProjectChange(pId)
  }

  const handleZoneChange = () => {
    form.setFieldValue("assignedUserId", null)
  }

  const handleMemberChange = (
    userId: number,
    member?: ProjectMemberResponse,
    role?: ProjectMemberRoleResponse,
  ) => {
    form.setFieldValue("assignedUserId", userId)
    onMemberSelect(userId, member, role)
  }

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        1. Dự án & Nhân sự thực hiện
      </h2>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Dự án"
            name="projectId"
            rules={[{ required: true, message: "Vui lòng chọn dự án" }]}
          >
            <ProjectFilterSelect
              className="w-full"
              projects={myProjects}
              value={projectId}
              onChange={handleProjectSelect}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item label="Phân khu (Zone)" name="zoneId">
            <ZoneSelect
              projectId={projectId}
              disabled={!projectId}
              placeholder="Chọn phân khu"
              filterItem={(x) => canManageZone(x.id)}
              onChange={handleZoneChange}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            label="Nhân sự được giao việc"
            name="assignedUserId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nhân sự thực hiện",
              },
            ]}
          >
            {canAssign ? (
              <ProjectUserSelect
                projectId={projectId}
                zoneId={currentZoneId}
                disabled={!projectId}
                filterItem={(m) => isAssignableUser(m.userId)}
                placeholder="Tìm kiếm nhân sự..."
                onChange={(member) => {
                  if (member) {
                    const activeRole =
                      (currentZoneId != null
                        ? member.roles.find((r) =>
                            r.zones.some(
                              (z) => z.isAllZones || z.zoneId === currentZoneId,
                            ),
                          )
                        : null) ||
                      member.roles.find((r) => r.isPrimary) ||
                      member.roles[0]
                    handleMemberChange(member.userId, member, activeRole)
                  } else {
                    form.setFieldValue("assignedUserId", null)
                  }
                }}
              />
            ) : (
              <SelfAssigneeDisplay
                name={
                  user?.fullName
                    ? `${user.fullName} (Chính mình)`
                    : "Chính mình"
                }
              />
            )}
          </Form.Item>
        </Col>
      </Row>
    </div>
  )
}

export default ProjectAndAssigneeSection
