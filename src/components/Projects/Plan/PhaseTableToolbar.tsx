import { Badge, Button, Space } from "antd"
import { Plus, Save } from "lucide-react"
import React from "react"

interface PhaseTableToolbarProps {
  phasesCount: number
  isDirty: boolean
  viewOnly?: boolean
  isSaving?: boolean
  onAddPhase: () => void
  onSavePlanChanges: () => void
}

export const PhaseTableToolbar: React.FC<PhaseTableToolbarProps> = ({
  phasesCount,
  isDirty,
  viewOnly = false,
  isSaving = false,
  onAddPhase,
  onSavePlanChanges,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-base text-foreground">
          Danh sách giai đoạn & mốc kiểm soát ({phasesCount})
        </span>
        {isDirty && (
          <Badge
            status="processing"
            text={
              <span className="text-xs text-amber-600 font-medium">
                Có thay đổi chưa lưu
              </span>
            }
          />
        )}
      </div>

      {!viewOnly && (
        <Space>
          <Button
            type="dashed"
            icon={<Plus className="size-4" />}
            onClick={onAddPhase}
          >
            Thêm giai đoạn
          </Button>

          <Button
            type="primary"
            icon={<Save className="size-4" />}
            disabled={!isDirty}
            loading={isSaving}
            onClick={onSavePlanChanges}
          >
            Lưu thay đổi giai đoạn
          </Button>
        </Space>
      )}
    </div>
  )
}

