"use client"

import {
  Alert,
  Form,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
} from "antd"
import { ArrowRight, FastForward } from "lucide-react"
import React, { useMemo, useState } from "react"

import type { PhaseResponse } from "@/types"

const { Text } = Typography

interface CascadeShiftModalProps {
  open: boolean
  onClose: () => void
  phases: PhaseResponse[]
  onApplyShift: (fromOrderIndex: number, deltaMonths: number) => void
}

export const CascadeShiftModal: React.FC<CascadeShiftModalProps> = ({
  open,
  onClose,
  phases,
  onApplyShift,
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | undefined>()
  const [deltaMonths, setDeltaMonths] = useState<number>(1)

  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => a.orderIndex - b.orderIndex)
  }, [phases])

  const selectedPhase = useMemo(() => {
    return sortedPhases.find((p) => p.id === selectedPhaseId) || sortedPhases[0]
  }, [sortedPhases, selectedPhaseId])

  // Calculate preview of affected phases
  const previewData = useMemo(() => {
    if (!selectedPhase) return []
    const thresholdOrder = selectedPhase.orderIndex
    return sortedPhases
      .filter((p) => p.orderIndex >= thresholdOrder)
      .map((p) => {
        const oldStart = p.startMonth
        const newStart = Math.max(1, oldStart + deltaMonths)
        const oldEnd = oldStart + p.durationMonths - 1
        const newEnd = newStart + p.durationMonths - 1
        return {
          id: p.id,
          orderIndex: p.orderIndex,
          milestoneName: p.milestone?.name || `Mốc ${p.milestoneId}`,
          durationMonths: p.durationMonths,
          oldStart,
          oldEnd,
          newStart,
          newEnd,
        }
      })
  }, [sortedPhases, selectedPhase, deltaMonths])

  const handleOk = () => {
    if (!selectedPhase || deltaMonths === 0) {
      onClose()
      return
    }
    onApplyShift(selectedPhase.orderIndex, deltaMonths)
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FastForward className="size-5 text-emerald-600" />
          <span>Tịnh tiến tiến độ (Cascade Delta Shift)</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Áp dụng tịnh tiến"
      cancelText="Hủy"
      width={680}
      destroyOnClose
    >
      <div className="flex flex-col gap-4 mt-3">
        <Alert
          message="Cơ chế bảo toàn độ gối đầu"
          description="Hệ thống sẽ tịnh tiến tháng bắt đầu của giai đoạn được chọn cùng toàn bộ các giai đoạn phía sau thêm Δ tháng. Khoảng cách gối đầu và quan hệ song song giữa các giai đoạn được bảo toàn nguyên vẹn."
          type="info"
          showIcon
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Bắt đầu tịnh tiến từ giai đoạn:
            </label>
            <Select
              className="w-full"
              value={selectedPhase?.id}
              onChange={(val) => setSelectedPhaseId(val)}
              options={sortedPhases.map((p) => ({
                label: `GĐ ${p.orderIndex}: ${p.milestone?.name || p.milestoneId} (Tháng ${p.startMonth})`,
                value: p.id,
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Số tháng dịch chuyển (Δ tháng):
            </label>
            <InputNumber
              className="w-full"
              value={deltaMonths}
              onChange={(val) => setDeltaMonths(val ?? 0)}
              min={-24}
              max={24}
              placeholder="+2 (trễ) hoặc -1 (sớm)"
            />
            <span className="text-xs text-muted-foreground mt-0.5 block">
              Dương (+) dịch lùi tiến độ, Âm (-) đẩy sớm tiến độ
            </span>
          </div>
        </div>

        {/* Live Preview Table */}
        <div className="border rounded-lg overflow-hidden mt-2">
          <div className="bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Xem trước thay đổi ({previewData.length} giai đoạn bị ảnh hưởng)
          </div>
          <Table
            size="small"
            pagination={false}
            dataSource={previewData}
            rowKey="id"
            columns={[
              {
                title: "STT",
                dataIndex: "orderIndex",
                width: 60,
                align: "center",
              },
              {
                title: "Giai đoạn (Milestone)",
                dataIndex: "milestoneName",
                ellipsis: true,
              },
              {
                title: "Thời lượng",
                dataIndex: "durationMonths",
                width: 90,
                align: "center",
                render: (val) => `${val}T`,
              },
              {
                title: "Tiến độ cũ",
                key: "old",
                width: 140,
                render: (_, r) => (
                  <Text type="secondary">
                    T{r.oldStart} → T{r.oldEnd}
                  </Text>
                ),
              },
              {
                title: "Tiến độ mới",
                key: "new",
                width: 170,
                render: (_, r) => (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span>
                      T{r.newStart} → T{r.newEnd}
                    </span>
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  )
}
