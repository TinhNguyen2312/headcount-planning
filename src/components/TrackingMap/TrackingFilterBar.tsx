import { Button, DatePicker, Space } from "antd"
import dayjs from "dayjs"
import { RefreshCw, RotateCcw } from "lucide-react"
import ProjectFilterSelect from "@/components/Common/ProjectFilterSelect"
import ZoneSelect from "@/components/Common/ZoneSelect"
import type { ProjectFilterOption } from "@/hooks/useProjectSelector"
import type { IQueryTrackingSessions } from "@/types"

interface TrackingFilterBarProps {
  projects: ProjectFilterOption[]
  filters: IQueryTrackingSessions
  onFilterChange: (v: Partial<IQueryTrackingSessions>) => void
  onReset?: () => void
  onRefresh?: () => void
  isFetching?: boolean
}

export default function TrackingFilterBar({
  projects,
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isFetching,
}: TrackingFilterBarProps) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ProjectFilterSelect
          projects={projects}
          value={filters.projectId}
          onChange={(val) => {
            onFilterChange({
              projectId: val,
              zoneId: undefined,
              userId: undefined,
            })
          }}
          className="w-48 sm:w-56"
        />

        <ZoneSelect
          projectId={filters.projectId}
          value={filters.zoneId}
          onChange={(zoneId) => onFilterChange({ zoneId })}
          placeholder="Tất cả phân khu"
          allowClear
          className="w-44 sm:w-52"
          disabled={!filters.projectId}
        />

        {/* <Select
          showSearch
          allowClear
          placeholder="Tất cả nhân sự"
          value={filters.userId}
          onChange={(userId) => onFilterChange({ userId })}
          options={userOptions}
          loading={isLoadingUsers}
          disabled={!filters.projectId}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          className="w-44 sm:w-52"
          suffixIcon={<UserIcon size={14} className="text-muted-foreground" />}
        /> */}

        <DatePicker
          value={filters.fromDate ? dayjs(filters.fromDate) : dayjs()}
          onChange={(date) => {
            const target = date || dayjs()
            const formatted = target.format("YYYY-MM-DD")
            onFilterChange({
              fromDate: formatted,
              toDate: formatted,
            })
          }}
          presets={[
            {
              label: "Hôm nay",
              value: dayjs(),
            },
            {
              label: "Hôm qua",
              value: dayjs().subtract(1, "day"),
            },
          ]}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          allowClear={false}
          className="w-40 sm:w-48"
        />
      </div>

      <Space>
        {onReset && (
          <Button
            icon={<RotateCcw size={14} />}
            onClick={onReset}
            className="text-xs"
          >
            Đặt lại
          </Button>
        )}
        {onRefresh && (
          <Button
            type="primary"
            icon={
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
            }
            onClick={onRefresh}
            className="text-xs"
          >
            Tải lại
          </Button>
        )}
      </Space>
    </div>
  )
}
