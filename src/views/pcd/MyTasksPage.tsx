import { Badge, Segmented, Skeleton } from "antd"
import { useCallback, useMemo, useState } from "react"
import { DayFilterBar } from "@/components/Common/DayFilterBar"
import { CollectionView } from "@/components/Common/Management"
import NoProjectAccess from "@/components/Common/NoProjectAccess"
import ProjectFilterSelect from "@/components/Common/ProjectFilterSelect"
import UnauthorizedAccess from "@/components/Common/UnauthorizedAccess"
import { WeekNavigator } from "@/components/Common/WeekNavigator"
import { TaskInstanceCard } from "@/components/MyTask/TaskInstanceCard"
import { mondayOf, toISODate } from "@/components/Schedules/scheduleUtils"
import { taskInstanceQueries } from "@/hooks/server/taskInstances"
import useAuth from "@/hooks/useAuth"
import { MANAGER_PROJECT_ROLES } from "@/hooks/useProjectAuth"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import ManagementPageLayout from "@/layout/ManagementPageLayout"
import type {
  TaskInstanceCategory,
  TaskInstanceResponse,
  TaskInstanceStageStatus,
} from "@/types"

const PAGE_SIZE = 20

import type { MyTasksSearch } from "@/components/MyTask/myTaskSchemas"

export type MyTasksScopeTab = "my-tasks" | "approvals"

export interface MyTasksPageProps {
  onOpenDetail: (task: TaskInstanceResponse) => void
  onApproval?: () => void
  search?: MyTasksSearch
  onSearchChange?: (updater: Partial<MyTasksSearch>) => void
  activeTab?: MyTasksScopeTab
  onChangeTab?: (tab: MyTasksScopeTab) => void
}

