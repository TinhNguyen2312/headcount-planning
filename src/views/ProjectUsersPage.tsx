"use client"

import { Tabs } from "antd"
import { GitFork, Inbox, Users } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/components/Common/DataTable"
import PageContainer from "@/components/Common/PageContainer"
import ShowFor from "@/components/Common/ShowFor"
import AddProjectUser from "@/components/Projects/AddProjectUser"
import {
  type GroupedUserProjectRoleDetail,
  groupProjectMembers,
  useProjectMemberColumns,
} from "@/components/Projects/ProjectMemberRow"
import UserTree from "@/components/Users/UserTree"
import { projectQueries } from "@/hooks/server/projects"
import { useProjectAuth } from "@/hooks/useProjectAuth"

interface ProjectUsersPageProps {
  projectId: number
  onBack?: () => void
}

export default function ProjectUsersPage({
  projectId,
  onBack,
}: ProjectUsersPageProps) {
  const [activeTab, setActiveTab] = useState("list")
  const [selectedZoneId] = useState<number | undefined>(undefined)

  const { data: project } = projectQueries.useSuspenseDetail(projectId)
  const { data: members = [] } = projectQueries.useSuspenseUsers(projectId)
  const { user, isSuperUser, isProjectAdmin, hasProjectRole } =
    useProjectAuth(projectId)
  const visibleZones: any[] = []

  const scopedMembers = useMemo(
    () => members.filter((m) => m.userId !== user?.id),
    [members, user?.id],
  )

  const canManageMember = useCallback(
    (_userId: number) =>
      isSuperUser || isProjectAdmin || hasProjectRole("ZONE_ADMIN"),
    [isSuperUser, isProjectAdmin, hasProjectRole],
  )

  const filteredMembers = useMemo(() => {
    if (!selectedZoneId) return groupProjectMembers(scopedMembers, visibleZones)
    return scopedMembers.filter((m) => m.zoneId === selectedZoneId)
  }, [scopedMembers, selectedZoneId, visibleZones])

  const columns = useProjectMemberColumns(
    projectId,
    visibleZones,
    0,
    canManageMember,
  )

  const tabItems = [
    {
      key: "list",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="size-4" />
          Danh sách nhân sự
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 pt-2">
          <DataTable<GroupedUserProjectRoleDetail>
            columns={columns}
            dataSource={filteredMembers}
            totalItemLabel="nhân sự"
            locale={{
              emptyText: (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Inbox className="size-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    {selectedZoneId
                      ? "Không có nhân sự nào được phân công trong khu vực này"
                      : "Chưa có nhân sự nào được gán vào dự án này"}
                  </p>
                </div>
              ),
            }}
          />
        </div>
      ),
    },
    {
      key: "hierarchy",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <GitFork className="size-4" />
          Sơ đồ phân cấp
        </span>
      ),
      children: (
        <div className="pt-2">
          <UserTree initialProjectId={projectId} disableProjectSelect />
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title={`Quản lý nhân sự ${project ? ` - ${project.name}` : ""}`}
      onBack={onBack}
      rightSlot={
        <ShowFor projectRoles={["PROJECT_ADMIN"]}>
          <AddProjectUser
            projectId={projectId}
            excludeUserIds={members.map((member) => member.userId)}
          />
        </ShowFor>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="w-full"
      />
    </PageContainer>
  )
}
