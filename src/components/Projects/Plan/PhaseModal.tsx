"use client"

import { DatePicker, Form, Input, Modal, Select } from "antd"
import dayjs from "dayjs"
import { Calendar } from "lucide-react"
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

  const watchedDateRange = Form.useWatch("dateRange", form)

  const durationInfo = useMemo(() => {
    if (!watchedDateRange || !watchedDateRange[0] || !watchedDateRange[1]) {
      return null
    }
    const start = watchedDateRange[0]
    const end = watchedDateRange[1]
    const days = Math.max(1, end.diff(start, "day") + 1)
    const months = Math.max(1, Math.round(days / 30.4375))
    return {
      days,
      months,
      startFormatted: start.format("DD/MM/YYYY"),
      endFormatted: end.format("DD/MM/YYYY"),
    }
  }, [watchedDateRange])

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

        {/* Dynamic Calculation Info */}
        {durationInfo && (
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4 text-sm flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
              <Calendar className="size-4" />
              <span>Thời gian thực hiện giai đoạn:</span>
            </div>
            <div className="text-foreground ml-5 flex flex-col gap-1 text-xs sm:text-sm">
              <div>
                • Thời gian: <strong>{durationInfo.startFormatted}</strong> →{" "}
                <strong>{durationInfo.endFormatted}</strong>
              </div>
              <div className="text-muted-foreground">
                • Thời lượng:{" "}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {durationInfo.days} ngày
                </strong>{" "}
                (xấp xỉ {durationInfo.months} tháng)
              </div>
            </div>
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
