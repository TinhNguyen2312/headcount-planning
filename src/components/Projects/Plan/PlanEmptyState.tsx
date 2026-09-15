import { Button, Card, Empty } from "antd"
import { Plus } from "lucide-react"
import React from "react"

interface PlanEmptyStateProps {
  onCreateFirstPlan: () => void
  viewOnly?: boolean
}

export const PlanEmptyState: React.FC<PlanEmptyStateProps> = ({
  onCreateFirstPlan,
  viewOnly = false,
}) => {
  return (
    <Card className="shadow-xs border-dashed">
      <Empty
        description={
          <div className="flex flex-col gap-1 items-center">
            <span className="font-semibold text-base">
              Dự án chưa có phiên bản kế hoạch tiến độ nào
            </span>
            <span className="text-sm text-muted-foreground">
              Tạo phiên bản kế hoạch đầu tiên để khai báo các mốc thi công
            </span>
          </div>
        }
      >
        {!viewOnly && (
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={onCreateFirstPlan}
          >
            Tạo kế hoạch tiến độ đầu tiên (V01)
          </Button>
        )}
      </Empty>
    </Card>
  )
}
