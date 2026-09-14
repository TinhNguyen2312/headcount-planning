"use client"

import { Segmented, Skeleton } from "antd"
import { GitFork, LayoutGrid, Users } from "lucide-react"
import { useMemo, useState } from "react"

import InfiniteSelect from "@/components/Common/InfiniteSelect"
import { projectQueries } from "@/hooks/server/projects"
import { roleQueries } from "@/hooks/server/roles"
import { userQueries } from "@/hooks/server/users"
import type { ProjectResponse } from "@/types"
import ManagerTreeView from "./ManagerTreeView"
import { collectAllNodeIds, filterLockedUsers } from "./managerOrgChart"
import RoleTreeView from "./RoleTreeView"

interface UserTreeProps {
  initialProjectId?: number
  initialZoneId?: number | null
  disableProjectSelect?: boolean
  disableZoneSelect?: boolean
}

type ViewMode = "roles" | "manager"

const UserTree = ({
  initialProjectId,
  initialZoneId,
  disableProjectSelect = Boolean(initialProjectId),
}: UserTreeProps = {}) => {
  const [projectId, setProjectId] = useState<number | undefined>(
    initialProjectId,
  )
  const [zoneId, setZoneId] = useState<number | undefined>(
    initialZoneId ?? undefined,
  )
  const [viewMode, setViewMode] = useState<ViewMode>("roles")

  const { data: trees = [], isLoading: isLoadingTree } = userQueries.useTree(
    {
      projectId,
      zoneId,
    },
    {
      select: (res) => filterLockedUsers(res?.result || []),
    },
  )

  const { items: rolesData = [], isLoading: isLoadingRoles } =
    roleQueries.useList()

  const { items: projectsList = [] } = projectQueries.useList({ limit: 100 })

  const projectOptions = useMemo(() => {
    if (!projectId) return undefined
    const p = projectsList.find((item) => item.id === projectId)
    return p ? [{ value: p.id, label: p.name }] : undefined
  }, [projectId, projectsList])

  const handleProjectChange = (val: number | undefined) => {
    setProjectId(val)
    setZoneId(undefined)
  }

  const totalUsersCount = useMemo(() => {
    if (!trees) return 0
    return collectAllNodeIds(trees).length
  }, [trees])

  if (isLoadingTree || isLoadingRoles) {
    return <Skeleton active paragraph={{ rows: 10 }} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {!disableProjectSelect && (
            <InfiniteSelect<ProjectResponse, number>
              disabled={disableProjectSelect}
              placeholder="Lọc theo dự án..."
              allowClear
              value={projectId}
              options={projectOptions}
              onChange={handleProjectChange}
              className="w-56! h-9 text-base"
              useList={projectQueries.useList}
              fieldNames={{ value: "id", label: "name" }}
            />
          )}

          <div className="text-base text-muted-foreground ml-2 flex items-center gap-1 font-medium">
            <Users className="size-3.5" />
            <span>
              Tổng số:{" "}
              <strong className="text-foreground">{totalUsersCount}</strong>{" "}
              nhân sự
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as ViewMode)}
            classNames={{ label: "flex items-center" }}
            options={[
              {
                value: "roles",
                label: (
                  <p className="flex items-center gap-1 text-base font-medium px-1">
                    <LayoutGrid className="size-3.5" />
                    Sơ đồ Chức danh
                  </p>
                ),
              },
              {
                value: "manager",
                label: (
                  <p className="flex items-center gap-1 text-base font-medium px-1">
                    <GitFork className="size-3.5" />
                    Sơ đồ QLTT
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>

      {!trees || trees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center border rounded-lg bg-background">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Users className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-base">
              Chưa có dữ liệu phân cấp
            </h3>
            <p className="text-muted-foreground text-base max-w-sm">
              Không tìm thấy nhân sự phù hợp với điều kiện lọc hoặc chưa có cấu
              hình mã người quản lý trực tiếp (QLTT).
            </p>
          </div>
        </div>
      ) : viewMode === "roles" ? (
        <RoleTreeView
          trees={trees}
          roles={rolesData}
          projects={projectsList}
          selectedProjectId={projectId}
        />
      ) : (
        <ManagerTreeView trees={trees} />
      )}
    </div>
  )
}

export default UserTree
