import { useNavigate } from "@/lib/routerAdapter"
import { Button, Segmented, Skeleton } from "antd"
import { Grid, List, Plus } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { DayFilterBar } from "@/components/Common/DayFilterBar"
import { CollectionView } from "@/components/Common/Management"
import NoProjectAccess from "@/components/Common/NoProjectAccess"
import ProjectFilterSelect from "@/components/Common/ProjectFilterSelect"
import { TaskInstanceCard } from "@/components/Common/TaskInstanceCard"
import UnauthorizedAccess from "@/components/Common/UnauthorizedAccess"
import { WeekNavigator } from "@/components/Common/WeekNavigator"
import { mondayOf, toISODate } from "@/components/Schedules/scheduleUtils"
import {
  extractSubordinateTree,
  findNodePath,
} from "@/components/Subordinates/orgUtils"
import {
  StageStatusTabs,
  StageStatusTabValue,
} from "@/components/Subordinates/StageStatusTabs"
import { SubordinateFilterBar } from "@/components/Subordinates/SubordinateFilterBar"
import type { SubordinatesSearch } from "@/components/Subordinates/subordinateSchemas"
import { taskInstanceQueries } from "@/hooks/server/taskInstances"
import { userQueries } from "@/hooks/server/users"
import useAuth from "@/hooks/useAuth"
import { MANAGER_PROJECT_ROLES, useProjectAuth } from "@/hooks/useProjectAuth"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import ManagementPageLayout from "@/layout/ManagementPageLayout"
import { getStoredItem, STORAGE_PREFIX, setStoredItem } from "@/lib/storage"
import type { TaskInstanceResponse } from "@/types"

const PAGE_SIZE = 20

export interface SubordinatesPageProps {
  onOpenDetail?: (task: TaskInstanceResponse) => void
  onCreateAdhoc?: () => void
  search?: SubordinatesSearch
  onSearchChange?: (updater: Partial<SubordinatesSearch>) => void
}

