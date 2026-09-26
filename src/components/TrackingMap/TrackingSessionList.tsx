import { Checkbox, Empty, Skeleton } from "antd"
import dayjs from "dayjs"
import { Clock, MapPin, Route } from "lucide-react"
import type { TrackingSessionResponse } from "@/types"

interface TrackingSessionListProps {
  sessions: TrackingSessionResponse[]
  selectedSessionIds: number[]
  onToggleSession: (sessionId: number, checked: boolean) => void
  onToggleSelectAll: (checked: boolean) => void
  onFocusSession: (session: TrackingSessionResponse) => void
  isLoading: boolean
  colorMap?: Record<number, string>
}

export default function TrackingSessionList({
  sessions,
  selectedSessionIds,
  onToggleSession,
  onToggleSelectAll,
  onFocusSession,
  isLoading,
  colorMap = {},
}: TrackingSessionListProps) {
  const isAllSelected =
    sessions.length > 0 && selectedSessionIds.length === sessions.length
  const isIndeterminate =
    selectedSessionIds.length > 0 && selectedSessionIds.length < sessions.length

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-3.5 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => onToggleSelectAll(e.target.checked)}
              disabled={sessions.length === 0}
            />
            <span className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
              <Route size={16} className="text-primary shrink-0" />
              Nhân sự
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({selectedSessionIds.length}/{sessions.length})
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[calc(100vh-320px)] min-h-400px">
        {isLoading ? (
          <div className="p-2 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} active avatar paragraph={{ rows: 2 }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-base text-muted-foreground">
                  Chưa có nhân sự nào di chuyển trên hệ thống
                </span>
              }
            />
          </div>
        ) : (
          sessions.map((item) => {
            const isChecked = selectedSessionIds.includes(item.id)
            const color = colorMap[item.id] || "#2563eb"

            const handleToggle = () => {
              const nextChecked = !isChecked
              onToggleSession(item.id, nextChecked)
              if (nextChecked) {
                onFocusSession(item)
              }
            }

            return (
              <div
                key={item.id}
                onClick={handleToggle}
                className={`group p-3 rounded-lg border transition-all cursor-pointer relative ${
                  isChecked
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30 opacity-100"
                    : "border-border/60 bg-muted/10 opacity-75 hover:opacity-100 hover:border-border"
                }`}
              >
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div
                    className="pt-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox checked={isChecked} onChange={handleToggle} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs border border-background"
                          style={{ backgroundColor: color }}
                          title={`Màu lộ trình: ${color}`}
                        />
                        <span className="font-semibold text-foreground text-sm truncate">
                          {item.userName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                      <MapPin
                        size={12}
                        className="shrink-0 text-muted-foreground"
                      />
                      <span className="truncate">
                        {item.projectName} - {item.zoneName || "Khu vực chung"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-1.5 mt-1.5 border-t border-border/30 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Bắt đầu: {dayjs(item.createdAt).format("HH:mm DD/MM")}
                      </span>
                      {item.latestRecordedAt && (
                        <span>
                          Gần nhất:{" "}
                          {dayjs(item.latestRecordedAt).format("HH:mm")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
