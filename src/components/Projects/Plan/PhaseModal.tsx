"use client"

import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
} from "antd"
import dayjs from "dayjs"
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
  defaultOrderIndex?: number
}

interface FormValues {
  milestoneId: number
  startDate: dayjs.Dayjs
  durationMonths: number
  description?: string
}

export const PhaseModal: React.FC<PhaseModalProps> = ({
  open,
  onClose,
  onSave,
  initialPhase,
  existingMilestoneIds,
  defaultOrderIndex = 1,
}) => {
  const [form] = Form.useForm<FormValues>()
  const { data: milestonesData = [] } = milestoneQueries.useList({ limit: 100 })

  const watchedStartDate = Form.useWatch("startDate", form)
  const watchedDuration = Form.useWatch("durationMonths", form)

  const previewEndDate = useMemo(() => {
    if (!watchedStartDate || !watchedDuration || watchedDuration < 1)
      return null
    return watchedStartDate
      .add(watchedDuration, "month")
      .subtract(1, "day")
      .format("DD/MM/YYYY")
  }, [watchedStartDate, watchedDuration])

  useEffect(() => {
    if (open) {
      if (initialPhase) {
        const start = dayjs(initialPhase.startDate)
        const end = dayjs(initialPhase.endDate)
        const dMonths =
          initialPhase.durationMonths && initialPhase.durationMonths >= 1
            ? initialPhase.durationMonths
            : Math.max(1, Math.round((end.diff(start, "day") + 1) / 30.4375))

        form.setFieldsValue({
          milestoneId: initialPhase.milestoneId,
          startDate: start,
          durationMonths: dMonths,
          description: initialPhase.description || "",
        })
      } else {
        form.resetFields()
        const today = dayjs()
        form.setFieldsValue({
          startDate: today,
          durationMonths: 1,
          description: "",
        })
      }
    }
  }, [open, initialPhase, form])

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
      const startDate = values.startDate
      const durationMonths = values.durationMonths || 1
      const endDate = startDate.add(durationMonths, "month").subtract(1, "day")

      onSave({
        id: initialPhase?.id,
        orderIndex: initialPhase?.orderIndex ?? defaultOrderIndex,
        milestoneId: values.milestoneId,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        durationMonths,
        description: values.description || null,
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
      width={540}
      destroyOnHidden
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
            showSearch={{
              filterOption: (input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
            options={milestoneOptions}
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Thời lượng"
            name="durationMonths"
            rules={[
              { required: true, message: "Vui lòng nhập thời lượng" },
              {
                type: "number",
                min: 1,
                message: "Tối thiểu 1 tháng",
              },
            ]}
          >
            <InputNumber
              min={1}
              step={1}
              addonAfter="tháng"
              className="w-full"
            />
          </Form.Item>
        </div>

        {previewEndDate && (
          <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded border border-border/60 -mt-1 mb-4 flex items-center justify-between">
            <span>Dự kiến hoàn thành giai đoạn:</span>
            <span className="font-semibold text-primary font-mono text-sm">
              {previewEndDate}
            </span>
          </div>
        )}

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

export default PhaseModal
