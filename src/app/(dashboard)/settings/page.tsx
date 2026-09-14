"use client"

import { Tabs } from "antd"
import PageContainer from "@/components/Common/PageContainer"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import ProjectRoleSettings from "@/components/UserSettings/ProjectRoleSettings"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

export default function SettingsPage() {
  const { user: currentUser } = useAuth()

  if (!currentUser) {
    return null
  }

  const showProjectRoleTab =
    (currentUser.projects?.length ?? 0) > 0 &&
    currentUser.systemRole !== "SUPER_ADMIN"

  const tabsConfig = [
    {
      key: "my-profile",
      label: "Thông tin cá nhân",
      component: UserInformation,
    },
    { key: "password", label: "Mật khẩu", component: ChangePassword },
    ...(showProjectRoleTab
      ? [
          {
            key: "project-role",
            label: "Dự án & Quyền",
            component: ProjectRoleSettings,
          },
        ]
      : []),
  ]

  return (
    <PageContainer title="Cài đặt tài khoản">
      <Tabs
        defaultActiveKey="my-profile"
        items={tabsConfig.map((tab) => ({
          key: tab.key,
          label: tab.label,
          children: <tab.component />,
        }))}
      />
    </PageContainer>
  )
}
