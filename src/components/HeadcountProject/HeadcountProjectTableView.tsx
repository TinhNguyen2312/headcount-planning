"use client"

import {
  Button,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  Building2,
  CheckCircle2,
  Edit,
  ExternalLink,
  MapPin,
  PauseCircle,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import { headcountProjectQueries } from "@/hooks/server/headcountProjects"
import type { HeadcountProjectResponse, ProjectStatus } from "@/types"

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
  const [keyword, setKeyword] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  const [editingNoteRecord, setEditingNoteRecord] =
    useState<HeadcountProjectResponse | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")

  const { data: headcountProjects = [], isLoading } =
    headcountProjectQueries.useList()
  const updateMutation = headcountProjectQueries.useUpdate()
  const deleteMutation = headcountProjectQueries.useDelete()

  const filteredProjects = useMemo(() => {
    return headcountProjects.filter((item) => {
      if (activeFilter === "ACTIVE" && !item.isActive) return false
      if (activeFilter === "INACTIVE" && item.isActive) return false

      if (keyword.trim()) {
        const lower = keyword.toLowerCase()
        const matchName = item.project?.name?.toLowerCase().includes(lower)
        const matchCode = item.project?.code?.toLowerCase().includes(lower)
        const matchNote = item.note?.toLowerCase().includes(lower)
        const matchRegion = item.project?.regionName
          ?.toLowerCase()
          .includes(lower)
        if (!matchName && !matchCode && !matchNote && !matchRegion) return false
      }
      return true
    })
  }, [headcountProjects, activeFilter, keyword])

  const activeCount = useMemo(
    () => headcountProjects.filter((p) => p.isActive).length,
    [headcountProjects],
  )

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
      title: "Mã & Tên dự án",
      key: "projectName",
      width: 280,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
              onClick={() => router.push(`/projects/${record.projectId}/edit`)}
            >
              {record.project?.name || `Dự án #${record.projectId}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {record.project?.code && (
              <Tag className="text-[11px] font-mono m-0">
                {record.project.code}
              </Tag>
            )}
            {record.project?.address && (
              <span
                className="text-xs text-muted-foreground truncate max-w-[200px]"
                title={record.project.address}
              >
                {record.project.address}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Khu vực / Vùng",
      key: "region",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-xs">
          {record.project?.regionName && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px]">Vùng:</span>
              <span className="font-medium text-foreground">
                {record.project.regionName}
              </span>
            </div>
          )}
          {record.project?.sectorName && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px]">
                Khu vực:
              </span>
              <span className="text-muted-foreground">
                {record.project.sectorName}
              </span>
            </div>
          )}
          {!record.project?.regionName && !record.project?.sectorName && (
            <span className="text-muted-foreground">—</span>
          )}
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
      title: "Kích hoạt chạy định biên",
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
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border border-border/60">
        <Input
          placeholder="Tìm theo tên dự án, mã, ghi chú..."
          prefix={<Search className="size-4 text-muted-foreground" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-72"
          allowClear
        />

        <Select
          value={activeFilter}
          onChange={setActiveFilter}
          className="w-48"
          options={[
            { value: "ALL", label: "Tất cả trạng thái ĐB" },
            { value: "ACTIVE", label: "Đang áp dụng định biên" },
            { value: "INACTIVE", label: "Tạm dừng định biên" },
          ]}
        />

        {(keyword || activeFilter !== "ALL") && (
          <Button
            type="dashed"
            icon={<RotateCcw className="size-3.5" />}
            onClick={() => {
              setKeyword("")
              setActiveFilter("ALL")
            }}
          >
            Đặt lại
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Đang áp dụng:{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {activeCount}
            </strong>
            /{headcountProjects.length} dự án
          </span>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table
          rowKey="id"
          dataSource={filteredProjects}
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

      {/* Quick Edit Note Modal */}
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
            {editingNoteRecord?.project?.code &&
              `(${editingNoteRecord.project.code})`}
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
