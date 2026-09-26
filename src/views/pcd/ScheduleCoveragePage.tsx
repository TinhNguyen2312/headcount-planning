import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "@/lib/routerAdapter"
import NoProjectAccess from "@/components/Common/NoProjectAccess"
import PageHeader from "@/components/Common/PageHeader"
import ProjectFilterSelect from "@/components/Common/ProjectFilterSelect"
import UnauthorizedAccess from "@/components/Common/UnauthorizedAccess"
import UnsavedChangesModal from "@/components/Common/UnsavedChangesModal"
import { useWeekCursor } from "@/components/Schedules/hooks"
import ScheduleCoverageBody from "@/components/Schedules/ScheduleCoverageBody"
import ScheduleWeekControls from "@/components/Schedules/ScheduleWeekControls"
import {
  confirmIfDirty,
  getScheduleSignature,
  mondayOf,
  toISODate,
} from "@/components/Schedules/scheduleUtils"
import { projectQueries } from "@/hooks/server/projects"
import { scheduleQueries } from "@/hooks/server/schedules"
import { MANAGER_PROJECT_ROLES, useProjectAuth } from "@/hooks/useProjectAuth"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import { useUI } from "@/hooks/useUI"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { useZoneAccess } from "@/hooks/useZoneAccess"
import type { ScheduleItemRequest, ScheduleMatrixResponse } from "@/types"

