import { Button, Card, Empty, Input, Table } from "antd"
import { Building, Plus, Search } from "lucide-react"
import { useMemo } from "react"
import { getRegionColumns } from "@/components/Projects/SectorRegion/RegionColumns"
import type { RegionDetail, SectorResponse } from "@/types"

export interface RegionTableCardProps {
  regions: RegionDetail[]
  activeSector: SectorResponse | null
  isLoading: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onAddRegion: () => void
  onEditRegion: (region: RegionDetail) => void
  onDeleteRegion: (region: RegionDetail) => void
}

export const RegionTableCard = ({
  regions,
  activeSector,
  isLoading,
  searchValue,
  onSearchChange,
  onAddRegion,
  onEditRegion,
  onDeleteRegion,
}: RegionTableCardProps) => {
  const columns = useMemo(
    () =>
      getRegionColumns({
        onEdit: onEditRegion,
        onDelete: onDeleteRegion,
      }),
    [onEditRegion, onDeleteRegion],
  )

  return (
    <Card
      className="lg:col-span-8 border-border shadow-xs"
      title={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Building className="size-4 text-primary" />
            <span className="font-semibold text-base">
              Vùng dự án (Region)
              {activeSector && (
                <span className="text-muted-foreground font-normal text-sm ml-1">
                  trực thuộc{" "}
                  <strong className="text-foreground">
                    {activeSector.name}
                  </strong>
                </span>
              )}
            </span>
          </div>
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={onAddRegion}
          >
            Thêm vùng
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Input
            placeholder="Tìm kiếm theo tên vùng, mã vùng, mô tả..."
            prefix={<Search className="size-4 text-muted-foreground" />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            className="max-w-md"
          />
        </div>

        <Table<RegionDetail>
          columns={columns}
          dataSource={regions}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            total: regions.length,
          }}
          locale={{
            emptyText: (
              <Empty
                description={
                  activeSector
                    ? `Khu vực "${activeSector.name}" chưa có vùng dự án nào.`
                    : "Chưa có vùng dự án nào được tạo."
                }
              />
            ),
          }}
        />
      </div>
    </Card>
  )
}

export default RegionTableCard
