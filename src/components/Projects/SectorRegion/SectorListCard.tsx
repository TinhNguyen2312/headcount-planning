import { Button, Card, Empty, Input } from "antd"
import { MapPin, Plus, Search } from "lucide-react"
import { SectorListItem } from "@/components/Projects/SectorRegion/SectorListItem"
import type { SectorResponse } from "@/types"

export interface SectorListCardProps {
  sectors: SectorResponse[]
  activeSectorId: number | null
  regionsCountBySector: Map<number, number>
  searchValue: string
  onSearchChange: (value: string) => void
  onSelectSector: (id: number) => void
  onAddSector: () => void
  onEditSector: (sector: SectorResponse) => void
  onDeleteSector: (sector: SectorResponse) => void
}

export const SectorListCard = ({
  sectors,
  activeSectorId,
  regionsCountBySector,
  searchValue,
  onSearchChange,
  onSelectSector,
  onAddSector,
  onEditSector,
  onDeleteSector,
}: SectorListCardProps) => {
  return (
    <Card
      className="lg:col-span-4 border-border shadow-xs"
      title={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <span className="font-semibold text-base">Khu vực (Sector)</span>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<Plus className="size-3.5" />}
            onClick={onAddSector}
          >
            Thêm
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Tìm kiếm khu vực..."
          prefix={<Search className="size-3.5 text-muted-foreground" />}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          size="middle"
        />

        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
          {sectors.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có khu vực nào"
            />
          ) : (
            sectors.map((sector) => (
              <SectorListItem
                key={sector.id}
                sector={sector}
                isSelected={sector.id === activeSectorId}
                regionCount={regionsCountBySector.get(sector.id) ?? 0}
                onSelect={onSelectSector}
                onEdit={onEditSector}
                onDelete={onDeleteSector}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  )
}

export default SectorListCard
