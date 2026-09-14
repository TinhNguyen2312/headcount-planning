import { Lock, Pencil, Unlock } from "lucide-react"
import { useState } from "react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import { userQueries } from "@/hooks/server/users"
import useAuth from "@/hooks/useAuth"
import type { UserResponse } from "@/types"
import UserModal from "./UserModal"

interface UserActionsMenuProps {
  user: UserResponse
}

export const UserActionsMenu = ({ user }: UserActionsMenuProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const { user: currentUser } = useAuth()
  const statusMutation = userQueries.useUpdateStatus()

  const isLocked = user.status === "LOCKED"

  const items: ActionMenuItem<UserResponse>[] = [
    {
      key: "edit",
      label: "Sửa nhân sự",
      icon: <Pencil className="size-4" />,
      systemRoles: ["SUPER_ADMIN"],
      hidden: (u) => u.id === currentUser?.id,
      onClick: () => setEditOpen(true),
    },
    {
      type: "divider",
      hidden: (u) => u.id === currentUser?.id,
    },
    {
      key: "toggle-status",
      label: (u) =>
        u.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản",
      icon: (u) =>
        u.status === "LOCKED" ? (
          <Unlock className="size-4" />
        ) : (
          <Lock className="size-4" />
        ),
      danger: (u) => u.status !== "LOCKED",
      systemRoles: ["SUPER_ADMIN"],
      hidden: (u) => u.id === currentUser?.id,
      confirm: (u) => ({
        title: u.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản",
        content: `Bạn có chắc chắn muốn ${u.status === "LOCKED" ? "mở khóa" : "khóa"} tài khoản "${u.fullName}"?`,
        okText: u.status === "LOCKED" ? "Mở khóa" : "Khóa",
        okType: u.status === "LOCKED" ? "primary" : "danger",
      }),
      onClick: (u) => {
        statusMutation.mutate({
          id: u.id,
          data: { status: isLocked ? "ACTIVE" : "LOCKED" },
        })
      },
    },
  ]

  return (
    <>
      <ActionMenu record={user} items={items} />
      {editOpen && (
        <UserModal
          user={user}
          open={editOpen}
          onCancel={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
