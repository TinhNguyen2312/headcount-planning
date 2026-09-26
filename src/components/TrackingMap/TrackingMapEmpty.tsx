import { Card, Empty } from "antd"

interface TrackingMapEmptyProps {
  visible: boolean
}

export default function TrackingMapEmpty({ visible }: TrackingMapEmptyProps) {
  if (!visible) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <Card className="max-w-md shadow-xl border border-border/80 pointer-events-auto text-center mx-4">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                Chưa chọn nhân sự nào
              </p>
              <p className="text-xs text-muted-foreground">
                Vui lòng tick chọn ít nhất một nhân sự từ danh sách bên cạnh để
                hiển thị lộ trình trên bản đồ.
              </p>
            </div>
          }
        />
      </Card>
    </div>
  )
}