export default function MyTasksPage({
  onOpenDetail,
  search,
  onSearchChange,
  activeTab,
  onChangeTab,
}: MyTasksPageProps) {
  const { user, isSuperUser } = useAuth()

  const hasManagerRole = useMemo(() => {
    if (isSuperUser) return true
    return (
      user?.projects?.some((p) =>
        MANAGER_PROJECT_ROLES.includes(p.projectRole),
      ) ?? false
    )
  }, [user?.projects, isSuperUser])

  const [internalTab, setInternalTab] = useState<MyTasksScopeTab>("my-tasks")
  const currentTab: MyTasksScopeTab = hasManagerRole
    ? ((search?.tab ?? activeTab ?? internalTab) as MyTasksScopeTab)
    : "my-tasks"
  const isApprovalsTab = currentTab === "approvals"

  const {
    projects,
    selectedProjectId: defaultProjectId,
    setSelectedProjectId,
  } = useProjectSelector(isApprovalsTab ? MANAGER_PROJECT_ROLES : undefined)

  const selectedProjectId = useMemo(() => {
    if (search?.projectId && projects.some((p) => p.id === search.projectId)) {
      return search.projectId
    }
    return defaultProjectId
  }, [search?.projectId, projects, defaultProjectId])

  const handleProjectChange = useCallback(
    (newId?: number) => {
      setSelectedProjectId(newId)
      onSearchChange?.({ projectId: newId, page: 1 })
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

  const category = (search?.category ?? "all") as TaskInstanceCategory | "all"
  const stageStatus = (search?.stageStatus ?? "all") as
    | TaskInstanceStageStatus
    | "all"
  const page = search?.page ?? 1

  const [internalViewMode, setInternalViewMode] = useState<"grid" | "list">(
    "grid",
  )
  const viewMode = search?.viewMode ?? internalViewMode

  const handleViewModeChange = useCallback(
    (mode: "grid" | "list") => {
      setInternalViewMode(mode)
      onSearchChange?.({ viewMode: mode })
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

  const handleTabChange = useCallback(
    (tab: MyTasksScopeTab) => {
      if (onSearchChange) {
        onSearchChange({ tab, page: 1 })
      } else if (onChangeTab) {
        onChangeTab(tab)
      } else {
        setInternalTab(tab)
      }
    },
    [onSearchChange, onChangeTab],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      onSearchChange?.({ page: newPage })
    },
    [onSearchChange],
  )

  const { meta: pendingBadgeMeta } = taskInstanceQueries.usePendingApprovals(
    { limit: 1 },
    { enabled: hasManagerRole },
  )
  const pendingBadgeCount = pendingBadgeMeta?.totalElements ?? 0

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      projectId: selectedProjectId,
      workDate: selectedDate,
      category: category === "all" ? undefined : category,
      stageStatus: stageStatus === "all" ? undefined : stageStatus,
    }),
    [page, selectedProjectId, selectedDate, category, stageStatus],
  )

  const {
    data: rawTasks,
    isLoading,
    meta,
  } = isApprovalsTab
    ? taskInstanceQueries.usePendingApprovals(queryParams, {
        enabled: isApprovalsTab && hasManagerRole,
      })
    : taskInstanceQueries.useMyTasks(queryParams, {
        enabled: !isApprovalsTab,
      })

  const tasks: TaskInstanceResponse[] = useMemo(
    () =>
      rawTasks ? [...rawTasks].sort((a, b) => a.orderIndex - b.orderIndex) : [],
    [rawTasks],
  )

  if (isSuperUser) {
    return <UnauthorizedAccess />
  }

  const userProjects = user?.projects ?? []
  if (userProjects.length === 0) {
    return <NoProjectAccess />
  }

  const emptyDescription = isApprovalsTab
    ? "Không có công việc nào chờ duyệt"
    : "Không có thẻ công việc nào"

  const emptyHelperText =
    category !== "all" || stageStatus !== "all"
      ? "Thử thay đổi các bộ lọc đang áp dụng."
      : isApprovalsTab
        ? `Không có công việc nào chờ duyệt trong ngày đã chọn (${selectedDate}).`
        : `Không có công việc nào trong ngày đã chọn (${selectedDate}).`

  const pageTitle = (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xl font-bold tracking-tight text-foreground">
        Thẻ công việc
      </span>
    </div>
  )

  return (
    <ManagementPageLayout
      title={pageTitle}
      headerActions={
        <div className="flex items-center gap-2 flex-wrap">
          <ProjectFilterSelect
            projects={projects}
            value={selectedProjectId}
            onChange={handleProjectChange}
            allowAll
          />
          <WeekNavigator
            weekStart={weekStart}
            setWeekStart={handleWeekStartChange}
            setSelectedDate={handleSelectDate}
            onShiftWeek={handleShiftWeek}
            onGoThisWeek={handleGoThisWeek}
          />
        </div>
      }
      searchBar={
        <div className="flex flex-col gap-3">
          <DayFilterBar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            weekStart={weekStart}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center justify-start gap-3 flex-wrap">
              <Segmented
                value={isApprovalsTab ? "NEEDAPPROVAL" : category}
                onChange={(val) => {
                  if (val === "NEEDAPPROVAL") {
                    onSearchChange?.({
                      tab: "approvals",
                      category: "all",
                      page: 1,
                    })
                    handleTabChange("approvals")
                  } else {
                    onSearchChange?.({
                      tab: "my-tasks",
                      category: val as TaskInstanceCategory | "all",
                      page: 1,
                    })
                    handleTabChange("my-tasks")
                  }
                }}
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Hàng ngày", value: "DAILY" },
                  { label: "Phát sinh", value: "ADHOC" },
                  ...(hasManagerRole
                    ? [
                        {
                          label: (
                            <span className="flex items-center gap-1.5">
                              <span>Chờ duyệt</span>
                              {pendingBadgeCount > 0 && (
                                <Badge
                                  count={pendingBadgeCount}
                                  size="small"
                                  overflowCount={99}
                                />
                              )}
                            </span>
                          ),
                          value: "NEEDAPPROVAL",
                        },
                      ]
                    : []),
                ]}
              />
              <Segmented
                value={stageStatus}
                onChange={(val) => {
                  onSearchChange?.({
                    stageStatus: val as TaskInstanceStageStatus | "all",
                    page: 1,
                  })
                }}
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Chờ thực hiện", value: "TODO" },
                  { label: "Đang chờ duyệt", value: "IN_REVIEW" },
                  { label: "Đã duyệt", value: "APPROVED" },
                  { label: "Bị từ chối", value: "REJECTED" },
                  { label: "Hoàn thành", value: "COMPLETED" },
                ]}
              />
            </div>
            <Segmented
              value={viewMode}
              onChange={(v) => handleViewModeChange(v as "grid" | "list")}
              options={[
                {
                  label: "Lưới",
                  value: "grid",
                },
                {
                  label: "Danh sách",
                  value: "list",
                },
              ]}
            />
          </div>
        </div>
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <CollectionView<TaskInstanceResponse>
          viewMode={viewMode}
          items={tasks}
          renderCustomCard={(task) => (
            <TaskInstanceCard
              task={task}
              viewMode="grid"
              onPress={() => onOpenDetail(task)}
            />
          )}
          renderCustomRow={(task) => (
            <TaskInstanceCard
              task={task}
              viewMode="list"
              onPress={() => onOpenDetail(task)}
            />
          )}
          emptyDescription={emptyDescription}
          emptyHelperText={emptyHelperText}
          pagination={
            (meta?.totalElements ?? 0) > PAGE_SIZE
              ? {
                  page,
                  total: meta?.totalElements ?? 0,
                  pageSize: PAGE_SIZE,
                  onChange: handlePageChange,
                  itemLabel: isApprovalsTab
                    ? "công việc chờ duyệt"
                    : "công việc",
                }
              : undefined
          }
        />
      )}
    </ManagementPageLayout>
  )
}
