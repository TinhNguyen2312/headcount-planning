"use client"

import { DatePicker, Form, Input, Modal, Select } from "antd"
import dayjs from "dayjs"
import React, { useEffect, useMemo } from "react"

import { milestoneQueries } from "@/hooks/server/milestones"
import type { PhaseInput, PhaseResponse } from "@/types"

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
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
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

  useEffect(() => {
    if (open) {
      if (initialPhase) {
        form.setFieldsValue({
          milestoneId: initialPhase.milestoneId,
          dateRange: [
            dayjs(initialPhase.startDate),
            dayjs(initialPhase.endDate),
          ],
          description: initialPhase.description || "",
        })
      } else {
        form.resetFields()
        const today = dayjs()
        form.setFieldsValue({
          dateRange: [today, today.add(1, "month").subtract(1, "day")],
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
      const [startDate, endDate] = values.dateRange
      onSave({
        id: initialPhase?.id,
        orderIndex: initialPhase?.orderIndex ?? defaultOrderIndex,
        milestoneId: values.milestoneId,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
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
      width={560}
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

        <Form.Item
          label="Khoảng thời gian thực hiện (Từ ngày - Đến ngày)"
          name="dateRange"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn ngày bắt đầu và kết thúc giai đoạn",
            },
          ]}
        >
          <DatePicker.RangePicker
            format="DD/MM/YYYY"
            className="w-full"
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          />
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
