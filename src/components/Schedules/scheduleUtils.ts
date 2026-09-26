import { Modal } from "antd"
import type { ScheduleCoverageRow, ScheduleMatrixResponse } from "@/types"

export interface AssignedUser {
  id: number
  name: string
  phone?: string | null
  roleId?: number | null
  checklistId?: number | null
  checklistName?: string | null
}
export interface GroupRow {
  key: string
  kind: "group"
  label: string
  count: number
  children: MatrixRow[]
}

export interface LeafRow {
  key: string
  kind: "leaf"
  item: ScheduleMatrixResponse
  isFirstOfTask: boolean
  taskBand: number
}

export type MatrixRow = GroupRow | LeafRow

export const rowKey = (item: { taskItemId: number; zoneId: number }): string =>
  `${item.taskItemId}-${item.zoneId}`

const buildLeafNodes = (items: ScheduleMatrixResponse[]): LeafRow[] => {
  let previousTaskId: number | null = null
  let taskBand = -1
  return items.map((item) => {
    const isFirstOfTask = item.taskItemId !== previousTaskId
    if (isFirstOfTask) taskBand += 1
    previousTaskId = item.taskItemId
    return {
      key: rowKey(item),
      kind: "leaf" as const,
      item,
      isFirstOfTask,
      taskBand,
    }
  })
}

export const buildTaskTree = (
  schedulesMatrix: ScheduleMatrixResponse[],
): MatrixRow[] => {
  const leaves: ScheduleMatrixResponse[] = []
  const buckets = new Map<string, ScheduleMatrixResponse[]>()
  const bucketOrder: string[] = []

  for (const item of schedulesMatrix) {
    const groupName = item.taskGroupName?.trim()
    if (!groupName || groupName === "Ma trận Nghiệp vụ PCD (Mẹ-Con)") {
      leaves.push(item)
      continue
    }
    if (!buckets.has(groupName)) {
      buckets.set(groupName, [])
      bucketOrder.push(groupName)
    }
    buckets.get(groupName)?.push(item)
  }

  const groupNodes: MatrixRow[] = bucketOrder.map((label) => {
    const groupItems = buckets.get(label) ?? []
    return {
      key: `group-${label}`,
      kind: "group" as const,
      label,
      count: groupItems.length,
      children: buildLeafNodes(groupItems),
    }
  })

  return [...groupNodes, ...buildLeafNodes(leaves)]
}

export const todayISODate = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export const toISODate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const toDisplayDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`

export const mondayOf = (date: Date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  return result
}

export const columnDateLabel = (
  weekStart: string,
  dayIndex: number,
): string => {
  const d = new Date(`${weekStart}T00:00:00`)
  d.setDate(d.getDate() + dayIndex)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

export const getISOWeekNumber = (date: Date) => {
  const target = new Date(date.getTime())
  target.setHours(0, 0, 0, 0)
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7))
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = target.getTime() - firstThursday.getTime()
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000))
}

export const WEEKDAY_SHORT_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
export const WEEKDAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
]

export const WEEKDAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
]

export interface WeekDayInfo {
  date: string
  dayLabel: string
  shortLabel: string
  dateLabel: string
  isToday: boolean
}

export const getWeekDays = (baseDate: Date): WeekDayInfo[] => {
  const monday = mondayOf(baseDate)
  const todayISO = toISODate(new Date())

  return Array.from({ length: 7 }, (_, i) => {
    const current = new Date(monday)
    current.setDate(monday.getDate() + i)
    const dateStr = toISODate(current)
    return {
      date: dateStr,
      dayLabel: WEEKDAY_LABELS[i] ?? `Thứ ${i + 2}`,
      shortLabel: WEEKDAY_SHORT_LABELS[i] ?? `T${i + 2}`,
      dateLabel: toDisplayDate(current),
      isToday: dateStr === todayISO,
    }
  })
}

export const getScheduleSignature = (items: ScheduleMatrixResponse[]) => {
  const sig: Record<string, string> = {}
  for (const item of items) {
    for (const sd of item.scheduledDates || []) {
      const sortedUsers = [...(sd.assigned || [])].sort((a, b) => a.id - b.id)
      sig[`${item.taskItemId}_${item.zoneId}_${sd.workDate}`] = sortedUsers
        .map((u) => `${u.id}:${u.checklistId ?? ""}`)
        .join(",")
    }
  }
  return sig
}

export const getPersonalScheduleSignature = (rows: ScheduleCoverageRow[]) => {
  const sig: Record<string, string> = {}
  for (const r of rows) {
    for (const d of r.days) {
      if (d.scheduled) {
        const sortedUserIds = [...d.assignedUserIds].sort((a, b) => a - b)
        sig[`${r.taskItemId}_${r.zoneId}_${d.date}`] =
          `${sortedUserIds.join(",")}_${d.checklistId ?? ""}`
      }
    }
  }
  return sig
}

export const updateScheduleMatrixCell = (
  items: ScheduleMatrixResponse[],
  zoneId: number,
  taskItemId: number,
  workDate: string,
  assignedUsers: AssignedUser[],
  checklistId?: number | null,
  checklistName?: string | null,
): ScheduleMatrixResponse[] => {
  return items.map((item) => {
    if (item.zoneId !== zoneId || item.taskItemId !== taskItemId) return item

    const existingDates = item.scheduledDates || []
    if (assignedUsers.length === 0) {
      return {
        ...item,
        scheduledDates: existingDates.filter((d) => d.workDate !== workDate),
      }
    }

    const dateIndex = existingDates.findIndex((d) => d.workDate === workDate)
    const primaryChecklistId =
      assignedUsers.find((u) => u.checklistId != null)?.checklistId ??
      checklistId ??
      null
    const primaryChecklistName =
      assignedUsers.find((u) => u.checklistName != null)?.checklistName ??
      checklistName ??
      null

    const newEntry = {
      scheduleId: dateIndex >= 0 ? existingDates[dateIndex].scheduleId : 0,
      workDate,
      assigned: assignedUsers.map((u) => ({
        id: u.id,
        name: u.name,
        phone: u.phone ?? null,
        roleId: u.roleId ?? item.roleId ?? null,
        checklistId: u.checklistId ?? primaryChecklistId,
        checklistName: u.checklistName ?? primaryChecklistName,
      })),
      checklistId: primaryChecklistId,
      checklistName: primaryChecklistName,
    }

    if (dateIndex >= 0) {
      const updatedDates = [...existingDates]
      updatedDates[dateIndex] = newEntry
      return { ...item, scheduledDates: updatedDates }
    }

    return { ...item, scheduledDates: [...existingDates, newEntry] }
  })
}

export function confirmIfDirty(
  isDirty: boolean,
  markClean: () => void,
  content: string,
  apply: () => void,
) {
  if (!isDirty) {
    apply()
    return
  }
  Modal.confirm({
    title: "Bạn có thay đổi chưa lưu",
    content,
    okText: "Tiếp tục chuyển",
    cancelText: "Ở lại",
    okButtonProps: { danger: true },
    onOk: () => {
      markClean()
      apply()
    },
  })
}
