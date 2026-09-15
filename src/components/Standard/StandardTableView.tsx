"use client"

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
import { Edit, RotateCcw, Search, Trash2 } from "lucide-react"
import React, { useMemo, useState } from "react"
import { milestoneQueries } from "@/hooks/server/milestones"
import { roleQueries } from "@/hooks/server/roles"
import { standardQueries } from "@/hooks/server/standards"
import type { HeadcountStandardResponse } from "@/types"
import { formatCriteriaDisplay } from "./criteriaRules"

interface StandardTableViewProps {
  onEditStandard: (standard: HeadcountStandardResponse) => void
}
export const StandardTableView: React.FC<StandardTableViewProps> = ({
  onEditStandard,
}) => {
  const [keyword, setKeyword] = useState("")
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    undefined,
  )
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    number | undefined
  >(undefined)

  const { data: standards = [], isLoading } = standardQueries.useList()
  const { data: roles = [] } = roleQueries.useList({ limit: 500 })
  const { data: milestones = [] } = milestoneQueries.useList({ limit: 500 })
  const deleteMutation = standardQueries.useDelete()

  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        value: r.id,
        label: `${r.name}`,
      })),
    [roles],
  )

  const milestoneOptions = useMemo(
    () =>
      milestones.map((m) => ({
        value: m.id,
        label: `${m.name}`,
      })),
    [milestones],
  )

  const filteredStandards = useMemo(() => {
    return standards.filter((item) => {
      if (selectedRoleId && item.roleId !== selectedRoleId) return false
      if (selectedMilestoneId) {
        const matchFrom = item.fromMilestoneId === selectedMilestoneId
        const matchTo = item.toMilestoneId === selectedMilestoneId
        if (!matchFrom && !matchTo) return false
      }
      if (keyword.trim()) {
        const lower = keyword.toLowerCase()
        const matchRole =
          item.role?.name?.toLowerCase().includes(lower) ||
          item.role?.code?.toLowerCase().includes(lower)
        const matchFromMilestone =
          item.fromMilestone?.name?.toLowerCase().includes(lower) ||
          item.fromMilestone?.code?.toLowerCase().includes(lower)
        const matchToMilestone =
          item.toMilestone?.name?.toLowerCase().includes(lower) ||
          item.toMilestone?.code?.toLowerCase().includes(lower)
        const matchNote = item.note?.toLowerCase().includes(lower)
        if (
          !matchRole &&
          !matchFromMilestone &&
          !matchToMilestone &&
          !matchNote
        )
          return false
      }
      return true
    })
  }, [standards, selectedRoleId, selectedMilestoneId, keyword])

  const columns: ColumnsType<HeadcountStandardResponse> = [
    {
      title: "Chức danh định biên",
      key: "role",
      width: 240,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <span>{record.role?.name}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Giai đoạn",
      key: "milestone",
      width: 290,
      render: (_, record) => {
        const fromLabel = record.fromMilestone?.name
        const toLabel = record.toMilestone?.name || "Toàn bộ dự án"
        const fromLead = record.fromLeadTimeMonths || 0
        const toLead = record.toLeadTimeMonths || 0

        return (
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {fromLead > 0 && (
              <Tag
                color="orange"
                className="text-[11px] font-semibold m-0"
                title={`Vào trước mốc bắt đầu ${fromLead} tháng`}
              >
                -{fromLead}T
              </Tag>
            )}
            <span className="font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {fromLabel}
            </span>

            <span className="text-muted-foreground text-xs">{" đến "}</span>

            <span className="font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {toLabel}
            </span>
            {toLead > 0 && (
              <Tag
                color="purple"
                className="text-[11px] font-semibold m-0"
                title={`Giữ lại sau mốc kết thúc ${toLead} tháng`}
              >
                +{toLead}T
              </Tag>
            )}
          </div>
        )
      },
    },
    {
      title: "Khung định biên",
      key: "headcount",
      width: 170,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-primary">
              {record.headcount}
            </span>
            <span className="text-base text-muted-foreground font-medium">
              nhân sự
            </span>
          </div>
          {(record.headcountMin !== null || record.headcountMax !== null) && (
            <div className="text-base text-muted-foreground mt-0.5">
              Sàn: {record.headcountMin ?? "—"} | Trần:{" "}
              {record.headcountMax ?? "—"}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Cơ sơ sở định biên",
      key: "criteria",
      width: 260,
      render: (_, record) => {
        const list = record.criteria || []
        if (list.length === 0) {
          return (
            <Tag color="default" className="text-xs text-muted-foreground">
              Mặc định (Tất cả quy mô)
            </Tag>
          )
        }
        return (
          <div className="flex flex-col gap-1">
            {list.slice(0, 2).map((c) => (
              <Tag
                key={c.id}
                color="blue"
                className="text-xs max-w-240px truncate"
                title={formatCriteriaDisplay(c)}
              >
                {formatCriteriaDisplay(c)}
              </Tag>
            ))}
            {list.length > 2 && (
              <Tooltip
                title={
                  <div className="space-y-1">
                    {list.map((c) => (
                      <div key={c.id}>• {formatCriteriaDisplay(c)}</div>
                    ))}
                  </div>
                }
              >
                <Tag className="cursor-pointer text-xs self-start">
                  +{list.length - 2} điều kiện khác
                </Tag>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: "Hệ số tối ưu",
      key: "durationMonths",
      width: 200,
      render: (_, record) => {
        const dur = record.durationMonths || 12
        const fromLead = record.fromLeadTimeMonths || 0
        const toLead = record.toLeadTimeMonths || 0
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[11px]">
                Thời gian:
              </span>
              <Tag color="blue" className="font-semibold text-xs m-0">
                {dur} tháng
              </Tag>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground text-[11px]">
                Gối đầu:
              </span>
              {fromLead > 0 || toLead > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {fromLead > 0 && (
                    <Tag color="orange" className="text-[10px] m-0 font-medium">
                      Trước {fromLead}T
                    </Tag>
                  )}
                  {toLead > 0 && (
                    <Tag color="purple" className="text-[10px] m-0 font-medium">
                      Sau {toLead}T
                    </Tag>
                  )}
                </div>
              ) : (
                <Tag
                  color="default"
                  className="text-xs m-0 text-muted-foreground"
                >
                  Đúng mốc
                </Tag>
              )}
            </div>
          </div>
        )
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string | null) =>
        note ? (
          <span
            className="text-xs text-muted-foreground line-clamp-2"
            title={note}
          >
            {note}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa định biên">
            <Button
              type="text"
              size="small"
              icon={<Edit className="size-4 text-blue-600" />}
              onClick={() => onEditStandard(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa định biên chuẩn?"
            description="Thao tác này sẽ xóa toàn bộ điều kiện lọc và hệ số phân bổ tháng liên quan."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
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
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border border-border">
        <Input
          placeholder="Tìm theo chức danh, mốc tiến độ, ghi chú..."
          prefix={<Search className="size-4 text-muted-foreground" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-72"
          allowClear
        />

        <Select
          placeholder="Lọc theo chức danh"
          value={selectedRoleId}
          onChange={setSelectedRoleId}
          options={roleOptions}
          className="w-64"
          allowClear
          showSearch
          optionFilterProp="label"
        />

        <Select
          placeholder="Lọc theo mốc tiến độ"
          value={selectedMilestoneId}
          onChange={setSelectedMilestoneId}
          options={milestoneOptions}
          className="w-64"
          allowClear
          showSearch
          optionFilterProp="label"
        />

        {(keyword || selectedRoleId || selectedMilestoneId) && (
          <Button
            type="dashed"
            icon={<RotateCcw className="size-3.5" />}
            onClick={() => {
              setKeyword("")
              setSelectedRoleId(undefined)
              setSelectedMilestoneId(undefined)
            }}
          >
            Đặt lại
          </Button>
        )}
      </div>

      {/* Table View */}
      <Table
        loading={isLoading}
        dataSource={filteredStandards}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: ["10", "15", "30", "50"],
          showTotal: (total) => `Tổng cộng ${total} mục`,
        }}
      />
    </div>
  )
}

export default StandardTableView