export default function SubordinatesPage({
  onOpenDetail,
  onCreateAdhoc,
  search,
  onSearchChange,
}: SubordinatesPageProps) {
  const { user, isSuperUser } = useAuth()
  const {
    projects,
    hasAnyProject,
    selectedProjectId: defaultProjectId,
    setSelectedProjectId,
  } = useProjectSelector(MANAGER_PROJECT_ROLES)

  const selectedProjectId = useMemo(() => {
    if (search?.projectId && projects.some((p) => p.id === search.projectId)) {
      return search.projectId
    }
    return defaultProjectId
  }, [search?.projectId, projects, defaultProjectId])

  const { hasPermission } = useProjectAuth(selectedProjectId)
  const canCreateAdhoc = hasPermission("CREATE_ADHOC_TASK")

  const handleProjectChange = useCallback(
    (newId?: number) => {
      setSelectedProjectId(newId)
      onSearchChange?.({
        projectId: newId,
        userId: undefined,
        page: 1,
      })
    },
    [setSelectedProjectId, onSearchChange],
  )

  const todayISO = useMemo(() => toISODate(new Date()), [])

  const weekStart = useMemo(() => {
    const rawWeek = search?.weekStart
    if (rawWeek && /^\d{4}-\d{2}-\d{2}$/.test(rawWeek)) {
      const parsed = new Date(`${rawWeek}T00:00:00`)
      if (!isNaN(parsed.getTime())) return mondayOf(parsed)
    }
    const rawDate = search?.date
    if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      const parsed = new Date(`${rawDate}T00:00:00`)
      if (!isNaN(parsed.getTime())) return mondayOf(parsed)
    }
    return mondayOf(new Date())
  }, [search?.weekStart, search?.date])

  const selectedDate = useMemo(() => {
    const raw = search?.date
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
    return todayISO
  }, [search?.date, todayISO])

  const stageStatus = (search?.stageStatus ?? "ALL") as StageStatusTabValue
  const page = search?.page ?? 1

  const [internalViewMode, setInternalViewMode] = useState<"grid" | "list">(
    () => {
      const saved = getStoredItem<"grid" | "list">(
        `${STORAGE_PREFIX}subordinates:view-mode`,
        "grid",
      )
      return saved === "list" ? "list" : "grid"
    },
  )
  const viewMode = search?.viewMode ?? internalViewMode

  const handleViewModeChange = useCallback(
    (mode: "grid" | "list") => {
      setInternalViewMode(mode)
      setStoredItem(`${STORAGE_PREFIX}subordinates:view-mode`, mode)
      onSearchChange?.({ viewMode: mode })
    },
    [onSearchChange],
  )

  const navigate = useNavigate()

  const handleOpenDetail = useCallback(
    (task: TaskInstanceResponse) => {
      if (onOpenDetail) {
        onOpenDetail(task)
      } else {
        navigate({
          to: "/my-task/$id/edit",
          params: { id: String(task.id) },
        })
      }
    },
    [onOpenDetail, navigate],
  )

  const { data: treeNodes = [], isLoading: isLoadingTree } =
    userQueries.useTree(
      selectedProjectId
        ? {
            projectId: selectedProjectId,
            fromUserId: isSuperUser ? undefined : user?.id,
          }
        : undefined,
    )

  const subordinateTree = useMemo(() => {
    return extractSubordinateTree(treeNodes, user?.id ?? 0, isSuperUser)
  }, [treeNodes, user?.id, isSuperUser])

  const targetUserId = search?.userId ?? (isSuperUser ? undefined : user?.id)

  const selectedPath = useMemo(() => {
    if (!search?.userId) return []
    return findNodePath(subordinateTree, search.userId).map((n) => n.id)
  }, [subordinateTree, search?.userId])

  const handleSelectPath = useCallback(
    (path: number[]) => {
      const selectedId = path.length > 0 ? path[path.length - 1] : undefined
      onSearchChange?.({
        userId: selectedId,
        page: 1,
      })
    },
    [onSearchChange],
  )

  const handleShiftWeek = useCallback(
    (deltaWeeks: number) => {
      const next = new Date(weekStart)
      next.setDate(next.getDate() + deltaWeeks * 7)
      const nextMonday = mondayOf(next)
      onSearchChange?.({
        weekStart: toISODate(nextMonday),
        date: toISODate(nextMonday),
        page: 1,
      })
    },
    [weekStart, onSearchChange],
  )

  const handleGoThisWeek = useCallback(() => {
    const thisMonday = mondayOf(new Date())
    onSearchChange?.({
      weekStart: toISODate(thisMonday),
      date: todayISO,
      page: 1,
    })
  }, [todayISO, onSearchChange])

  const handleWeekStartChange = useCallback(
    (updater: Date | ((prev: Date) => Date)) => {
      const next = typeof updater === "function" ? updater(weekStart) : updater
      const nextMonday = mondayOf(next)
      onSearchChange?.({
        weekStart: toISODate(nextMonday),
        date: toISODate(nextMonday),
        page: 1,
      })
    },
    [weekStart, onSearchChange],
  )

  const handleSelectDate = useCallback(
    (date: string) => {
      const parsed = new Date(`${date}T00:00:00`)
      const mon = !isNaN(parsed.getTime()) ? mondayOf(parsed) : weekStart
      onSearchChange?.({
        date,
        weekStart: toISODate(mon),
        page: 1,
      })
    },
    [weekStart, onSearchChange],
  )

  const handleSelectStatus = useCallback(
    (status: StageStatusTabValue) => {
      onSearchChange?.({
        stageStatus: status,
        page: 1,
      })
    },
    [onSearchChange],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      onSearchChange?.({ page: newPage })
    },
    [onSearchChange],
  )

  const isQueryEnabled = isSuperUser || (hasAnyProject && !!selectedProjectId)

  const {
    data: allTasks = [],
    meta: tasksMeta,
    isLoading: isLoadingTasks,
  } = taskInstanceQueries.useSubordinates(
    {
      projectId: selectedProjectId ?? undefined,
      userId: targetUserId,
      workDate: selectedDate,
      stageStatus: stageStatus === "ALL" ? undefined : stageStatus,
      page,
      limit: PAGE_SIZE,
    },
    { enabled: isQueryEnabled },
  )

  const baseCountFilter = useMemo(
    () => ({
      projectId: selectedProjectId ?? undefined,
      userId: targetUserId,
      workDate: selectedDate,
      limit: 1,
    }),
    [selectedProjectId, targetUserId, selectedDate],
  )

  const { meta: allCountMeta } = taskInstanceQueries.useSubordinates(
    baseCountFilter,
    { enabled: isQueryEnabled },
  )
  const { meta: todoCountMeta } = taskInstanceQueries.useSubordinates(
    { ...baseCountFilter, stageStatus: "TODO" },
    { enabled: isQueryEnabled },
  )
  const { meta: inReviewCountMeta } = taskInstanceQueries.useSubordinates(
    { ...baseCountFilter, stageStatus: "IN_REVIEW" },
    { enabled: isQueryEnabled },
  )
  const { meta: approvedCountMeta } = taskInstanceQueries.useSubordinates(
    { ...baseCountFilter, stageStatus: "APPROVED" },
    { enabled: isQueryEnabled },
  )
  const { meta: rejectedCountMeta } = taskInstanceQueries.useSubordinates(
    { ...baseCountFilter, stageStatus: "REJECTED" },
    { enabled: isQueryEnabled },
  )
  const { meta: completedCountMeta } = taskInstanceQueries.useSubordinates(
    { ...baseCountFilter, stageStatus: "COMPLETED" },
    { enabled: isQueryEnabled },
  )

  const statusCounts: Partial<Record<StageStatusTabValue, number>> = {
    ALL: allCountMeta?.totalElements,
    TODO: todoCountMeta?.totalElements,
    IN_REVIEW: inReviewCountMeta?.totalElements,
    APPROVED: approvedCountMeta?.totalElements,
    REJECTED: rejectedCountMeta?.totalElements,
    COMPLETED: completedCountMeta?.totalElements,
  }

  if (!isSuperUser && !hasAnyProject) {
    return <UnauthorizedAccess />
  }

  if (!selectedProjectId && !isSuperUser) {
    return <NoProjectAccess />
  }

  return (
    <ManagementPageLayout
      title={
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-foreground">
              Công việc cấp dưới
            </span>
          </div>
        </div>
      }
      headerActions={
        <div className="flex items-center gap-2 flex-wrap">
          <ProjectFilterSelect
            projects={projects}
            value={selectedProjectId}
            onChange={handleProjectChange}
          />

          {canCreateAdhoc && onCreateAdhoc && (
            <Button
              type="primary"
              size="middle"
              icon={<Plus className="size-4" />}
              onClick={onCreateAdhoc}
              className="font-semibold text-base"
            >
              Giao việc đột xuất
            </Button>
          )}

          <WeekNavigator
            weekStart={weekStart}
            setWeekStart={handleWeekStartChange}
            setSelectedDate={handleSelectDate}
            onShiftWeek={handleShiftWeek}
            onGoThisWeek={handleGoThisWeek}
          />
          <Segmented
            value={viewMode}
            onChange={(val) => handleViewModeChange(val as "grid" | "list")}
            options={[
              {
                value: "grid",
                icon: <Grid className="size-3.5" />,
                label: "Thẻ",
              },
              {
                value: "list",
                icon: <List className="size-3.5" />,
                label: "Danh sách",
              },
            ]}
          />
        </div>
      }
      searchBar={
        <div className="flex flex-col gap-3">
          <DayFilterBar
            weekStart={weekStart}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          <SubordinateFilterBar
            tree={subordinateTree}
            selectedPath={selectedPath}
            onSelectPath={handleSelectPath}
            isLoading={isLoadingTree}
          />

          <StageStatusTabs
            selectedStatus={stageStatus}
            onSelectStatus={handleSelectStatus}
            counts={statusCounts}
          />
        </div>
      }
    >
      {isLoadingTasks ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <CollectionView<TaskInstanceResponse>
          viewMode={viewMode}
          items={allTasks}
          renderCustomCard={(task) => (
            <TaskInstanceCard
              task={task}
              viewMode="grid"
              onOpenDetail={handleOpenDetail}
            />
          )}
          renderCustomRow={(task) => (
            <TaskInstanceCard
              task={task}
              viewMode="list"
              onOpenDetail={handleOpenDetail}
            />
          )}
          emptyDescription="Không có công việc nào"
          emptyHelperText={`Không tìm thấy công việc của cấp dưới phù hợp với bộ lọc trong ngày ${selectedDate}.`}
          pagination={
            (tasksMeta?.totalElements ?? 0) > PAGE_SIZE
              ? {
                  page,
                  total: tasksMeta?.totalElements ?? 0,
                  pageSize: PAGE_SIZE,
                  onChange: handlePageChange,
                  itemLabel: "công việc",
                }
              : undefined
          }
        />
      )}
    </ManagementPageLayout>
  )
}
