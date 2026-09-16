"use client"

import { Button, Select, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Edit, Eye, RotateCcw, Trash2 } from "lucide-react"
import React, { useState } from "react"
import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import { DataTable } from "@/components/Common/DataTable"
import PropertySelect from "@/components/Common/PropertySelect"
import RoleSelect from "@/components/Common/RoleSelect"
import { standardQueries } from "@/hooks/server/standards"
import { useListPageState } from "@/hooks/useListPageState"
import {
  type HeadcountStandardResponse,
  STANDARD_PROJECT_TYPE_OPTIONS,
  type StandardProjectType,
} from "@/types"
import MilestoneSelect from "../Common/MilestoneSelect"
import { formatCriteriaDisplay } from "./criteriaRules"
import { StandardModal } from "./StandardModal"

interface StandardTableViewProps {
  onEditStandard?: (standard: HeadcountStandardResponse) => void
  onViewStandard?: (standard: HeadcountStandardResponse) => void
}
export const StandardTableView: React.FC<StandardTableViewProps> = ({
  onEditStandard,
  onViewStandard,
}) => {
  const [internalViewingStandard, setInternalViewingStandard] =
    useState<HeadcountStandardResponse | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    undefined,
  )
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    number | undefined
  >(undefined)
  const [selectedProjectType, setSelectedProjectType] = useState<
    StandardProjectType | undefined
  >(undefined)
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    number | undefined
  >(undefined)

  const { page, setPage, limit, setLimit, queryParams } = useListPageState({
    persistKey: "standards-table",
    initialLimit: 15,
    initialSort: { sort: { sortBy: "id", order: "DESC" } },
    resetPageOn: `${selectedRoleId ?? ""}_${selectedMilestoneId ?? ""}_${selectedProjectType ?? ""}_${selectedPropertyId ?? ""}`,
  })

  const {
    data: standards = [],
    meta,
    isLoading,
    isFetching,
  } = standardQueries.useList(
    {
      ...queryParams,
      roleId: selectedRoleId,
      milestoneId: selectedMilestoneId,
      projectType: selectedProjectType,
      propertyId: selectedPropertyId,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  )

  const total = meta?.totalElements ?? standards.length
  const deleteMutation = standardQueries.useDelete()

  const columns: ColumnsType<HeadcountStandardResponse> = [
    {
      title: "Chức danh định biên",
      key: "role",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <span>{record.role?.name}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Loại dự án",
      key: "projectType",
      width: 130,
      render: (_, record) => {
        const type = record.projectType || "ALL"
        switch (type) {
          case "LOW_RISE":
            return (
              <Tag color="green" className="font-medium text-xs">
                Thấp tầng
              </Tag>
            )
          case "HIGH_RISE":
            return (
              <Tag color="purple" className="font-medium text-xs">
                Cao tầng
              </Tag>
            )
          case "MIXED":
            return (
              <Tag color="orange" className="font-medium text-xs">
                Hỗn hợp
              </Tag>
            )
          case "ALL":
          default:
            return (
              <Tag color="blue" className="font-medium text-xs">
                Tất cả
              </Tag>
            )
        }
      },
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
      title: "Cơ sở định biên",
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
                Dung sai:
              </span>

              <div className="flex items-center gap-1 flex-wrap">
                <Tag color="orange" className="text-xs! m-0 font-medium">
                  Trước {fromLead} T
                </Tag>
                <Tag color="purple" className="text-xs! m-0 font-medium">
                  Sau {toLead} T
                </Tag>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => {
        const actionItems: ActionMenuItem<HeadcountStandardResponse>[] = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <Eye className="size-4 text-blue-500" />,
            onClick: () => {
              if (onViewStandard) {
                onViewStandard(record)
              } else {
                setInternalViewingStandard(record)
              }
            },
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <Edit className="size-4 text-amber-500" />,
            onClick: () => onEditStandard?.(record),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa định biên",
            icon: <Trash2 className="size-4" />,
            danger: true,
            confirm: {
              title: "Xác nhận xóa định biên chuẩn?",
              content:
                "Thao tác này sẽ xóa toàn bộ điều kiện lọc và hệ số phân bổ tháng liên quan.",
              okText: "Xóa",
              cancelText: "Hủy",
              okType: "danger",
            },
            onClick: () => deleteMutation.mutate(record.id),
          },
        ]

        return <ActionMenu record={record} items={actionItems} />
      },
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border border-border">
        <div className="w-60">
          <RoleSelect
            selectedId={selectedRoleId}
            setSelectedId={(val) => setSelectedRoleId(Number(val))}
            allowClear
          />
        </div>

        <Select
          placeholder="Lọc loại dự án"
          value={selectedProjectType}
          onChange={setSelectedProjectType}
          options={STANDARD_PROJECT_TYPE_OPTIONS}
          className="w-48"
          allowClear
        />

        <div className="w-60">
          <MilestoneSelect
            selectedId={selectedMilestoneId}
            setSelectedId={(val) =>
              setSelectedMilestoneId(val != null ? Number(val) : undefined)
            }
          />
        </div>

        <div className="w-60">
          <PropertySelect
            selectedId={selectedPropertyId}
            setSelectedId={setSelectedPropertyId}
            allowClear
          />
        </div>

        {(selectedRoleId ||
          selectedMilestoneId ||
          selectedProjectType ||
          selectedPropertyId) && (
          <Button
            type="dashed"
            icon={<RotateCcw className="size-3.5" />}
            onClick={() => {
              setSelectedRoleId(undefined)
              setSelectedMilestoneId(undefined)
              setSelectedProjectType(undefined)
              setSelectedPropertyId(undefined)
            }}
          >
            Đặt lại
          </Button>
        )}
      </div>

      {/* Table View */}
      <DataTable<HeadcountStandardResponse>
        columns={columns}
        dataSource={standards}
        loading={isLoading || isFetching}
        totalItemLabel="định biên"
        rowKey="id"
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage)
            setLimit(newPageSize)
          },
        }}
      />

      {internalViewingStandard && (
        <StandardModal
          open={Boolean(internalViewingStandard)}
          standard={internalViewingStandard}
          readOnly
          onCancel={() => setInternalViewingStandard(null)}
        />
      )}
    </div>
  )
}

export default StandardTableView
