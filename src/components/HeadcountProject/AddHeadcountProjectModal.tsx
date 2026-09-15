"use client"

import { Form, Input, Modal, Select, Switch } from "antd"
import { Building2 } from "lucide-react"
import React, { useEffect } from "react"
import { headcountProjectQueries } from "@/hooks/server/headcountProjects"
import { applyApiFieldErrors } from "@/lib/errors"
import type { HeadcountProjectCreatePayload } from "@/types"

export interface AddHeadcountProjectModalProps {
  open: boolean
  onCancel: () => void
}

export const AddHeadcountProjectModal: React.FC<
  AddHeadcountProjectModalProps
> = ({ open, onCancel }) => {
  const [form] = Form.useForm()
  const createMutation = headcountProjectQueries.useCreate()
  const { data: availableProjects = [], isLoading: isLoadingProjects } =
    headcountProjectQueries.useAvailableProjects()

  useEffect(() => {
    if (open) {
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        note: "",
      })
    }
  }, [open, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: HeadcountProjectCreatePayload = {
        projectId: values.projectId,
        isActive: Boolean(values.isActive),
        note: values.note?.trim() || null,
      }

      await createMutation.mutateAsync(payload)
      onCancel()
    } catch (error: any) {
      applyApiFieldErrors(form, error)
    }
  }

  const projectOptions = availableProjects.map((p) => ({
    value: p.id,
    label: `${p.name} ${p.code ? `(${p.code})` : ""}${
      p.regionName ? ` - ${p.regionName}` : ""
    }`,
  }))

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <span>Kích hoạt dự án chạy định biên</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Kích hoạt dự án"
      cancelText="Hủy"
      confirmLoading={createMutation.isPending}
      destroyOnClose
      width={540}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item
          name="projectId"
          label="Dự án tham gia định biên"
          rules={[{ required: true, message: "Vui lòng chọn dự án" }]}
        >
          <Select
            placeholder="Chọn dự án từ danh mục..."
            options={projectOptions}
            loading={isLoadingProjects}
            showSearch
            optionFilterProp="label"
            notFoundContent={
              isLoadingProjects
                ? "Đang tải danh sách dự án..."
                : "Không còn dự án nào khả dụng (tất cả đã được kích hoạt)"
            }
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái chạy định biên"
          valuePropName="checked"
          tooltip="Nếu bật, dự án sẽ lập tức tham gia vào bài toán tính toán và báo cáo định biên"
        >
          <Switch
            checkedChildren="Đang áp dụng"
            unCheckedChildren="Tạm dừng"
            className="bg-muted"
          />
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú nghiệp vụ"
          tooltip="Ghi chú về phân kỳ triển khai hoặc mục đích chạy định biên của dự án"
        >
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Dự án trọng điểm 2026, chạy định biên phân kỳ 1..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
