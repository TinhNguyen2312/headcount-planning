import { Checkbox, Tooltip } from "antd"
import React, { useState } from "react"
import { checklistQueries } from "@/hooks/server"
import { useUI } from "@/hooks/useUI"
import type { ScheduledDateDetail, ScheduleMatrixResponse } from "@/types"
import AssigneeChecklistModal from "./AssigneeChecklistModal"
import type { AssignedUser } from "./scheduleUtils"
import { todayISODate } from "./scheduleUtils"

export type UpdateCellHandler = (
  zoneId: number,
  taskItemId: number,
  date: string,
  assignedUsers: AssignedUser[],
  checklistId?: number | null,
  checklistName?: string | null,
) => void

interface CellCheckboxProps {
  item: ScheduleMatrixResponse
  sd?: ScheduledDateDetail
  dateStr: string
  weekdayLabel?: string
  onUpdateCell?: UpdateCellHandler
}

const CellCheckbox = React.memo(
  ({
    item,
    sd,
    dateStr,
    weekdayLabel = "",
    onUpdateCell,
  }: CellCheckboxProps) => {
    const { message } = useUI()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const scheduled = Boolean(sd)
    const assigners = sd?.assigned ?? []
    const candidates = item.availableUsers ?? []
    const isStaffed = candidates.length > 0
    const isPast = dateStr < todayISODate()
    const isDisabled = !isStaffed || isPast

    const { data: rawChecklists = [] } = checklistQueries.useList(
      { taskItemId: item.taskItemId, limit: 100 },
      { enabled: isStaffed && !isPast },
    )
    const checklists = rawChecklists ?? []

    const plannedNames =
      assigners.map((u) => u.name).join(", ") || "Đã phân công"

    let tooltipText: string
    if (scheduled) {
      tooltipText = `Kế hoạch: ${plannedNames}`
      const checklistNames = Array.from(
        new Set(
          assigners
            .map((u) => u.checklistName)
            .filter((name): name is string => Boolean(name)),
        ),
      )
      if (checklistNames.length > 0) {
        tooltipText += ` - Checklist: ${checklistNames.join(", ")}`
      } else if (sd?.checklistName) {
        tooltipText += ` - Checklist: ${sd.checklistName}`
      }
    } else if (isPast) {
      tooltipText = "Ngày đã qua, không thể chỉnh sửa lịch làm việc"
    } else if (isStaffed) {
      tooltipText =
        candidates.length > 1
          ? "Nhấp để chọn nhân sự & biểu mẫu phụ trách"
          : "Nhấp để phân công"
    } else {
      tooltipText = `Chưa thể lên lịch: Khu vực "${item.zoneName}" chưa có nhân sự chức danh ${item.roleName || "chuyên môn"}. Vui lòng phân công nhân sự tại mục Phân quyền & Khu vực trước.`
    }

    const handleClick = () => {
      if (isDisabled) return
      if (!onUpdateCell) return
      if (dateStr < todayISODate()) return

      if (candidates.length === 0) {
        if (scheduled) {
          onUpdateCell(item.zoneId, item.taskItemId, dateStr, [])
        } else {
          message.warning(
            `Không có nhân sự phù hợp cho ngày ${dateStr} tại khu vực "${item.zoneName}"`,
          )
        }
        return
      }

      if (scheduled) {
        onUpdateCell(item.zoneId, item.taskItemId, dateStr, [])
        return
      }

      if (candidates.length === 1 && checklists.length <= 1) {
        const only = candidates[0]
        const candidateId = only.id ?? only.userId ?? 0
        const cl = checklists[0]
        onUpdateCell(item.zoneId, item.taskItemId, dateStr, [
          {
            id: candidateId,
            name: only.fullName,
            phone: only.phone ?? null,
            roleId: only.roleId,
            checklistId: cl?.id ?? null,
            checklistName: cl?.name ?? null,
          },
        ])
        return
      }

      setIsModalOpen(true)
    }

    const handleConfirmModal = (assignedUsers: AssignedUser[]) => {
      setIsModalOpen(false)
      if (!onUpdateCell) return

      if (assignedUsers.length === 0) {
        onUpdateCell(item.zoneId, item.taskItemId, dateStr, [])
        return
      }

      onUpdateCell(item.zoneId, item.taskItemId, dateStr, assignedUsers)
    }

    const initialAssignedUsers: AssignedUser[] = assigners.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone ?? null,
      checklistId: u.checklistId ?? sd?.checklistId ?? null,
      checklistName: u.checklistName ?? sd?.checklistName ?? null,
    }))

    return (
      <>
        <div
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
          className={`relative inline-flex items-center justify-center p-1.5 select-none ${
            isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
          }`}
        >
          <Tooltip title={tooltipText}>
            <div className="relative inline-flex">
              <Checkbox
                checked={scheduled}
                disabled={isDisabled}
                onClick={(e) => e.stopPropagation()}
                onChange={() => handleClick()}
              />
              {assigners.length > 1 && (
                <span className="absolute -right-2.5 -top-2 rounded-full bg-primary px-1 text-[9px] font-semibold leading-3 text-primary-foreground">
                  {assigners.length}
                </span>
              )}
            </div>
          </Tooltip>
        </div>

        {isModalOpen && (
          <AssigneeChecklistModal
            open={isModalOpen}
            taskTitle={item.taskItemTitle}
            zoneName={item.zoneName}
            weekdayLabel={weekdayLabel}
            date={dateStr}
            candidates={candidates}
            checklists={checklists}
            initialAssignedUsers={initialAssignedUsers}
            onConfirm={handleConfirmModal}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </>
    )
  },
)
CellCheckbox.displayName = "CellCheckbox"

export default CellCheckbox
