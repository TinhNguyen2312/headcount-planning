import type { TableColumnsType } from "antd"
import { Tag } from "antd"
import { useMemo } from "react"
import { AvatarNameCell, CodeBadge, StatusDotBadge } from "@/components/Common"
import { createStatusColumn, createTextColumn } from "@/lib/tableHelpers"
import { getInitials } from "@/lib/utils"
import type { UserWithProjectsResponse } from "@/types"
import { UserActionsMenu } from "./UserActionsMenu"

export type UserTableData = UserWithProjectsResponse & {
  isCurrentUser: boolean
}

export const getUserColumns = (
  data: UserTableData[] = [],
): TableColumnsType<UserTableData> => {
  const projectMap = new Map<string, string>()
  const roleSet = new Set<string>()

  for (const user of data) {
    if (user.projects) {
      for (const p of user.projects) {
        if (p.name) {
          projectMap.set(p.name, p.name)
        }
      }
    }
    if (user.roleName) {
      roleSet.add(user.roleName)
    }
  }

  const projectFilters = Array.from(projectMap.keys()).map((name) => ({
    text: name,
    value: name,
  }))

  const roleFilters = Array.from(roleSet).map((role) => ({
    text: role,
    value: role,
  }))

  return [
    {
      title: "Dự án",
      key: "projects",
      width: "12%",
      filters: projectFilters.length > 0 ? projectFilters : undefined,
      filterSearch: true,
      onFilter: (value, record) =>
        record.projects?.some((p) => p.name === value) ?? false,
      render: (_, record) => {
        const projects = record.projects || []
        if (projects.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        const uniqueProjects = Array.from(
          new Map(projects.map((p) => [p.id, p])).values(),
        )
        return (
          <div className="flex flex-wrap gap-1">
            {uniqueProjects.map((p) => (
              <Tag
                color="green"
                key={p.id}
                className="text-base font-normal m-0"
              >
                {p.name}
              </Tag>
            ))}
          </div>
        )
      },
    },
    {
      ...createTextColumn<UserTableData>("fullName", "Họ tên", {
        searchable: true,
      }),
      render: (fullName: string | null | undefined, record) =>
        fullName ? (
          <AvatarNameCell name={fullName} isSelf={record.isCurrentUser} />
        ) : (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      title: "Mã NV",
      dataIndex: "perNumber",
      key: "perNumber",
      width: "8%",
      render: (perNumber: string | null | undefined) =>
        perNumber ? (
          <CodeBadge code={perNumber} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      title: "Chức danh",
      dataIndex: "roleName",
      key: "roleName",
      width: "14%",
      filters: roleFilters.length > 0 ? roleFilters : undefined,
      filterSearch: true,
      onFilter: (value, record) => record.roleName === value,
      render: (roleName: string | null | undefined) => (
        <span
          className="text-muted-foreground truncate block"
          title={roleName || undefined}
        >
          {roleName || "—"}
        </span>
      ),
    },
    {
      ...createTextColumn<UserTableData>("managerName", "Quản lý trực tiếp", {
        searchable: true,
        width: "13%",
      }),
      render: (managerName: string | null | undefined) => {
        if (!managerName) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
              {getInitials(managerName)}
            </div>
            <span
              className="truncate font-medium text-foreground"
              title={managerName}
            >
              {managerName}
            </span>
          </div>
        )
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: "10%",
      render: (phone: string | null | undefined) => (
        <span
          className="text-muted-foreground truncate block"
          title={phone || undefined}
        >
          {phone || "N/A"}
        </span>
      ),
    },
    {
      ...createTextColumn<UserTableData>("email", "Email", {
        searchable: true,
        width: "13%",
      }),
      render: (email: string | null | undefined) => (
        <span
          className="text-muted-foreground truncate block"
          title={email || undefined}
        >
          {email || "N/A"}
        </span>
      ),
    },
    createStatusColumn<UserTableData, UserWithProjectsResponse["status"]>(
      "status",
      "Trạng thái",
      {
        ACTIVE: {
          label: "Đang hoạt động",
          render: () => (
            <StatusDotBadge tone="active" label="Đang hoạt động" pulse />
          ),
        },
        INACTIVE: {
          label: "Ngưng hoạt động",
          render: () => <StatusDotBadge tone="muted" label="Ngưng hoạt động" />,
        },
        LOCKED: {
          label: "Đã khóa",
          render: () => <StatusDotBadge tone="error" label="Đã khóa" />,
        },
      },
      { width: "10%" },
    ),
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      width: "6%",
      render: (_, record) => (
        <div className="flex justify-end">
          <UserActionsMenu user={record} />
        </div>
      ),
    },
  ]
}

// Hook to generate memoized user columns based on current table data
export const useUserColumns = (
  data: UserTableData[] = [],
): TableColumnsType<UserTableData> => {
  return useMemo(() => getUserColumns(data), [data])
}

// Default columns export for compatibility
export const columns: TableColumnsType<UserTableData> = getUserColumns([])
