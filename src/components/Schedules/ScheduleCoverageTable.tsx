import { Table, Tooltip } from "antd"
import { FolderOpen, TriangleAlert } from "lucide-react"
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ScheduleMatrixResponse, ScheduleMatrixRoleSummary } from "@/types"
import CellCheckbox, { type UpdateCellHandler } from "./CellCheckbox"
import {
  buildTaskTree,
  columnDateLabel,
  type MatrixRow,
  toISODate,
  updateScheduleMatrixCell,
} from "./scheduleUtils"

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

interface ScheduleCoverageTableProps {
  items: ScheduleMatrixResponse[]
  weekStart?: string
  onChange?: (newItems: ScheduleMatrixResponse[]) => void
  onUpdateCell?: UpdateCellHandler
}

const ScheduleCoverageTable = React.memo(
  ({
    items,
    weekStart,
    onChange,
    onUpdateCell,
  }: ScheduleCoverageTableProps) => {
    const dataSource = useMemo(() => buildTaskTree(items), [items])

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

    const handleUpdateCell: UpdateCellHandler = useCallback(
      (
        zoneId: number,
        taskItemId: number,
        date: string,
        assignedUsers,
        checklistId,
        checklistName,
      ) => {
        if (onUpdateCell) {
          onUpdateCell(
            zoneId,
            taskItemId,
            date,
            assignedUsers,
            checklistId,
            checklistName,
          )
          return
        }
        if (onChange) {
          onChange(
            updateScheduleMatrixCell(
              items,
              zoneId,
              taskItemId,
              date,
              assignedUsers,
              checklistId,
              checklistName,
            ),
          )
        }
      },
      [items, onChange, onUpdateCell],
    )

    const weekdayColumns = useMemo(() => {
      return WEEKDAY_LABELS.map((label, dayIndex) => {
        let dateStr = ""
        if (weekStart) {
          const d = new Date(`${weekStart}T00:00:00`)
          d.setDate(d.getDate() + dayIndex)
          dateStr = toISODate(d)
        }

        return {
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
          onCell: (record: MatrixRow) => ({
            colSpan: record.kind === "group" ? 0 : 1,
          }),
          render: (_: unknown, record: MatrixRow) => {
            if (record.kind !== "leaf") return null
            const item = record.item
            const sd = item.scheduledDates?.find((d) => d.workDate === dateStr)

            return (
              <CellCheckbox
                item={item}
                sd={sd}
                dateStr={dateStr}
                weekdayLabel={label}
                onUpdateCell={handleUpdateCell}
              />
            )
          },
        }
      })
    }, [weekStart, handleUpdateCell])

    const columns = useMemo(
      () => [
        {
          title: "Nghiệp vụ",
          key: "task",
          width: 440,
          onCell: (record: MatrixRow) => ({
            colSpan: record.kind === "group" ? 9 : 1,
          }),
          render: (_: unknown, record: MatrixRow) =>
            record.kind === "group" ? (
              <div className="flex items-center gap-2 cursor-pointer select-none py-1">
                <FolderOpen size={16} className="text-primary shrink-0" />
                <b className="text-base font-bold text-foreground hover:text-primary transition-colors">
                  {record.label}
                </b>
              </div>
            ) : (
              <b className="pl-3 text-base font-semibold text-foreground">
                {record.item.taskItemTitle}
              </b>
            ),
        },
        {
          title: "Khu vực",
          key: "zone",
          width: 160,
          onCell: (record: MatrixRow) => ({
            colSpan: record.kind === "group" ? 0 : 1,
          }),
          render: (_: unknown, record: MatrixRow) => {
            if (record.kind !== "leaf") return null
            const isStaffed = record.item.availableUsers.length > 0
            const roleNames = record.item?.roles
              ?.map((r: ScheduleMatrixRoleSummary) => r.roleName)
              .filter(Boolean)

            return (
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-foreground">
                  {record.item.zoneName}
                </span>
                {!isStaffed && (
                  <Tooltip
                    title={
                      roleNames.length > 0
                        ? `Cần 1 trong các chức danh: ${roleNames.join(", ")}`
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
                      <TriangleAlert size={11} className="shrink-0" />
                      Chưa gán đủ nhân sự
                    </span>
                  </Tooltip>
                )}
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
        <Table<MatrixRow>
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
            const isStaffed = (record.item.availableUsers?.length ?? 0) > 0
            const staffing = !isStaffed ? "bg-destructive/10" : band
            const divider = record.isFirstOfTask
              ? "[&>td]:border-t-2 [&>td]:border-t-border"
              : ""
            return [staffing, divider].filter(Boolean).join(" ")
          }}
        />
      </div>
    )
  },
)
ScheduleCoverageTable.displayName = "ScheduleCoverageTable"

export default ScheduleCoverageTable
