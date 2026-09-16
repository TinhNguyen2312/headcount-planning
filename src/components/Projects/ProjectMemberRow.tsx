import type { TableColumnsType } from "antd"
import dayjs from "dayjs"
import { useMemo } from "react"

import { createTextColumn } from "@/lib/tableHelpers"
import { formatRoleDepartment } from "@/lib/utils"
import type { UserProjectRoleDetailResponse, ZoneResponse } from "@/types"
import ProjectUserActionsMenu from "./ProjectUserActionsMenu"

export interface GroupedUserProjectRoleDetail
  extends UserProjectRoleDetailResponse {
  zoneNames?: string[]
}

export const groupProjectMembers = (
  members: UserProjectRoleDetailResponse[],
  zones: ZoneResponse[],
): GroupedUserProjectRoleDetail[] => {
  const map = new Map<string, GroupedUserProjectRoleDetail>()

  for (const m of members) {
    const key = `${m.userId}-${m.roleId}`
    const matchedZone = zones.find((z) => z.id === m.zoneId)
    const zoneName = matchedZone?.name || m.zoneName || matchedZone?.code

    if (!map.has(key)) {
      map.set(key, {
        ...m,
        zoneNames: zoneName ? [zoneName] : [],
      })
    } else {
      const existing = map.get(key)
      if (existing && zoneName && !existing.zoneNames?.includes(zoneName)) {
        existing.zoneNames = [...(existing.zoneNames || []), zoneName]
      }
    }
  }

  return Array.from(map.values())
}

const renderMemberZone = (
  member: GroupedUserProjectRoleDetail,
  zones: ZoneResponse[],
) => {
  if (member.projectRole === "PROJECT_ADMIN") {
    return (
      <span className="text-base font-semibold text-primary">
        Quản lý toàn dự án
      </span>
    )
  }

  const groupedZoneNames = member.zoneNames
  if (groupedZoneNames && groupedZoneNames.length > 0) {
    if (groupedZoneNames.length === 1) {
      return (
        <span className="text-base font-medium text-foreground">
          {groupedZoneNames[0]}
        </span>
      )
    }
    return (
      <div className="flex flex-wrap items-center gap-1">
        {groupedZoneNames.map((zName) => (
          <span
            key={zName}
            className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-base font-medium text-foreground"
          >
            {zName}
          </span>
        ))}
      </div>
    )
  }

  const matchedZone = zones.find((z) => z.id === member.zoneId)
  const activeZoneName =
    matchedZone?.name || member.zoneName || matchedZone?.code

  if (activeZoneName) {
    return (
      <span className="text-base font-medium text-foreground">
        {activeZoneName}
      </span>
    )
  }

  return (
    <span className="text-muted-foreground italic text-base">Chưa gán</span>
  )
}

const renderReplacementUser = (member: UserProjectRoleDetailResponse) => {
  const replacementUserId = member.replacementUserId
  const replacementUserName =
    member.replacementUserName ??
    member.replacementUserFullName ??
    (replacementUserId ? `ID: ${replacementUserId}` : null)

  const hasReplacement = Boolean(replacementUserId)

  if (hasReplacement) {
    return (
      <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-base font-semibold text-foreground">
        {replacementUserName}
      </span>
    )
  }

  return <span className="text-muted-foreground font-medium text-base">—</span>
}

const renderReplacementPeriod = (member: UserProjectRoleDetailResponse) => {
  const hasReplacement = Boolean(member.replacementUserId)

  if (hasReplacement && member.replacementFrom && member.replacementTo) {
    return (
      <span className="font-bold text-base tracking-tight text-foreground font-mono">
        {dayjs(member.replacementFrom).format("DD.MM.YYYY")} –{" "}
        {dayjs(member.replacementTo).format("DD.MM.YYYY")}
      </span>
    )
  }

  return <span className="text-muted-foreground font-medium text-base">—</span>
}

export const useProjectMemberColumns = (
  projectId: number,
  zones: ZoneResponse[],
  skipsCol: number = 0,
  canManageMember?: (userId: number) => boolean,
): TableColumnsType<GroupedUserProjectRoleDetail> => {
  return useMemo(() => {
    const cols: TableColumnsType<GroupedUserProjectRoleDetail> = [
      {
        ...createTextColumn<GroupedUserProjectRoleDetail>(
          "projectName",
          "DỰ ÁN",
          {
            sortable: true,
            searchable: true,
            width: skipsCol > 0 ? "0%" : "13.7%",
          },
        ),
        render: (projectName: string | null | undefined) => (
          <span className="text-base font-semibold text-foreground">
            {projectName || "—"}
          </span>
        ),
      },
      {
        ...createTextColumn<GroupedUserProjectRoleDetail>(
          "userFullName",
          "NHÂN SỰ PHỤ TRÁCH",
          {
            sortable: true,
            searchable: true,
            width: skipsCol > 0 ? "32.4%" : "23.5%",
          },
        ),
        render: (_, record) => (
          <div className="flex flex-col">
            <span className="font-semibold text-base text-primary">
              {record.userFullName}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatRoleDepartment(record.roleName)}
            </span>
          </div>
        ),
      },
      {
        title: "THAO TÁC",
        key: "actions",
        align: "right",
        width: skipsCol > 0 ? "16.3%" : "11.9%",
        render: (_, record) => (
          <ProjectUserActionsMenu
            projectId={projectId}
            member={record}
            canManage={canManageMember ? canManageMember(record.userId) : true}
          />
        ),
      },
    ]

    return skipsCol > 0 ? cols.slice(skipsCol) : cols
  }, [projectId, zones, skipsCol, canManageMember])
}

export default useProjectMemberColumns
