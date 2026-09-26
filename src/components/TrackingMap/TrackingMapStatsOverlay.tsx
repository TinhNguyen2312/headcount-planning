import { Users } from "lucide-react"
import type { SessionTrackData } from "./TrackingMapView"

interface TrackingMapStatsOverlayProps {
  sessionsTrackData: SessionTrackData[]
  focusedTrack: SessionTrackData | null
  focusedDuration: string
}

export default function TrackingMapStatsOverlay({
  sessionsTrackData,
  focusedTrack,
  focusedDuration,
}: TrackingMapStatsOverlayProps) {
  if (sessionsTrackData.length === 0) return null

  const activeCount = sessionsTrackData.filter(
    (t) => t.points.length > 0,
  ).length

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 max-w-[calc(100%-120px)]">
      {focusedTrack ? (
        <>
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/70 shadow-md text-sm font-medium">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-white"
              style={{ backgroundColor: focusedTrack.color }}
            />
            <span className="text-foreground font-semibold">
              {focusedTrack.session.userName}
            </span>
            <span className="text-xs text-muted-foreground">
              ({focusedTrack.session.zoneName || "Khu vực chung"})
            </span>
          </div>

          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/70 shadow-md text-sm font-medium">
            <span className="text-muted-foreground">Thời lượng:</span>
            <span className="text-foreground font-semibold">
              {focusedDuration}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/70 shadow-md text-sm font-medium">
          <Users size={15} className="text-primary" />
          <span className="text-muted-foreground">Hiển thị:</span>
          <span className="text-foreground font-bold">
            {activeCount} nhân sự
          </span>
        </div>
      )}
    </div>
  )
}
