import { Briefcase, Pencil, UserCheck, UserMinus, UserX } from "lucide-react"
import { useState } from "react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import { projectQueries } from "@/hooks/server/projects"
import { userQueries } from "@/hooks/server/users"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import type { UserProjectRoleDetailResponse } from "@/types"
import AssignConcurrentRoleModal from "./AssignConcurrentRoleModal"
import AssignReplacementModal from "./AssignReplacementModal"
import EditProjectMember from "./EditProjectMember"

interface ProjectUserActionsMenuProps {
  projectId: number
  member: UserProjectRoleDetailResponse
  canManage?: boolean
}

const ProjectUserActionsMenu = ({
  projectId,
  member,
  canManage = true,
}: ProjectUserActionsMenuProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [replacementOpen, setReplacementOpen] = useState(false)
  const [concurrentRoleOpen, setConcurrentRoleOpen] = useState(false)
  const { isProjectAdmin, isSuperUser } = useProjectAuth(projectId)
  const removeMutation = projectQueries.useRemoveUser(projectId)
  const cancelReplacementMutation = userQueries.useCancelReplacement(projectId)

  const items: ActionMenuItem<UserProjectRoleDetailResponse>[] = [
    {
      key: "edit",
      label: "Sửa phân công khu vực",
      icon: <Pencil className="size-4" />,
      hidden: !canManage,
      onClick: () => setEditOpen(true),
    },
    {
      key: "assign-replacement",
      label: (m) =>
        m.replacementUserId ? "Đổi nhân sự thay thế" : "Gán nhân sự thay thế",
      icon: <UserCheck className="size-4 text-emerald-600" />,
      hidden: !canManage,
      onClick: () => setReplacementOpen(true),
    },
    {
      key: "concurrent-role",
      label: "Kiêm nhiệm chức danh",
      icon: <Briefcase className="size-4" />,
      hidden: !canManage,
      onClick: () => setConcurrentRoleOpen(true),
    },
    {
      key: "cancel-replacement",
      label: "Hủy nhân sự thay thế",
      icon: <UserX className="size-4 text-amber-600" />,
      hidden: (m) => !canManage || !m.replacementUserId,
      confirm: (m) => ({
        title: "Hủy nhân sự thay thế",
        content: `Bạn có chắc chắn muốn hủy nhân sự thay thế "${m.replacementUserName}" cho "${m.userFullName}"?`,
        okText: "Hủy thay thế",
        okType: "danger",
      }),
      onClick: (m) => {
        cancelReplacementMutation.mutate(m.id)
      },
    },
    {
      type: "divider",
    },
    {
      key: "remove",
      label: "Gỡ khỏi dự án",
      icon: <UserMinus className="size-4" />,
      danger: true,
      hidden: !canManage || (!isSuperUser && !isProjectAdmin),
      confirm: (m) => ({
        title: "Gỡ nhân sự khỏi dự án",
        content: `Bạn có chắc chắn muốn gỡ nhân sự "${m.userFullName}" khỏi dự án này?`,
        okText: "Gỡ",
        okType: "danger",
      }),
      onClick: (m) => {
        removeMutation.mutate(m.id)
      },
    },
  ]

  return (
    <>
      <ActionMenu record={member} items={items} />
      <EditProjectMember
        projectId={projectId}
        member={member}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
      />
      <AssignReplacementModal
        projectId={projectId}
        projectName={member.projectName}
        member={member}
        open={replacementOpen}
        onCancel={() => setReplacementOpen(false)}
      />
      <AssignConcurrentRoleModal
        projectId={projectId}
        member={member}
        open={concurrentRoleOpen}
        onCancel={() => setConcurrentRoleOpen(false)}
      />
    </>
  )
}

export default ProjectUserActionsMenu
