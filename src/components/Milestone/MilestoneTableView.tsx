import {
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { Pencil, Search, Trash2 } from "lucide-react"
import React, { useMemo, useState } from "react"
import type { MilestoneResponse } from "@/types"

interface MilestoneTableViewProps {
  milestones: MilestoneResponse[]
  isLoading?: boolean
  onEditMilestone: (milestone: MilestoneResponse) => void
  onDeleteMilestone: (milestone: MilestoneResponse) => void
}

const MilestoneTableView: React.FC<MilestoneTableViewProps> = ({
  milestones,
  isLoading = false,
  onEditMilestone,
  onDeleteMilestone,
}) => {
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const filteredData = useMemo(() => {
    return (milestones || []).filter((m) => {
      const matchKeyword =
        !keyword ||
        m.name.toLowerCase().includes(keyword.toLowerCase()) ||
        m.code.toLowerCase().includes(keyword.toLowerCase()) ||
        (m.description &&
          m.description.toLowerCase().includes(keyword.toLowerCase()))

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && m.isActive) ||
        (statusFilter === "INACTIVE" && !m.isActive)

      return matchKeyword && matchStatus
    })
  }, [milestones, keyword, statusFilter])

  const columns: ColumnsType<MilestoneResponse> = [
    {
      title: "Mã mốc",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (code: string) => (
        <Tag color="blue" className="font-mono font-bold text-xs">
          {code}
        </Tag>
      ),
    },
    {
      title: "Tên mốc tiến độ chuẩn",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (name: string, record: MilestoneResponse) => (
        <div>
          <div className="font-medium text-foreground">{name}</div>
          {record.description && (
            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Mốc tiền đề",
      key: "predecessors",
      width: 250,
      render: (_: unknown, record: MilestoneResponse) => {
        const preds = record.predecessors ?? []
        if (preds.length === 0) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Khởi đầu (Không có)
            </span>
          )
        }
        return (
          <div className="flex flex-wrap gap-1">
            {preds.map((p) => (
              <Tooltip key={p.id} title={p.name}>
                <Tag color="geekblue" className="text-xs font-mono">
                  {p.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        )
      },
    },
    {
      title: "Mốc kế tiếp",
      key: "successors",
      width: 220,
      render: (_: unknown, record: MilestoneResponse) => {
        const succs = record.successors ?? []
        if (succs.length === 0) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Kết thúc (Không có)
            </span>
          )
        }
        return (
          <div className="flex flex-wrap gap-1">
            {succs.map((s) => (
              <Tooltip key={s.id} title={s.name}>
                <Tag color="cyan" className="text-xs font-mono">
                  {s.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        )
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="success">Đang áp dụng</Tag>
        ) : (
          <Tag color="default">Tạm dừng</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      fixed: "right",
      render: (_: unknown, record: MilestoneResponse) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Pencil className="size-3.5 text-primary" />}
            onClick={() => onEditMilestone(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa mốc tiến độ?"
            description={`Bạn có chắc muốn xóa mốc "${record.code} - ${record.name}" không?`}
            onConfirm={() => onDeleteMilestone(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 className="size-3.5" />}
              title="Xóa mốc"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input
          placeholder="Tìm kiếm theo mã, tên hoặc diễn giải mốc..."
          prefix={<Search className="size-4 text-muted-foreground" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Trạng thái:</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: "ALL", label: "Tất cả" },
              { value: "ACTIVE", label: "Đang áp dụng" },
              { value: "INACTIVE", label: "Tạm dừng" },
            ]}
          />
        </div>
      </div>

      <Table<MilestoneResponse>
        rowKey="id"
        loading={isLoading}
        dataSource={filteredData}
        columns={columns}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: ["10", "15", "20", "50"],
          showTotal: (total) => `Tổng số ${total} mốc tiến độ`,
        }}
        size="middle"
        bordered
      />
    </div>
  )
}

export default MilestoneTableView
