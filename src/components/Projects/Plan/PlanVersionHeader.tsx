import { Button, Card, Popconfirm, Select, Tag, Tooltip } from "antd"
import dayjs from "dayjs"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Copy,
  Layers,
  Plus,
  Trash2,
} from "lucide-react"
import React from "react"

import type { PlanResponse } from "@/types"

import { STATUS_TAG_COLORS } from "./types"

interface PlanVersionHeaderProps {
  plansList: PlanResponse[]
  selectedPlanId?: number
  planDetail?: PlanResponse
  projectStartDate?: string | null
  projectEndDate?: string | null
  viewOnly?: boolean
  workingPhasesCount: number
  isActivating?: boolean
  isDeleting?: boolean
  onSelectPlan: (planId: number) => void
  onActivatePlan: () => void
  onClonePlan: () => void
  onCreatePlan: () => void
  onDeletePlan: () => void
}

export const PlanVersionHeader: React.FC<PlanVersionHeaderProps> = ({
  plansList,
  selectedPlanId,
  planDetail,
  projectStartDate,
  viewOnly = false,
  workingPhasesCount,
  isActivating = false,
  isDeleting = false,
  onSelectPlan,
  onActivatePlan,
  onClonePlan,
  onCreatePlan,
  onDeletePlan,
}) => {
  return (
    <Card size="small" className="shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Layers className="size-4 text-emerald-600" />
            Phiên bản kế hoạch:
          </span>

          <Select
            className="min-w-300px!"
            value={selectedPlanId}
            onChange={(val) => onSelectPlan(val)}
            options={plansList.map((p) => ({
              label: (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.versionName}</span>
                  <Tag
                    color={STATUS_TAG_COLORS[p.status].color}
                    className="text-xs m-0"
                  >
                    {STATUS_TAG_COLORS[p.status].label}
                  </Tag>
                </div>
              ),
              value: p.id,
            }))}
          />

          {planDetail?.validFrom && (
            <span className="text-xs text-muted-foreground">
              Hiệu lực từ:{" "}
              <strong>
                {dayjs(planDetail.validFrom).format("DD/MM/YYYY")}
              </strong>
            </span>
          )}

          {projectStartDate ? (
            <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
              <Calendar className="size-3.5" />
              Mốc bắt đầu dự án (T1):{" "}
              <strong>{dayjs(projectStartDate).format("DD/MM/YYYY")}</strong>
            </span>
          ) : (
            <Tooltip title="Chưa có Ngày bắt đầu dự án. Vui lòng thiết lập ở tab 'Thông tin chung' để quy đổi sang lịch thực tế.">
              <span className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer">
                <AlertCircle className="size-3.5" />
                Chưa có ngày bắt đầu dự án (mốc T0)
              </span>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!viewOnly && planDetail?.status !== "ACTIVE" && (
            <Popconfirm
              title="Kích hoạt phiên bản này?"
              description="Khi kích hoạt, phiên bản này sẽ trở thành căn cứ chạy định biên nhân sự. Phiên bản ACTIVE hiện tại (nếu có) sẽ tự động chuyển sang trạng thái ARCHIVED."
              onConfirm={onActivatePlan}
              okText="Kích hoạt"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                icon={<CheckCircle2 className="size-6" />}
                loading={isActivating}
                disabled={workingPhasesCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Dùng kế hoạch này
              </Button>
            </Popconfirm>
          )}

          {!viewOnly && (
            <>
              <Button
                icon={<Copy className="size-4" />}
                onClick={onClonePlan}
              >
                Nhân bản
              </Button>

              <Button
                type="default"
                icon={<Plus className="size-4" />}
                onClick={onCreatePlan}
              >
                Tạo phiên bản mới
              </Button>

              {planDetail?.status !== "ACTIVE" && (
                <Popconfirm
                  title="Xóa phiên bản này?"
                  description={`Bạn có chắc muốn xóa phiên bản "${planDetail?.versionName}"? Tất cả giai đoạn thuộc phiên bản này sẽ bị xóa.`}
                  onConfirm={onDeletePlan}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    type="text"
                    icon={<Trash2 className="size-4" />}
                    loading={isDeleting}
                  />
                </Popconfirm>
              )}
            </>
          )}
        </div>
      </div>

      {planDetail?.note && (
        <div className="mt-2.5 pt-2 border-t text-xs text-muted-foreground">
          <strong>Ghi chú phiên bản:</strong> {planDetail.note}
        </div>
      )}
    </Card>
  )
}
