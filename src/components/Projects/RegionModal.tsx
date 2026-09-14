import { Form, Input, Modal, Select } from "antd"
import { useEffect, useMemo } from "react"
import { regionQueries } from "@/hooks/server/regions"
import { sectorQueries } from "@/hooks/server/sectors"
import { applyApiFieldErrors } from "@/lib/errors"
import type { RegionCreate, RegionResponse, RegionUpdate } from "@/types"

export interface RegionModalProps {
  open: boolean
  onCancel: () => void
  region?: RegionResponse | null
  defaultSectorId?: number | null
}

interface RegionFormValues {
  sectorId: number
  name: string
  code?: string | null
  description?: string | null
}

export const RegionModal = ({
  open,
  onCancel,
  region,
  defaultSectorId,
}: RegionModalProps) => {
  const isEdit = Boolean(region)
  const { data: sectors = [] } = sectorQueries.useList()

  const createMutation = regionQueries.useCreate()
  const updateMutation = regionQueries.useUpdate()
  const [form] = Form.useForm<RegionFormValues>()

  const sectorOptions = useMemo(() => {
    return (sectors || []).map((s) => ({
      value: s.id,
      label: s.code ? `${s.name} (${s.code})` : s.name,
    }))
  }, [sectors])

  useEffect(() => {
    if (open) {
      if (region) {
        form.setFieldsValue({
          sectorId: region.sectorId,
          name: region.name,
          code: region.code ?? "",
          description: region.description ?? "",
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          sectorId: defaultSectorId ?? (sectors[0]?.id as number),
          name: "",
          code: "",
          description: "",
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, region, defaultSectorId, sectors, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleClose = () => {
    form.resetFields()
    onCancel()
  }

  const onSubmit = (values: RegionFormValues) => {
    const payload: RegionCreate = {
      sectorId: values.sectorId,
      name: values.name.trim(),
      code: values.code?.trim().toUpperCase() || null,
      description: values.description?.trim() || null,
    }

    if (isEdit && region) {
      updateMutation.mutate(
        {
          id: region.id,
          data: payload as RegionUpdate,
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
      title={isEdit ? "Chỉnh sửa vùng dự án" : "Thêm vùng dự án"}
      centered
      destroyOnHidden
      width={520}
      cancelButtonProps={{ disabled: isPending }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {isEdit
          ? `Cập nhật thông tin vùng dự án "${region?.name}".`
          : "Tạo mới vùng dự án (Region) trực thuộc khu vực."}
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-3.5"
      >
        <Form.Item
          label="Khu vực trực thuộc"
          name="sectorId"
          className="mb-0"
          rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
        >
          <Select
            placeholder="Chọn khu vực trực thuộc"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={sectorOptions}
          />
        </Form.Item>

        <Form.Item
          label="Tên vùng dự án"
          name="name"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập tên vùng dự án" },
            { max: 100, message: "Tối đa 100 ký tự" },
          ]}
        >
          <Input placeholder="ví dụ: Vùng Aqua City, Vùng Phan Thiết" />
        </Form.Item>

        <Form.Item
          label="Mã vùng"
          name="code"
          className="mb-0"
          rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
        >
          <Input placeholder="ví dụ: VUNG_AQUA, VUNG_NWPT" />
        </Form.Item>

        <Form.Item
          label="Mô tả phạm vi vùng"
          name="description"
          className="mb-0"
        >
          <Input.TextArea
            rows={3}
            maxLength={300}
            showCount
            placeholder="Mô tả danh sách cụm dự án hoặc đặc thù của vùng..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RegionModal
