import { Button, Space, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Pencil, Trash2 } from "lucide-react"
import type { RegionDetail } from "@/types"

export interface GetRegionColumnsOptions {
  onEdit: (region: RegionDetail) => void
  onDelete: (region: RegionDetail) => void
}

export const getRegionColumns = ({
  onEdit,
  onDelete,
}: GetRegionColumnsOptions): ColumnsType<RegionDetail> => [
  {
    title: "Tên vùng dự án",
    dataIndex: "name",
    key: "name",
    render: (name: string, record) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{name}</span>
        {record.code && (
          <span className="font-mono text-xs text-muted-foreground">
            {record.code}
          </span>
        )}
      </div>
    ),
  },
  {
    title: "Khu vực trực thuộc",
    dataIndex: "sectorName",
    key: "sectorName",
    render: (sectorName: string, record) => (
      <Tag color="blue" className="text-xs">
        {sectorName || record.sectorCode || `ID: ${record.sectorId}`}
      </Tag>
    ),
  },
  {
    title: "Mô tả phạm vi",
    dataIndex: "description",
    key: "description",
    render: (desc: string) => (
      <span className="text-xs text-muted-foreground line-clamp-2">
        {desc || "—"}
      </span>
    ),
  },
  {
    title: "Thao tác",
    key: "actions",
    width: 100,
    align: "center",
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            size="small"
            icon={<Pencil className="size-3.5 text-muted-foreground" />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Xóa vùng">
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 className="size-3.5" />}
            onClick={() => onDelete(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
]
