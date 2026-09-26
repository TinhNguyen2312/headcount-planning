import { Button, Skeleton } from "antd"
import { Briefcase, Inbox, MapPin } from "lucide-react"
import React, { useCallback, useMemo, useState } from "react"
import RoleSelect from "@/components/Common/RoleSelect"
import TaskTreeSelect from "@/components/Common/TaskTreeSelect"
import ZoneSelect from "@/components/Common/ZoneSelect"
import type { ScheduleMatrixResponse } from "@/types"
import ScheduleCoverageTable from "./ScheduleCoverageTable"
import { type AssignedUser, updateScheduleMatrixCell } from "./scheduleUtils"

interface ScheduleCoverageBodyProps {
  matrixRows: ScheduleMatrixResponse[]
  isLoading: boolean
  weekStart: string
  onChange: (newRows: ScheduleMatrixResponse[]) => void
  projectId: number
}

const ScheduleCoverageBody = React.memo(
  ({
    matrixRows,
    isLoading,
    weekStart,
    onChange,
    projectId,
  }: ScheduleCoverageBodyProps) => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
      undefined,
    )
    const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(
      undefined,
    )
    const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
      undefined,
    )

    const visibleItems = useMemo(() => {
      const matches = (item: ScheduleMatrixResponse) => {
        if (
          selectedTaskId &&
          !(
            item.taskItemId === selectedTaskId ||
            item.taskGroupId === selectedTaskId
          )
        )
          return false
        if (selectedZoneId && item.zoneId !== selectedZoneId) {
          return false
        }

        if (
          selectedRoleId &&
          !item.roles?.some((r) => r.roleId === selectedRoleId)
        )
          return false
        return true
      }

      return matrixRows.filter(matches)
    }, [matrixRows, selectedTaskId, selectedZoneId, selectedRoleId])

    const handleUpdateCell = useCallback(
      (
        zoneId: number,
        taskItemId: number,
        date: string,
        assignedUsers: AssignedUser[],
        checklistId?: number | null,
        checklistName?: string | null,
      ) => {
        onChange(
          updateScheduleMatrixCell(
            matrixRows,
            zoneId,
            taskItemId,
            date,
            assignedUsers,
            checklistId,
            checklistName,
          ),
        )
      },
      [matrixRows, onChange],
    )

    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5 bg-muted/50 p-2.5 rounded-lg border">
          <div className="w-96">
            <TaskTreeSelect
              placeholder="Tất cả nghiệp vụ / nhóm..."
              className="w-full"
              value={selectedTaskId}
              leafOnly={false}
              onChange={(val) => setSelectedTaskId(val ?? undefined)}
            />
          </div>

          <div className="w-52">
            <ZoneSelect
              allowClear
              placeholder="Tất cả phân khu"
              className="w-full"
              projectId={projectId}
              value={selectedZoneId}
              onChange={(val) => setSelectedZoneId(val as number | undefined)}
              suffixIcon={
                <MapPin size={13} className="text-muted-foreground" />
              }
            />
          </div>

          <div className="w-96">
            <RoleSelect
              allowClear
              placeholder="Tất cả chức danh"
              className="w-full"
              value={selectedRoleId}
              onChange={(val) => setSelectedRoleId(val as number | undefined)}
              suffixIcon={
                <Briefcase size={13} className="text-muted-foreground" />
              }
            />
          </div>

          <Button
            type="link"
            onClick={() => {
              setSelectedTaskId(undefined)
              setSelectedZoneId(undefined)
              setSelectedRoleId(undefined)
            }}
            disabled={!selectedTaskId && !selectedZoneId && !selectedRoleId}
          >
            Xóa bộ lọc
          </Button>
          <div className="ml-auto text-base text-muted-foreground">
            Hiển thị: <b>{visibleItems.length}</b> / {matrixRows.length} phân
            công
          </div>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
            <Inbox className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {matrixRows.length === 0
                ? "Chưa có khu vực hoặc nghiệp vụ nào để tổng hợp lịch làm việc"
                : "Không tìm thấy công việc nào phù hợp với bộ lọc"}
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1">
            <ScheduleCoverageTable
              items={visibleItems}
              weekStart={weekStart}
              onUpdateCell={handleUpdateCell}
            />
          </div>
        )}
      </div>
    )
  },
)
ScheduleCoverageBody.displayName = "ScheduleCoverageBody"

export default ScheduleCoverageBody
