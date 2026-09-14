import { Form } from "antd"
import dayjs from "dayjs"
import { useMemo, useState } from "react"

import InfiniteSelect from "@/components/Common/InfiniteSelect"
import { projectQueries } from "@/hooks/server/projects"
import { userQueries } from "@/hooks/server/users"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"
import type { ProjectResponse, UserWithProjectsResponse } from "@/types"

interface ProjectAdminSelectProps {
  projectId: number
  disabled?: boolean
  project?: ProjectResponse
}

interface AdminSelectOption {
  value: number
  label: string
  roleId?: number
}

const ProjectAdminSelect = ({
  projectId,
  disabled,
  project,
}: ProjectAdminSelectProps) => {
  const { isSuperUser } = useProjectAuth(projectId)
  const { data: projectUsers } = projectQueries.useUsers(projectId)
  const addAdmin = projectQueries.useAddUser(projectId)
  const removeAdmin = projectQueries.useRemoveUser(projectId)
  const { message } = useUI()
  const [isSaving, setIsSaving] = useState(false)

  const admins = useMemo(
    () =>
      projectUsers.filter(
        (u) => u.status === "ACTIVE" && u.projectRole === "PROJECT_ADMIN",
      ),
    [projectUsers],
  )

  const selectedAdminOptions: AdminSelectOption[] = useMemo(
    () =>
      admins.map((a) => ({
        value: a.userId,
        label: a.roleName
          ? `${a.userFullName} (${a.roleName})`
          : a.userFullName || a.userName || "Quản lý dự án",
        roleId: a.roleId,
      })),
    [admins],
  )

  const handleAdminsChange = async (selected: AdminSelectOption[]) => {
    if (selected.length === 0) {
      message.warning("Dự án phải có ít nhất 1 Quản lý dự án")
      return
    }

    const newIds = selected.map((s) => Number(s.value))
    const currentIds = admins.map((a) => a.userId)

    const toAdd = selected.filter((s) => !currentIds.includes(Number(s.value)))
    const toRemove = admins.filter((a) => !newIds.includes(a.userId))

    if (toAdd.length === 0 && toRemove.length === 0) return

    setIsSaving(true)
    try {
      await Promise.all([
        ...toAdd.map((item) => {
          const roleId = item.roleId || admins[0]?.roleId
          if (!roleId) {
            throw new Error("Nhân sự chưa có chức danh hợp lệ")
          }
          return addAdmin.mutateAsync({
            userId: Number(item.value),
            roleId,
            zoneId: null,
            projectRole: "PROJECT_ADMIN",
            effectiveFrom: project?.startDate ?? dayjs().format("YYYY-MM-DD"),
            effectiveTo: project?.endDate ?? null,
          })
        }),
        ...toRemove.map((admin) => removeAdmin.mutateAsync(admin.id)),
      ])
    } catch {
      message.error("Cập nhật Quản lý dự án thất bại!")
    } finally {
      setIsSaving(false)
    }
  }

  const isReadOnly = disabled || !isSuperUser

  return (
    <Form.Item label="Quản lý Xây dựng, An toàn và Môi trường" className="mb-0">
      <InfiniteSelect<UserWithProjectsResponse, AdminSelectOption[]>
        mode="multiple"
        labelInValue
        className="w-full"
        placeholder={
          isReadOnly
            ? "Chưa có Quản lý dự án"
            : "Chọn 1 hoặc nhiều Quản lý dự án..."
        }
        value={selectedAdminOptions}
        onChange={handleAdminsChange}
        loading={isSaving}
        disabled={isReadOnly || isSaving}
        useList={userQueries.useList}
        options={selectedAdminOptions}
        extraParams={{ status: "ACTIVE" }}
        transformItem={(u) => ({
          value: u.id,
          label: u.roleName ? `${u.fullName} (${u.roleName})` : u.fullName,
          roleId: u.roleId,
          ...u,
        })}
      />
    </Form.Item>
  )
}

export default ProjectAdminSelect
