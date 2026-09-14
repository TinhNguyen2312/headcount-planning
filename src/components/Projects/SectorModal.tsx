import { Form, Input, Modal } from "antd"
import { useEffect } from "react"
import { sectorQueries } from "@/hooks/server/sectors"
import { applyApiFieldErrors } from "@/lib/errors"
import type { SectorCreate, SectorResponse, SectorUpdate } from "@/types"

export interface SectorModalProps {
  open: boolean
  onCancel: () => void
  sector?: SectorResponse | null
}

interface SectorFormValues {
  name: string
  code?: string | null
  description?: string | null
}

export const SectorModal = ({ open, onCancel, sector }: SectorModalProps) => {
  const isEdit = Boolean(sector)
  const createMutation = sectorQueries.useCreate()
  const updateMutation = sectorQueries.useUpdate()
  const [form] = Form.useForm<SectorFormValues>()

  useEffect(() => {
    if (open) {
      if (sector) {
        form.setFieldsValue({
          name: sector.name,
          code: sector.code ?? "",
          description: sector.description ?? "",
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          name: "",
          code: "",
          description: "",
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, sector, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleClose = () => {
    form.resetFields()
    onCancel()
  }

  const onSubmit = (values: SectorFormValues) => {
    const payload: SectorCreate = {
      name: values.name.trim(),
      code: values.code?.trim().toUpperCase() || null,
      description: values.description?.trim() || null,
    }

    if (isEdit && sector) {
      updateMutation.mutate(
        {
          id: sector.id,
          data: payload as SectorUpdate,
        },
        {
          onSuccess: handleClose,
          onError: (error) => applyApiFieldErrors(form, error),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: handleClose,
        onError: (error) => applyApiFieldErrors(form, error),
      })
    }
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={form.submit}
      confirmLoading={isPending}
      okText="Lưu"
      cancelText="Hủy"
      title={isEdit ? "Chỉnh sửa khu vực" : "Thêm khu vực"}
      centered
      destroyOnHidden
      width={500}
      cancelButtonProps={{ disabled: isPending }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {isEdit
          ? `Cập nhật thông tin khu vực "${sector?.name}".`
          : "Tạo mới khu vực (Sector) để phân bổ và quản lý các vùng dự án."}
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-3.5"
      >
        <Form.Item
          label="Tên khu vực"
          name="name"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập tên khu vực" },
            { max: 100, message: "Tối đa 100 ký tự" },
          ]}
        >
          <Input placeholder="ví dụ: Khu vực Đồng Nai, Khu vực TP.HCM" />
        </Form.Item>

        <Form.Item
          label="Mã khu vực"
          name="code"
          className="mb-0"
          rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
        >
          <Input placeholder="ví dụ: KV_DNA, KV_HCM" />
        </Form.Item>

        <Form.Item label="Mô tả phạm vi" name="description" className="mb-0">
          <Input.TextArea
            rows={3}
            maxLength={300}
            showCount
            placeholder="Mô tả phạm vi địa lý hoặc phân cấp quản lý của khu vực..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SectorModal
