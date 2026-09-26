import { Button, Tooltip } from "antd"
import { Layers } from "lucide-react"
import type { MapMode } from "@/constants/map"

export interface MapModeToggleProps {
  mode: MapMode
  onChange: (nextMode: MapMode) => void
  placement?: "left" | "right" | "top" | "bottom"
}

export default function MapModeToggle({
  mode,
  onChange,
  placement = "left",
}: MapModeToggleProps) {
  const isSatellite = mode === "satellite"

  return (
    <Tooltip
      title={
        isSatellite
          ? "Chuyển sang bản đồ Giao thông"
          : "Chuyển sang ảnh Vệ tinh (Esri)"
      }
      placement={placement}
    >
      <Button
        type={isSatellite ? "primary" : "text"}
        size="small"
        icon={<Layers className="size-4" />}
        onClick={() => onChange(isSatellite ? "standard" : "satellite")}
      />
    </Tooltip>
  )
}
