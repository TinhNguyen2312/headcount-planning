import { Button, Segmented, Slider } from "antd"
import { Pause, Play } from "lucide-react"
import type { TrackingPointResponse } from "@/types"
import { formatTime } from "./utils"

interface TrackingMapPlaybackBarProps {
  points: TrackingPointResponse[]
  playbackIndex: number
  isPlaying: boolean
  speedMultiplier: number
  autoFollow: boolean
  onTogglePlay: () => void
  onRestart: () => void
  onSeek: (index: number) => void
  onChangeSpeed: (speed: number) => void
  onToggleAutoFollow: () => void
}

export default function TrackingMapPlaybackBar({
  points,
  playbackIndex,
  isPlaying,
  speedMultiplier,
  autoFollow,
  onTogglePlay,
  onRestart,
  onSeek,
  onChangeSpeed,
  onToggleAutoFollow,
}: TrackingMapPlaybackBarProps) {
  if (!points || points.length <= 1) return null

  const currentPoint = points[playbackIndex] || points[0]
  const lastPoint = points[points.length - 1]

  return (
    <div className="z-10 bg-background/95 backdrop-blur-md border-t border-border p-3 sm:px-6 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono">
          {formatTime(currentPoint.recordedAt)}
        </span>
        <Slider
          min={0}
          max={points.length - 1}
          value={playbackIndex}
          onChange={onSeek}
          className="flex-1 my-1"
          tooltip={{
            formatter: (x) => formatTime(points[x ?? 0]?.recordedAt),
          }}
        />
        <span className="text-xs font-mono">
          {formatTime(lastPoint.recordedAt)}
        </span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            shape="circle"
            icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
            onClick={onTogglePlay}
          />
          <Button onClick={onRestart}>Bắt đầu lại</Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-2">
            <Segmented
              options={[
                { value: 1, label: "1x" },
                { value: 2, label: "2x" },
                { value: 3, label: "3x" },
                { value: 4, label: "4x" },
              ]}
              value={speedMultiplier}
              onChange={(val) => onChangeSpeed(Number(val))}
            />
          </div>
          <Button
            size="small"
            type={autoFollow ? "primary" : "default"}
            onClick={onToggleAutoFollow}
            className="ml-2"
          >
            {autoFollow ? "Bám theo" : "Tự do"}
          </Button>
        </div>
      </div>
    </div>
  )
}
