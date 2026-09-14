"use client"

import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
} from "antd"
import dayjs from "dayjs"
import { Flag, Info } from "lucide-react"
import React, { useEffect, useMemo } from "react"

import { milestoneQueries } from "@/hooks/server/milestones"
import type { PhaseInput, PhaseResponse } from "@/types"

const { Text } = Typography

interface PhaseModalProps {
  open: boolean
  onClose: () => void
  onSave: (phase: PhaseInput) => void
  initialPhase?: PhaseResponse | null
  existingMilestoneIds: number[]
  projectStartDate?: string | null
  defaultOrderIndex?: number
}

export const PhaseModal: React.FC<PhaseModalProps> = ({
  open,
  onClose,
  onSave,
  initialPhase,
  existingMilestoneIds,
  projectStartDate,
  defaultOrderIndex = 1,
}) => {
  const [form] = Form.useForm<PhaseInput>()
  const { data: milestonesData = [] } = milestoneQueries.useList({ limit: 100 })

  const watchedStartMonth = Form.useWatch("startMonth", form) || 1
  const watchedDuration = Form.useWatch("durationMonths", form) || 1

  const endMonth = useMemo(() => {
    return Number(watchedStartMonth) + Number(watchedDuration) - 1
  }, [watchedStartMonth, watchedDuration])

  const expectedEndDateStr = useMemo(() => {
    if (!projectStartDate) return null
    const baseDate = dayjs(projectStartDate)
    if (!baseDate.isValid()) return null
    // endMonth is 1-indexed relative to start_date month
    const targetDate = baseDate.add(endMonth - 1, "month").endOf("month")
    return targetDate.format("DD/MM/YYYY")
  }, [projectStartDate, endMonth])

  useEffect(() => {
    if (open) {
      if (initialPhase) {
        form.setFieldsValue({
          id: initialPhase.id,
          orderIndex: initialPhase.orderIndex,
          milestoneId: initialPhase.milestoneId,
          startMonth: initialPhase.startMonth,
          durationMonths: initialPhase.durationMonths,
          isAnchor: initialPhase.isAnchor,
          description: initialPhase.description || "",
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          orderIndex: defaultOrderIndex,
          startMonth: 1,
          durationMonths: 1,
          isAnchor: false,
          description: "",
        })
      }
    }
  }, [open, initialPhase, defaultOrderIndex, form])

  const milestoneOptions = useMemo(() => {
    const currentMilestoneId = initialPhase?.milestoneId
    return milestonesData.map((m) => ({
      label: `${m.code} - ${m.name}`,
      value: m.id,
      disabled:
        existingMilestoneIds.includes(m.id) && m.id !== currentMilestoneId,
    }))
  }, [milestonesData, existingMilestoneIds, initialPhase])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSave({
        ...values,
        id: initialPhase?.id,
      })
      onClose()
    } catch {
      // Form validation error
    }
  }

  return (
    <Modal
      title={initialPhase ? "Chỉnh sửa giai đoạn" : "Thêm giai đoạn mới"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Lưu giai đoạn"
      cancelText="Hủy"
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="Mốc tiến độ chuẩn (Milestone)"
          name="milestoneId"
          rules={[
            { required: true, message: "Vui lòng chọn mốc tiến độ chuẩn" },
          ]}
        >
          <Select
            placeholder="Chọn mốc tiến độ chuẩn hoàn thành giai đoạn"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={milestoneOptions}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Tháng bắt đầu (Tháng thứ)"
            name="startMonth"
            tooltip="Tháng thứ mấy của dự án giai đoạn này bắt đầu (>= 1)"
            rules={[{ required: true, message: "Vui lòng nhập tháng bắt đầu" }]}
          >
            <InputNumber min={1} max={120} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Thời lượng (Số tháng)"
            name="durationMonths"
            tooltip="Số tháng thực hiện giai đoạn (>= 1, tính tròn tháng)"
            rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
          >
            <InputNumber min={1} max={60} className="w-full" />
          </Form.Item>
        </div>

        {/* Dynamic Calculation Info */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4 text-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
            <Info className="size-4" />
            <span>Tính toán tự động theo thời lượng:</span>
          </div>
          <div className="text-muted-foreground ml-5">
            Tháng kết thúc:{" "}
            <strong className="text-foreground">Tháng {endMonth}</strong>
            {expectedEndDateStr && (
              <>
                {" "}
                (Dự kiến:{" "}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {expectedEndDateStr}
                </strong>
                )
              </>
            )}
          </div>
        </div>

        <Form.Item
          label="Mốc chốt chặn cam kết (Anchor)"
          name="isAnchor"
          valuePropName="checked"
        >
          <div className="flex items-center gap-3">
            <Switch />
            <Text type="secondary" className="text-xs">
              <Flag className="size-3.5 inline mr-1 text-amber-500" />
              Đánh dấu là mốc chốt chặn chiến lược (ví dụ: Mốc bàn giao nhà,
              hoàn công)
            </Text>
          </div>
        </Form.Item>

        <Form.Item label="Ghi chú / Phạm vi công việc" name="description">
          <Input.TextArea
            rows={2}
            placeholder="Ghi chú chi tiết về phân khu, điều kiện khởi công..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
