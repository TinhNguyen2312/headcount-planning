import { Checkbox, Table, Tooltip } from "antd"
import { FolderOpen } from "lucide-react"
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ScheduleCoverageRow, ScheduleDayDetail } from "@/types"
import { columnDateLabel, todayISODate } from "./scheduleUtils"

export interface PersonalGroupRow {
  key: string
  kind: "group"
  label: string
  count: number
  children: PersonalMatrixRow[]
}

export interface PersonalLeafRow {
  key: string
  kind: "leaf"
  row: ScheduleCoverageRow
  isFirstOfTask: boolean
  taskBand: number
}

export type PersonalMatrixRow = PersonalGroupRow | PersonalLeafRow

interface PersonalPathedRow {
  row: ScheduleCoverageRow
  path: string[]
}

const personalRowKey = (row: ScheduleCoverageRow): string =>
  `${row.taskItemId}-${row.zoneId}`

const buildPersonalTaskTree = (
  items: PersonalPathedRow[],
  keyPrefix: string,
): PersonalMatrixRow[] => {
  const leaves: ScheduleCoverageRow[] = []
  const buckets = new Map<string, PersonalPathedRow[]>()
  const bucketOrder: string[] = []

  for (const item of items) {
    if (item.path.length === 0) {
      leaves.push(item.row)
      continue
    }
    const [head, ...rest] = item.path
    if (!buckets.has(head)) {
      buckets.set(head, [])
      bucketOrder.push(head)
    }
    buckets.get(head)?.push({ row: item.row, path: rest })
  }

  const groupNodes: PersonalMatrixRow[] = bucketOrder.map((label) => {
    const children = buckets.get(label) ?? []
    return {
      key: `${keyPrefix}-${label}`,
      kind: "group" as const,
      label,
      count: children.length,
      children: buildPersonalTaskTree(children, `${keyPrefix}-${label}`),
    }
  })

  let previousTaskId: number | null = null
  let taskBand = -1
  const leafNodes: PersonalMatrixRow[] = leaves.map((row) => {
    const isFirstOfTask = row.taskItemId !== previousTaskId
    if (isFirstOfTask) taskBand += 1
    previousTaskId = row.taskItemId
    return {
      key: personalRowKey(row),
      kind: "leaf" as const,
      row,
      isFirstOfTask,
      taskBand,
    }
  })

  return [...groupNodes, ...leafNodes]
}

const buildPersonalGroups = (
  rows: ScheduleCoverageRow[],
): PersonalMatrixRow[] =>
  buildPersonalTaskTree(
    rows.map((row) => ({
      row,
      path: (row.groupPath ?? []).filter(
        (p) => p !== "Ma trận Nghiệp vụ PCD (Mẹ-Con)",
      ),
    })),
    "personal-group",
  )

interface PersonalCellCheckboxProps {
  day: ScheduleDayDetail
  disabled: boolean
  isPast: boolean
  zoneName: string
  roleName?: string | null
  onClick: () => void
}

const PersonalCellCheckbox = React.memo(
  ({
    day,
    disabled,
    isPast,
    zoneName,
    roleName,
    onClick,
  }: PersonalCellCheckboxProps) => {
    const isDisabled = disabled || isPast
    const plannedNames = day.assignedUserNames.join(", ") || "Đã phân công"
    const instanceNotGeneratedYet = day.scheduled && !day.instanceAssignedUserId
    const replacementTookOver =
      day.scheduled &&
      day.instanceAssignedUserId != null &&
      !day.assignedUserIds.includes(day.instanceAssignedUserId)

    let tooltipText: string
    if (day.scheduled) {
      tooltipText = `Kế hoạch: ${plannedNames}`
      if (replacementTookOver) {
        tooltipText += ` - Thực tế có nghiệp vụ để làm: ${day.instanceAssignedUserName || "Nhân sự thay thế"}`
      } else if (instanceNotGeneratedYet) {
        tooltipText += " - Chưa tạo nghiệp vụ cho ngày này"
      } else {
        tooltipText += ` - Đã có nghiệp vụ để ${day.instanceAssignedUserName || plannedNames} làm`
      }
      if (day.checklistName) {
        tooltipText += ` - Checklist: ${day.checklistName}`
      }
    } else if (isPast) {
      tooltipText = "Ngày đã qua, không thể chỉnh sửa lịch làm việc"
    } else if (!disabled) {
      tooltipText =
        (day.candidates?.length ?? 0) > 1
          ? "Nhấp để chọn nhân sự phụ trách"
          : "Nhấp để phân công"
    } else {
      tooltipText = `Chưa thể lên lịch: Khu vực "${zoneName}" chưa có nhân sự chức danh ${roleName || "chuyên môn"}. Vui lòng phân công nhân sự tại mục Phân quyền & Khu vực trước.`
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          if (!isDisabled) onClick()
        }}
        className={`relative inline-flex items-center justify-center p-1.5 select-none ${
          isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        }`}
      >
        <Tooltip title={tooltipText}>
          <div className="relative inline-flex">
            <Checkbox
              checked={day.scheduled}
              disabled={isDisabled}
              onClick={(e) => e.stopPropagation()}
              onChange={() => !isDisabled && onClick()}
            />
            {day.assignedUserIds.length > 1 && (
              <span className="absolute -right-2.5 -top-2 rounded-full bg-primary px-1 text-[9px] font-semibold leading-3 text-primary-foreground">
                {day.assignedUserIds.length}
              </span>
            )}
          </div>
        </Tooltip>
      </div>
    )
  },
)
PersonalCellCheckbox.displayName = "PersonalCellCheckbox"

