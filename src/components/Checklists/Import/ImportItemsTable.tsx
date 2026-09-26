import { Button, Input, InputNumber, Popconfirm, Select, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { ListChecks, Plus, Trash2 } from "lucide-react"
import type { ChecklistRequirementType, ParsedChecklistItem } from "@/types"

const REQUIREMENT_TYPE_OPTIONS = [
  { value: "none", label: "Không yêu cầu" },
  { value: "FILE", label: "Tệp tin" },
  { value: "IMAGE", label: "Hình ảnh" },
  { value: "VIDEO", label: "Video" },
  { value: "DATA_ENTRY", label: "Nhập liệu" },
  { value: "CHECKBOX", label: "Đạt/Không đạt" },
  { value: "NUMBER", label: "Số lượng" },
]

interface ImportItemsTableProps {
  items: ParsedChecklistItem[]
  onUpdateItem: (itemId: string, fields: Partial<ParsedChecklistItem>) => void
  onDeleteItem: (itemId: string) => void
  onAddItem: () => void
}

export function ImportItemsTable({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}: ImportItemsTableProps) {
  const itemColumns: ColumnsType<ParsedChecklistItem> = [
    {
      title: "STT",
      dataIndex: "orderIndex",
      key: "orderIndex",
      width: 50,
      render: (val, record) => (
        <InputNumber
          min={1}
          value={val}
          size="small"
          className="w-full!"
          onChange={(newVal) =>
            onUpdateItem(record.id, { orderIndex: newVal || 1 })
          }
        />
      ),
    },
    {
      title: "Tên công việc / Tiêu chuẩn kiểm tra *",
      dataIndex: "title",
      key: "title",
      width: 240,
      render: (val, record) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={val}
          size="small"
          placeholder="Nhập tên công việc..."
          onChange={(e) => onUpdateItem(record.id, { title: e.target.value })}
        />
      ),
    },
    {
      title: "Mô tả chi tiết / Phương pháp kiểm tra",
      dataIndex: "checkingMethod",
      key: "checkingMethod",
      width: 400,
      render: (val, record) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={val}
          size="small"
          placeholder="Mô tả / Phương pháp đối chiếu..."
          onChange={(e) =>
            onUpdateItem(record.id, { checkingMethod: e.target.value })
          }
        />
      ),
    },
    {
      title: "Minh chứng",
      dataIndex: "requirementType",
      key: "requirementType",
      width: 140,
      render: (val, record) => (
        <Select
          value={val || "none"}
          size="small"
          className="w-full"
          options={REQUIREMENT_TYPE_OPTIONS}
          onChange={(newType) =>
            onUpdateItem(record.id, {
              requirementType: newType as ChecklistRequirementType,
            })
          }
        />
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 100,
      render: (val, record) => (
        <Input
          value={val || ""}
          size="small"
          placeholder="Ghi chú..."
          onChange={(e) => onUpdateItem(record.id, { notes: e.target.value })}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 40,
      render: (_, record) => (
        <Popconfirm
          title="Xóa dòng này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => onDeleteItem(record.id)}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 className="size-4" />}
          />
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-base font-medium text-foreground">
          <ListChecks className="size-4 text-primary" />
          <span>Hạng mục kiểm tra ({items.length})</span>
        </div>
        <Button
          type="dashed"
          size="small"
          icon={<Plus className="size-3.5" />}
          onClick={onAddItem}
        >
          Thêm dòng
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={itemColumns}
        dataSource={items}
        pagination={false}
        size="small"
        scroll={{ y: 300 }}
        className="border border-border rounded-md"
      />
    </div>
  )
}
