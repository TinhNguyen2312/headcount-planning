import {
  Button,
  Card,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Flag,
  HelpCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import React, { useMemo } from "react"

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
        title: "Tên giai đoạn",
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
        title: (
          <div className="flex items-center gap-1">
            <span>Tháng bắt đầu (Tháng thứ)</span>
            <Tooltip title="Thứ tự tháng kể từ mốc bắt đầu dự án. Ví dụ: Tháng thứ 1 là tháng khởi công dự án.">
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </Tooltip>
          </div>
        ),
        dataIndex: "startMonth",
        width: 190,
        render: (val, r) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground">
                Tháng thứ {val}
              </span>
              {r.executionType === "OVERLAPPING" && (
                <Tooltip title="Giai đoạn gối đầu: Bắt đầu trước khi giai đoạn trước hoàn tất">
                  <Tag
                    color="orange"
                    className="text-[10px] m-0 px-1 leading-4"
                  >
                    Gối đầu
                  </Tag>
                </Tooltip>
              )}
              {r.executionType === "PARALLEL" && (
                <Tooltip title="Giai đoạn chạy song song: Cùng tháng bắt đầu với giai đoạn trước">
                  <Tag
                    color="purple"
                    className="text-[10px] m-0 px-1 leading-4"
                  >
                    Song song
                  </Tag>
                </Tooltip>
              )}
            </div>
            {r.startDateCal ? (
              <span className="text-xs text-muted-foreground">
                Lịch: <strong>{r.startDateCal}</strong>
              </span>
            ) : null}
          </div>
        ),
      },
      {
        title: "Thời lượng",
        dataIndex: "durationMonths",
        width: 110,
        align: "center",
        render: (val) => (
          <span className="font-medium bg-muted/60 px-2 py-0.5 rounded text-sm">
            {val} tháng
          </span>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-1">
            <span>Tháng kết thúc (Tháng thứ)</span>
            <Tooltip title="Thứ tự tháng hoàn thành tính từ ngày bắt đầu dự án.">
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </Tooltip>
          </div>
        ),
        dataIndex: "endMonth",
        width: 180,
        align: "center",
        render: (val, r) => (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-foreground">
              Tháng thứ {val}
            </span>
            {r.endDateCal ? (
              <span className="text-xs text-muted-foreground">
                Lịch: <strong>{r.endDateCal}</strong>
              </span>
            ) : null}
          </div>
        ),
      },
      {
        title: "Dự kiến hoàn thành",
        dataIndex: "expectedDate",
        width: 160,
        render: (val, r) => (
          <div className="flex items-center gap-1">
            {val ? (
              <span className="font-medium text-foreground">{val}</span>
            ) : (
              <Tooltip title="Vui lòng thiết lập 'Ngày bắt đầu dự án' trong Thông tin chung để quy đổi ngày hoàn thành chính xác">
                <span className="text-xs text-muted-foreground italic">
                  Chưa có ngày mốc
                </span>
              </Tooltip>
            )}
            {r.isPastProjectEnd && (
              <Tooltip title="Vượt quá ngày kết thúc cam kết của dự án">
                <AlertTriangle className="size-3.5 text-amber-500" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "Chốt chặn",
        dataIndex: "isAnchor",
        width: 100,
        align: "center",
        render: (val) =>
          val ? (
            <Tooltip title="Mốc cam kết chiến lược (Anchor)">
              <Tag color="gold" className="m-0 text-xs px-2 py-0.5">
                <Flag className="size-3 inline mr-1 text-amber-600" />
                Anchor
              </Tag>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 90,
        align: "center",
        render: (_, r) =>
          !viewOnly ? (
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={
                  <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                }
                onClick={() => onEditPhase(r)}
              />
              <Popconfirm
                title="Xóa giai đoạn này?"
                onConfirm={() => onDeletePhase(r.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  type="text"
                  size="small"
                  icon={<Trash2 className="size-3.5" />}
                />
              </Popconfirm>
            </Space>
          ) : null,
      },
    ],
    [viewOnly, phases.length, onMovePhase, onEditPhase, onDeletePhase],
  )

  return (
    <Card size="small" className="p-0 overflow-hidden shadow-xs">
      {loading ? (
        <div className="p-8 text-center">
          <Spin tip="Đang tải giai đoạn..." />
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
