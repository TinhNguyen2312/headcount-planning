"use client"

import { DatePicker, Form, Input, Modal, Select } from "antd"
import dayjs from "dayjs"
import { Copy } from "lucide-react"
import React, { useEffect } from "react"

import type { PlanCreatePayload, PlanResponse } from "@/types"

interface PlanVersionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: PlanCreatePayload) => Promise<void>
  existingPlans: PlanResponse[]
  loading?: boolean
  defaultClonePlanId?: number
}

export const PlanVersionModal: React.FC<PlanVersionModalProps> = ({
  open,
  onClose,
  onSubmit,
  existingPlans,
  loading = false,
  defaultClonePlanId,
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      // Suggest next version name
      const count = existingPlans.length
      const nextVersion = count < 9 ? `V0${count + 1}` : `V${count + 1}`

      form.setFieldsValue({
        versionName: nextVersion,
        validFrom: dayjs(),
        note: "",
        cloneFromPlanId: defaultClonePlanId || undefined,
      })
    }
  }, [open, existingPlans, defaultClonePlanId, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit({
        versionName: values.versionName.trim(),
        validFrom: values.validFrom.format("YYYY-MM-DD"),
        note: values.note?.trim() || null,
        cloneFromPlanId: values.cloneFromPlanId || undefined,
      })
      onClose()
    } catch {
      // Form validation error
    }
  }

  const cloneOptions = [
    { label: "Bắt đầu từ kế hoạch trống (Chưa có giai đoạn)", value: 0 },
    ...existingPlans.map((p) => ({
      label: `Sao chép giai đoạn từ: ${p.versionName} (${p.status} - ${p.phasesCount || 0} giai đoạn)`,
      value: p.id,
    })),
  ]

  return (
    <Modal
      title="Tạo phiên bản kế hoạch tiến độ mới"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Tạo phiên bản"
      cancelText="Hủy"
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="Tên phiên bản"
          name="versionName"
          rules={[
            { required: true, message: "Vui lòng nhập tên phiên bản" },
            { whitespace: true, message: "Tên phiên bản không được để trống" },
          ]}
        >
          <Input placeholder="Ví dụ: V01, V02 - Điều chỉnh tiến độ móng" />
        </Form.Item>

        <Form.Item
          label="Ngày bắt đầu hiệu lực (Valid From)"
          name="validFrom"
          rules={[{ required: true, message: "Vui lòng chọn ngày hiệu lực" }]}
        >
          <DatePicker format="DD/MM/YYYY" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Nguồn sao chép (Clone)"
          name="cloneFromPlanId"
          tooltip="Sao chép toàn bộ các giai đoạn từ một phiên bản trước để tiếp tục điều chỉnh"
        >
          <Select
            placeholder="Chọn phiên bản nguồn để nhân bản"
            options={cloneOptions}
            suffixIcon={<Copy className="size-3.5 text-muted-foreground" />}
          />
        </Form.Item>

        <Form.Item label="Ghi chú kế hoạch" name="note">
          <Input.TextArea
            rows={3}
            placeholder="Mô tả lý do lập hoặc điều chỉnh phiên bản kế hoạch này..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
