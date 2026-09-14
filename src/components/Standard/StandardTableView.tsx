"use client"

import {
  Button,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  ArrowRight,
  Edit,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react"
import React, { useMemo, useState } from "react"
import { milestoneQueries } from "@/hooks/server/milestones"
import { roleQueries } from "@/hooks/server/roles"
import { standardQueries } from "@/hooks/server/standards"
import type {
  ConditionOperator,
  HeadcountCriteriaResponse,
  HeadcountStandardResponse,
} from "@/types"
import { formatCriteriaDisplay } from "./criteriaRules"

interface StandardTableViewProps {
  onEditStandard: (standard: HeadcountStandardResponse) => void
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  "=": "=",
  "<": "<",
  "<=": "≤",
  ">": ">",
  ">=": "≥",
  BETWEEN: "trong khoảng",
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
        label: `${r.name} (${r.code || "N/A"})`,
      })),
    [roles],
  )

  const milestoneOptions = useMemo(
    () =>
      milestones.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.code})`,
      })),
    [milestones],
  )

  const filteredStandards = useMemo(() => {
    return standards.filter((item) => {
      if (selectedRoleId && item.roleId !== selectedRoleId) return false
      if (
        selectedMilestoneId &&
        item.fromMilestoneId !== selectedMilestoneId &&
        item.toMilestoneId !== selectedMilestoneId
      ) {
        return false
      }
      if (keyword.trim()) {
        const lower = keyword.toLowerCase()
        const matchRole =
          item.role?.name?.toLowerCase().includes(lower) ||
          item.role?.code?.toLowerCase().includes(lower)
        const matchMilestone =
          item.fromMilestone?.name?.toLowerCase().includes(lower) ||
          item.fromMilestone?.code?.toLowerCase().includes(lower) ||
          item.toMilestone?.name?.toLowerCase().includes(lower) ||
          item.toMilestone?.code?.toLowerCase().includes(lower)
        const matchNote = item.note?.toLowerCase().includes(lower)
        if (!matchRole && !matchMilestone && !matchNote) return false
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
            <span>{record.role?.name || `Role #${record.roleId}`}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {record.role?.departmentName && (
              <Tag color="cyan" className="text-xs m-0">
                {record.role.departmentName}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Giai đoạn tiến độ",
      key: "milestones",
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {record.fromMilestone?.name || `Mốc #${record.fromMilestoneId}`}
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
            {record.toMilestone ? (
              <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {record.toMilestone.name}
              </span>
            ) : (
              <span className="text-muted-foreground italic bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-200">
                Theo vòng đời dự án
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Định biên chuẩn",
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
      title: "Điều kiện lọc (Criteria)",
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
                className="text-xs max-w-[240px] truncate"
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
      title: "Phân bổ theo tháng",
      key: "monthlyFactors",
      width: 180,
      render: (_, record) => {
        const factors = record.monthlyFactors || []
        if (factors.length === 0) {
          return (
            <Tag color="default" className="text-xs text-muted-foreground">
              Mặc định (100%/tháng)
            </Tag>
          )
        }

        // Group by durationMonths
        const durationSet = new Set(factors.map((f) => f.durationMonths))
        return (
          <div className="flex flex-wrap gap-1">
            {Array.from(durationSet).map((duration) => (
              <Tag key={duration} color="purple" className="text-xs font-mono">
                {duration} tháng (
                {factors.filter((f) => f.durationMonths === duration).length}{" "}
                mốc)
              </Tag>
            ))}
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

  const expandedRowRender = (record: HeadcountStandardResponse) => {
    const criteriaList = record.criteria || []
    const factorsList = record.monthlyFactors || []

    return (
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-lg border border-border my-2">
        <Tabs
          defaultActiveKey="criteria"
          size="small"
          items={[
            {
              key: "criteria",
              label: (
                <span className="flex items-center gap-1.5 font-medium text-xs">
                  <SlidersHorizontal className="size-3.5" />
                  Điều kiện lọc áp dụng ({criteriaList.length})
                </span>
              ),
              children:
                criteriaList.length > 0 ? (
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={criteriaList}
                    rowKey="id"
                    columns={[
                      {
                        title: "STT",
                        key: "stt",
                        width: 50,
                        render: (_, __, index) => index + 1,
                      },
                      {
                        title: "Mã chỉ số",
                        dataIndex: ["property", "code"],
                        key: "propCode",
                        width: 150,
                        render: (code) => (
                          <span className="font-mono text-xs font-semibold text-primary">
                            {code}
                          </span>
                        ),
                      },
                      {
                        title: "Tên cơ sở định biên",
                        dataIndex: ["property", "name"],
                        key: "propName",
                      },
                      {
                        title: "Kiểu dữ liệu",
                        dataIndex: ["property", "dataType"],
                        key: "dataType",
                        width: 110,
                        render: (dt) => (
                          <Tag className="text-[10px]">{dt || "NUMBER"}</Tag>
                        ),
                      },
                      {
                        title: "Đơn vị tính",
                        dataIndex: ["property", "unit"],
                        key: "unit",
                        width: 90,
                        render: (unit) =>
                          unit ? <Tag className="text-xs">{unit}</Tag> : "—",
                      },
                      {
                        title: "Phép so sánh",
                        dataIndex: "conditionOperator",
                        key: "op",
                        width: 130,
                        render: (op: ConditionOperator) => (
                          <Tag color="processing">
                            {OPERATOR_LABELS[op] || op}
                          </Tag>
                        ),
                      },
                      {
                        title: "Giá trị áp dụng",
                        key: "val",
                        width: 180,
                        render: (_, crit: HeadcountCriteriaResponse) => {
                          if (crit.valueText) {
                            return <Tag color="blue">{crit.valueText}</Tag>
                          }
                          if (crit.conditionOperator === "BETWEEN") {
                            return `${crit.minValue ?? "?"} - ${crit.maxValue ?? "?"}`
                          }
                          return crit.minValue ?? crit.maxValue ?? "—"
                        },
                      },
                      {
                        title: "Ghi chú điều kiện",
                        dataIndex: "note",
                        key: "note",
                        render: (note) => note || "—",
                      },
                    ]}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có điều kiện lọc (Áp dụng cho mọi quy mô dự án)"
                  />
                ),
            },
            {
              key: "factors",
              label: (
                <span className="flex items-center gap-1.5 font-medium text-xs">
                  <Users className="size-3.5" />
                  Hệ số phân bổ nhân sự theo tháng ({factorsList.length})
                </span>
              ),
              children:
                factorsList.length > 0 ? (
                  <div className="space-y-3">
                    {Array.from(
                      new Set(factorsList.map((f) => f.durationMonths)),
                    ).map((duration) => {
                      const itemsInDuration = factorsList
                        .filter((f) => f.durationMonths === duration)
                        .sort((a, b) => a.monthNo - b.monthNo)
                      return (
                        <div
                          key={duration}
                          className="border border-border/70 rounded-md p-3 bg-card"
                        >
                          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                            <span>
                              Khung thời gian tiến độ: {duration} tháng
                            </span>
                            <span className="text-muted-foreground font-normal">
                              ({itemsInDuration.length} mốc tháng cấu hình)
                            </span>
                          </div>
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                            {itemsInDuration.map((f) => (
                              <div
                                key={f.monthNo}
                                className="bg-slate-100 dark:bg-slate-800 rounded p-1.5 text-center border border-border"
                              >
                                <div className="text-[10px] text-muted-foreground font-medium">
                                  T{f.monthNo}
                                </div>
                                <div className="text-xs font-bold text-primary mt-0.5">
                                  {f.factor}
                                </div>
                                <div className="text-[9px] text-muted-foreground">
                                  {(f.factor * 100).toFixed(0)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa thiết lập hệ số theo tháng (Mặc định giữ nguyên hệ số 1.0 qua các tháng)"
                  />
                ),
            },
          ]}
        />
      </div>
    )
  }

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

        <div className="ml-auto text-xs text-muted-foreground">
          Tổng số:{" "}
          <strong className="text-foreground">
            {filteredStandards.length}
          </strong>{" "}
          khung định biên
        </div>
      </div>

      {/* Table View */}
      <Table
        loading={isLoading}
        dataSource={filteredStandards}
        columns={columns}
        rowKey="id"
        expandable={{
          expandedRowRender,
          rowExpandable: (record) =>
            Boolean(
              (record.criteria && record.criteria.length > 0) ||
                (record.monthlyFactors && record.monthlyFactors.length > 0),
            ),
        }}
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