const ScheduleCoveragePage = () => {
  const params = useParams({ strict: false }) as { projectId?: string }
  const routeProjectId = params?.projectId
    ? Number(params.projectId)
    : undefined

  const { projects, hasAnyProject, selectedProjectId, setSelectedProjectId } =
    useProjectSelector(MANAGER_PROJECT_ROLES)

  const projectId = routeProjectId ?? selectedProjectId

  const { isSuperUser, canEditSchedule } = useProjectAuth(projectId)
  const { canManageZone } = useZoneAccess(projectId ?? 0)

  const { message } = useUI()
  const navigate = useNavigate()

  const { weekStart, nextWeekStart, shiftWeek, goThisWeek } = useWeekCursor()
  const weekStartISO = toISODate(weekStart)
  const weekEndISO = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return toISODate(end)
  }, [weekStart])

  const { data: project } = projectQueries.useDetail(projectId ?? 0, {
    enabled: Boolean(projectId),
  })
  const { data: scheduleMatrix = [], isLoading } =
    scheduleQueries.useScheduleMatrix(
      {
        projectId: projectId ?? 0,
        fromDate: weekStartISO,
        toDate: weekEndISO,
      },
      {
        enabled: Boolean(projectId),
        select: (res) =>
          !res.result
            ? []
            : res.result.filter((item) => canManageZone(item.zoneId)),
      },
    )

  const copyMutation = scheduleQueries.useCopyScheduleWeek(projectId ?? 0)
  const saveMutation = scheduleQueries.useSaveZoneCoverage(projectId ?? 0)
  const generateMutation = scheduleQueries.useGenerateWeekInstances(
    projectId ?? 0,
  )

  const [matrixData, setMatrixData] =
    useState<ScheduleMatrixResponse[]>(scheduleMatrix)

  const {
    isDirty,
    showWarning,
    confirmLeave,
    cancelLeave,
    markClean,
    setSnapshot,
  } = useUnsavedChanges({
    getCurrentValue: () => getScheduleSignature(matrixData),
  })

  useEffect(() => {
    if (scheduleMatrix) {
      setMatrixData(scheduleMatrix)
      setSnapshot(getScheduleSignature(scheduleMatrix))
    }
  }, [scheduleMatrix, setSnapshot])

  const handleMatrixChange = useCallback(
    (newItems: ScheduleMatrixResponse[]) => setMatrixData(newItems),
    [],
  )

  const handleSave = useCallback(
    async (items: ScheduleMatrixResponse[]) => {
      if (!projectId) return
      const schedules: ScheduleItemRequest[] = items.flatMap((item) =>
        (item.scheduledDates || []).map((sd) => ({
          zoneId: item.zoneId,
          taskItemId: item.taskItemId,
          roleId: item.roleId,
          workDate: sd.workDate,
          assignments: (sd.assigned || []).map((u) => ({
            userId: u.id,
            roleId: u.roleId,
            checklistId: u.checklistId,
          })),
        })),
      )
      await saveMutation.mutateAsync({
        projectId,
        weekStart: weekStartISO,
        schedules,
      })
      markClean()
    },
    [projectId, saveMutation, weekStartISO, markClean],
  )

  const hasScheduledTasks = useMemo(
    () => matrixData.some((item) => (item.scheduledDates || []).length > 0),
    [matrixData],
  )

  const handleCopyNextWeek = useCallback(() => {
    if (!hasScheduledTasks) {
      message.error("Tuần hiện tại chưa có lịch làm việc nào để sao chép.")
      return
    }
    const sourceToDate = new Date(weekStart)
    sourceToDate.setDate(sourceToDate.getDate() + 6)
    copyMutation.mutate({
      sourceFromDate: weekStartISO,
      sourceToDate: toISODate(sourceToDate),
      targetFromDate: toISODate(nextWeekStart),
    })
  }, [
    copyMutation,
    weekStart,
    weekStartISO,
    nextWeekStart,
    hasScheduledTasks,
    message,
  ])

  const handleGenerateWeek = useCallback(() => {
    generateMutation.mutate({ weekStart })
  }, [generateMutation, weekStart])

  if (!isSuperUser && !hasAnyProject && !projectId) {
    return <UnauthorizedAccess />
  }
  if (!projectId) {
    return <NoProjectAccess />
  }
  if (!canEditSchedule) {
    return <UnauthorizedAccess />
  }

  const isStandalone = !routeProjectId
  const pageTitle = isStandalone
    ? "Lịch làm việc"
    : `Lịch làm việc${project ? ` - ${project.name}` : ""}`

  const defaultOnBack = routeProjectId
    ? () =>
        navigate({
          to: "/projects/$projectId/edit",
          params: { projectId: String(routeProjectId) },
        })
    : undefined

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PageHeader
        title={pageTitle}
        onBack={defaultOnBack}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {isStandalone && projects.length > 0 && (
              <ProjectFilterSelect
                projects={projects}
                value={projectId}
                onChange={(newId) =>
                  confirmIfDirty(
                    isDirty,
                    markClean,
                    "Nếu chuyển dự án khác, các thay đổi chưa lưu sẽ bị mất. Bạn có chắc muốn tiếp tục?",
                    () => setSelectedProjectId(newId),
                  )
                }
              />
            )}

            <ScheduleWeekControls
              isDirty={isDirty}
              isSaving={saveMutation.isPending}
              onSave={() => handleSave(matrixData)}
              weekStart={weekStart}
              nextWeekStart={nextWeekStart}
              isCopying={copyMutation.isPending}
              onCopyNextWeek={handleCopyNextWeek}
              onShiftWeek={(deltaWeeks) =>
                confirmIfDirty(
                  isDirty,
                  markClean,
                  "Nếu chuyển sang tuần khác, các thay đổi trong tuần hiện tại chưa lưu sẽ bị mất. Bạn có chắc muốn tiếp tục không?",
                  () => shiftWeek(deltaWeeks),
                )
              }
              onGoThisWeek={() => {
                if (weekStartISO === toISODate(mondayOf(new Date()))) return
                confirmIfDirty(
                  isDirty,
                  markClean,
                  "Nếu chuyển về tuần này, các thay đổi chưa lưu trong tuần hiện tại sẽ bị mất. Bạn có chắc muốn tiếp tục không?",
                  goThisWeek,
                )
              }}
              hasScheduledTasks={hasScheduledTasks}
              isGenerating={generateMutation.isPending}
              onGenerateWeek={handleGenerateWeek}
            />
          </div>
        }
        className="bg-card p-4 rounded-lg border"
      />

      <div className="min-h-0 flex-1">
        <ScheduleCoverageBody
          matrixRows={matrixData}
          isLoading={isLoading}
          weekStart={weekStartISO}
          onChange={handleMatrixChange}
          projectId={projectId}
        />
      </div>

      <UnsavedChangesModal
        open={showWarning}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </div>
  )
}

export default ScheduleCoveragePage