interface PersonalCoverageMatrixProps {
  rows: ScheduleCoverageRow[]
  weekStart?: string
  onChange?: (newRows: ScheduleCoverageRow[]) => void
}

export const PersonalCoverageMatrix = React.memo(
  ({ rows, weekStart, onChange }: PersonalCoverageMatrixProps) => {
    const dataSource = useMemo(() => buildPersonalGroups(rows), [rows])

    const wrapperRef = useRef<HTMLDivElement>(null)
    const [bodyHeight, setBodyHeight] = useState<number | string>(
      "calc(100vh - 280px)",
    )

    useLayoutEffect(() => {
      const el = wrapperRef.current
      if (!el) return

      const updateHeight = () => {
        const theadHeight =
          el.querySelector<HTMLElement>(".ant-table-thead")?.offsetHeight ?? 0
        if (el.clientHeight > theadHeight + 100) {
          setBodyHeight(Math.max(el.clientHeight - theadHeight, 200))
        } else {
          setBodyHeight("calc(100vh - 280px)")
        }
      }

      updateHeight()
      const observer = new ResizeObserver(updateHeight)
      observer.observe(el)
      return () => observer.disconnect()
    }, [])

    const handleCellClick = useCallback(
      (record: PersonalLeafRow, day: ScheduleDayDetail) => {
        if (!onChange) return
        if (day.date < todayISODate()) return

        const nextScheduled = !day.scheduled
        const candidateUser = day.candidates?.[0]
        const nextAssignedIds = nextScheduled
          ? day.assignedUserIds.length > 0
            ? day.assignedUserIds
            : candidateUser
              ? [candidateUser.userId]
              : []
          : []
        const nextAssignedNames = nextScheduled
          ? day.assignedUserNames.length > 0
            ? day.assignedUserNames
            : candidateUser
              ? [candidateUser.fullName]
              : []
          : []

        const targetKey = personalRowKey(record.row)
        const updatedRows = rows.map((r) => {
          if (personalRowKey(r) !== targetKey) return r
          return {
            ...r,
            days: r.days.map((d) => {
              if (d.date !== day.date) return d
              return {
                ...d,
                scheduled: nextScheduled,
                assignedUserIds: nextAssignedIds,
                assignedUserNames: nextAssignedNames,
              }
            }),
          }
        })
        onChange(updatedRows)
      },
      [onChange, rows],
    )

    const weekdayColumns = useMemo(() => {
      const todayISO = todayISODate()
      return ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
        (label, dayIndex) => ({
          title: (
            <div className="flex flex-col items-center leading-tight">
              <span>{label}</span>
              {weekStart && (
                <span className="text-[10px] font-normal text-muted-foreground">
                  {columnDateLabel(weekStart, dayIndex)}
                </span>
              )}
            </div>
          ),
          key: `day-${dayIndex}`,
          width: 54,
          align: "center" as const,
          onCell: (record: PersonalMatrixRow) => ({
            colSpan: record.kind === "group" ? 0 : 1,
          }),
          render: (_: unknown, record: PersonalMatrixRow) => {
            if (record.kind !== "leaf") return null
            const day = record.row.days[dayIndex]
            if (!day) return null

            return (
              <PersonalCellCheckbox
                day={day}
                disabled={!onChange}
                isPast={day.date < todayISO}
                zoneName={record.row.zoneName}
                roleName={record.row.roleName}
                onClick={() => handleCellClick(record, day)}
              />
            )
          },
        }),
      )
    }, [weekStart, onChange, handleCellClick])

    const columns = useMemo(
      () => [
        {
          title: "Nghiệp vụ",
          key: "task",
          width: 440,
          onCell: (record: PersonalMatrixRow) => ({
            colSpan: record.kind === "group" ? 9 : 1,
          }),
          render: (_: unknown, record: PersonalMatrixRow) =>
            record.kind === "group" ? (
              <div className="flex items-center gap-2 cursor-pointer select-none py-1">
                <FolderOpen size={16} className="text-primary shrink-0" />
                <b className="text-base font-bold text-foreground hover:text-primary transition-colors">
                  {record.label}
                </b>
                <span className="text-[11px] font-normal text-muted-foreground">
                  ({record.count} phân công)
                </span>
              </div>
            ) : (
              <b className="pl-3 text-base font-semibold text-foreground">
                {record.row.taskTitle}
              </b>
            ),
        },
        {
          title: "Khu vực",
          key: "zone",
          width: 160,
          onCell: (record: PersonalMatrixRow) => ({
            colSpan: record.kind === "group" ? 0 : 1,
          }),
          render: (_: unknown, record: PersonalMatrixRow) => {
            if (record.kind !== "leaf") return null
            return (
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-foreground">
                  {record.row.zoneName}
                </span>
              </div>
            )
          },
        },
        ...weekdayColumns,
      ],
      [weekdayColumns],
    )

    return (
      <div ref={wrapperRef} className="h-full min-h-0">
        <Table<PersonalMatrixRow>
          dataSource={dataSource}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="small"
          scroll={{ x: 900, y: bodyHeight }}
          expandable={{
            expandRowByClick: true,
            defaultExpandAllRows: true,
          }}
          rowClassName={(record) => {
            if (record.kind === "group") {
              return "bg-muted/80 hover:!bg-muted font-bold transition-colors cursor-pointer select-none"
            }
            const band = record.taskBand % 2 === 1 ? "bg-muted/30" : ""
            const divider = record.isFirstOfTask
              ? "[&>td]:border-t-2 [&>td]:border-t-border"
              : ""
            return [band, divider].filter(Boolean).join(" ")
          }}
        />
      </div>
    )
  },
)
PersonalCoverageMatrix.displayName = "PersonalCoverageMatrix"

export default PersonalCoverageMatrix
