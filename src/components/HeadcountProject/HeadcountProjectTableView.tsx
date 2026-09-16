"use client"

import {
  Button,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  CheckCircle2,
  Edit,
  ExternalLink,
  PauseCircle,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { headcountProjectQueries } from "@/hooks/server/headcountProjects"
import type { HeadcountProjectResponse } from "@/types"

const statusLabel: Record<string, string> = {
  PLANNING: "Lên kế hoạch",
  ACTIVE: "Đang triển khai",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
}

const statusTagColor: Record<string, string> = {
  PLANNING: "default",
  ACTIVE: "blue",
  PAUSED: "orange",
  COMPLETED: "green",
}

export const HeadcountProjectTableView: React.FC = () => {
  const router = useRouter()
  const [editingNoteRecord, setEditingNoteRecord] =
    useState<HeadcountProjectResponse | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")

  const { data: headcountProjects = [], isLoading } =
    headcountProjectQueries.useList()
  const updateMutation = headcountProjectQueries.useUpdate()
  const deleteMutation = headcountProjectQueries.useDelete()

  const handleToggleActive = (
    record: HeadcountProjectResponse,
    checked: boolean,
  ) => {
    updateMutation.mutate({
      id: record.id,
      data: { isActive: checked },
    })
  }

  const handleOpenNoteModal = (record: HeadcountProjectResponse) => {
    setEditingNoteRecord(record)
    setEditingNoteValue(record.note || "")
  }

  const handleSaveNote = async () => {
    if (!editingNoteRecord) return
    await updateMutation.mutateAsync({
      id: editingNoteRecord.id,
      data: { note: editingNoteValue.trim() || null },
    })
    setEditingNoteRecord(null)
  }

  const columns: ColumnsType<HeadcountProjectResponse> = [
    {
      title: "Tên dự án",
      key: "projectName",
      width: 280,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
              onClick={() => router.push(`/projects/${record.projectId}/edit`)}
            >
              {record.project.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Tiến độ dự án",
      key: "projectStatus",
      width: 150,
      render: (_, record) => {
        const st = record.project?.status || "ACTIVE"
        return (
          <Tag color={statusTagColor[st] || "default"} className="text-xs">
            {statusLabel[st] || st}
          </Tag>
        )
      },
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={record.isActive}
            onChange={(checked) => handleToggleActive(record, checked)}
            loading={
              updateMutation.isPending &&
              updateMutation.variables?.id === record.id
            }
            checkedChildren="Đang chạy"
            unCheckedChildren="Tạm dừng"
          />
          <span className="text-xs">
            {record.isActive ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                Áp dụng
              </span>
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <PauseCircle className="size-3.5" />
                Tạm dừng
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      title: "Phương thức định biên",
      key: "isActive",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            {record.id % 2 == 0 ? "Min" : "Max"}
          </span>
        </div>
      ),
    },
    {
      title: "Ghi chú nghiệp vụ",
      key: "note",
      render: (_, record) => (
        <div className="flex items-center justify-between group max-w-sm">
          <span
            className="text-xs text-muted-foreground line-clamp-2"
            title={record.note || undefined}
          >
            {record.note || "—"}
          </span>
          <Tooltip title="Chỉnh sửa ghi chú">
            <Button
              type="text"
              size="small"
              icon={
                <Edit className="size-3.5 text-muted-foreground group-hover:text-primary" />
              }
              onClick={() => handleOpenNoteModal(record)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Mở trang chi tiết dự án">
            <Button
              type="text"
              size="small"
              icon={<ExternalLink className="size-4 text-primary" />}
              onClick={() => router.push(`/projects/${record.projectId}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="Hủy dự án định biên"
            description="Bạn có chắc chắn muốn đưa dự án này ra khỏi bài toán chạy định biên?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
          >
            <Tooltip title="Hủy kích hoạt khỏi danh mục định biên">
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 className="size-4" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table
          rowKey="id"
          dataSource={headcountProjects}
          columns={columns}
          loading={isLoading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
            showTotal: (total) => `Tổng số ${total} dự án định biên`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy dự án định biên nào"
              />
            ),
          }}
        />
      </div>

      <Modal
        title="Chỉnh sửa ghi chú chạy định biên"
        open={Boolean(editingNoteRecord)}
        onCancel={() => setEditingNoteRecord(null)}
        onOk={handleSaveNote}
        okText="Lưu ghi chú"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <div className="space-y-3 pt-2">
          <p className="text-sm text-foreground">
            Dự án: <strong>{editingNoteRecord?.project?.name}</strong>{" "}
          </p>
          <Input.TextArea
            rows={4}
            value={editingNoteValue}
            onChange={(e) => setEditingNoteValue(e.target.value)}
            placeholder="Nhập ghi chú chi tiết về mục đích chạy định biên..."
          />
        </div>
      </Modal>
    </div>
  )
}
