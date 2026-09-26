import { Tag } from "antd"
import { CircleCheck, CircleDashed } from "lucide-react"

import type { ScheduleResponse, TaskItemResponse } from "@/types"

const formatDate = (isoStr: string) => {
  if (!isoStr) return ""
  const [y, m, d] = isoStr.split("-")
  return `${d}/${m}/${y}`
}

interface ScheduleTaskCardProps {
  taskItem: TaskItemResponse
  zoneSchedules: ScheduleResponse[]
  zoneName?: string | null
}

const ScheduleTaskCard = ({
  taskItem,
  zoneSchedules,
  zoneName,
}: ScheduleTaskCardProps) => {
  const activeZoneSchedules = zoneSchedules
    .filter((s) => s.status === "ACTIVE")
    .sort((a, b) => a.workDate.localeCompare(b.workDate))

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{taskItem.title}</span>
        {taskItem.workType && (
          <Tag className="font-normal text-base m-0">{taskItem.workType}</Tag>
        )}
      </div>

      {activeZoneSchedules.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {activeZoneSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-start gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <CircleCheck size={14} className="mt-0.5 shrink-0" />
              <span>
                Đang được lập lịch theo Khu vực
                {zoneName ? ` "${zoneName}"` : ""} (ngày{" "}
                {formatDate(schedule.workDate)}) — nhân sự phụ trách khu vực này
                sẽ nhận việc.
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-[11px] text-muted-foreground">
          <CircleDashed size={14} className="mt-0.5 shrink-0" />
          <span>Chưa có lịch làm việc trong khu vực phụ trách.</span>
        </div>
      )}
    </div>
  )
}

export default ScheduleTaskCard
