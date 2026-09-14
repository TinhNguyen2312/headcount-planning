import { Tag } from "antd"
import { Edit2, Trash2 } from "lucide-react"
import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import type { SectorResponse } from "@/types"

export interface SectorListItemProps {
  sector: SectorResponse
  isSelected: boolean
  regionCount: number
  onSelect: (sectorId: number) => void
  onEdit: (sector: SectorResponse) => void
  onDelete: (sector: SectorResponse) => void
}

export const SectorListItem = ({
  sector,
  isSelected,
  regionCount,
  onSelect,
  onEdit,
  onDelete,
}: SectorListItemProps) => {
  const actionItems: ActionMenuItem<SectorResponse>[] = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <Edit2 className="size-3.5" />,
      onClick: () => onEdit(sector),
    },
    {
      key: "delete",
      label: "Xóa khu vực",
      icon: <Trash2 className="size-3.5 text-destructive" />,
      danger: true,
      onClick: () => onDelete(sector),
    },
  ]

  return (
    <div
      onClick={() => onSelect(sector.id)}
      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-xs"
          : "border-border/70 hover:border-border hover:bg-muted/40"
      }`}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold text-sm truncate ${
              isSelected ? "text-primary" : "text-foreground"
            }`}
          >
            {sector.name}
          </span>
          {sector.code && (
            <span className="font-mono text-[11px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground">
              {sector.code}
            </span>
          )}
        </div>
        {sector.description && (
          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {sector.description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Tag
          color={regionCount > 0 ? "cyan" : "default"}
          className="mr-0 text-xs font-medium"
        >
          {regionCount} vùng
        </Tag>
        <ActionMenu
          record={sector}
          items={actionItems}
          triggerButtonClassName="size-6! p-0! shrink-0"
        />
      </div>
    </div>
  )
}

export default SectorListItem
