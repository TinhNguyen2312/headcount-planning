import { Card, Spin, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react"
import React, { useMemo } from "react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import type { PhaseWithMetrics } from "./types"

interface PhaseTableProps {
  loading: boolean
  phases: PhaseWithMetrics[]
  viewOnly?: boolean
  onMovePhase: (index: number, direction: "UP" | "DOWN") => void
  onEditPhase: (phase: PhaseWithMetrics) => void
  onDeletePhase: (phaseId: number) => void
}

export const PhaseTable: React.FC<PhaseTableProps> = ({
  loading,
  phases,
  viewOnly = false,
  onMovePhase,
  onEditPhase,
  onDeletePhase,
}) => {
  const columns: ColumnsType<PhaseWithMetrics> = useMemo(
    () => [
      {
        title: "Thứ tự",
        dataIndex: "orderIndex",
        width: 75,
        align: "center",
        render: (val, _, idx) => (
          <div className="flex items-center justify-center gap-1">
            <span className="font-semibold">{val}</span>
            {!viewOnly && (
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => onMovePhase(idx, "UP")}
                  className="hover:text-emerald-600 disabled:opacity-20 cursor-pointer p-0.5 leading-none"
                  title="Di chuyển lên"
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === phases.length - 1}
                  onClick={() => onMovePhase(idx, "DOWN")}
                  className="hover:text-emerald-600 disabled:opacity-20 cursor-pointer p-0.5 leading-none"
                  title="Di chuyển xuống"
                >
                  <ArrowDown className="size-3" />
                </button>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Tên mốc",
        key: "milestone",
        render: (_, r) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-foreground">
                {r.milestone?.name || `Mốc ID: ${r.milestoneId}`}
              </span>
            </div>
            {r.description && (
              <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {r.description}
              </span>
            )}
          </div>
        ),
      },
      {
        title: "Ngày bắt đầu",
        dataIndex: "startDate",
        width: 190,
        render: (val, r) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground">
                {dayjs(val).format("DD/MM/YYYY")}
              </span>
            </div>
          </div>
        ),
      },
      {
        title: "Ngày dự kiến hoàn thành",
        dataIndex: "endDate",
        width: 150,
        render: (val, r) => (
          <div>
            <div className="font-semibold text-foreground">
              {dayjs(val).format("DD/MM/YYYY")}
            </div>
            <Tag color="blue" className="font-semibold text-xs m-0 px-2 py-0.5">
              {r.durationMonths} tháng
            </Tag>
          </div>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 80,
        align: "center",
        render: (_, r) => {
          if (viewOnly) return null

          const actionItems: ActionMenuItem<PhaseWithMetrics>[] = [
            {
              key: "edit",
              label: "Chỉnh sửa",
              icon: <Pencil className="size-4 text-amber-500" />,
              onClick: (record) => onEditPhase(record),
            },
            {
              type: "divider",
            },
            {
              key: "delete",
              label: "Xóa mốc",
              icon: <Trash2 className="size-4" />,
              danger: true,
              confirm: {
                title: (record) =>
                  `Xác nhận xóa mốc "${record.milestone?.name || `Mốc #${record.orderIndex}`}"?`,
                content:
                  "Mốc này sẽ bị xóa khỏi kế hoạch dự án hiện tại. Thứ tự các mốc còn lại sẽ được tự động đánh số lại.",
                okText: "Xóa",
                cancelText: "Hủy",
                okType: "danger",
              },
              onClick: (record) => onDeletePhase(record.id),
            },
          ]

          return <ActionMenu record={r} items={actionItems} mode="inline" />
        },
      },
    ],
    [viewOnly, phases.length, onMovePhase, onEditPhase, onDeletePhase],
  )

  return (
    <Card size="small" className="p-0 overflow-hidden shadow-xs">
      {loading ? (
        <div className="p-8 text-center">
          <Spin description="Đang tải mốc..." />
        </div>
      ) : (
        <Table
          size="middle"
          dataSource={phases}
          rowKey="id"
          pagination={false}
          columns={columns}
        />
      )}
    </Card>
  )
}
