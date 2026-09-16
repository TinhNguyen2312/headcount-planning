import { Form, Input, Modal, Select, Switch } from "antd"
import React, { useEffect } from "react"
import DepartmentSelect from "@/components/Common/DepartmentSelect"
import { propertyQueries } from "@/hooks/server/properties"
import { applyApiFieldErrors } from "@/lib/errors"
import {
  PROPERTY_PROJECT_TYPE_OPTIONS,
  type ProjectType,
  type PropertyCreate,
  type PropertyDataType,
  type PropertyResponse,
  type PropertyUpdate,
} from "@/types"

export interface PropertyModalProps {
  open: boolean
  onCancel: () => void
  property?: PropertyResponse | null
}

interface PropertyFormValues {
  code: string
  name: string
  description?: string | null
  unit?: string | null
  dataType: PropertyDataType
  projectType: ProjectType
  scope?: any
  options?: string[] | null
  isActive: boolean
  /** Danh sách departmentId đã chọn (rỗng = áp dụng chung tất cả) */
  departmentIds: number[]
}

const DATA_TYPE_OPTIONS: { value: PropertyDataType; label: string }[] = [
  { value: "NUMBER", label: "Số (Number)" },
  { value: "STRING", label: "Văn bản (String)" },
  { value: "BOOLEAN", label: "Đúng / Sai (Boolean)" },
  { value: "SELECT", label: "Danh sách chọn (Select)" },
]

export const PropertyModal: React.FC<PropertyModalProps> = ({
  open,
  onCancel,
  property,
}) => {
  const isEdit = Boolean(property)
  const createMutation = propertyQueries.useCreate()
  const updateMutation = propertyQueries.useUpdate()
  const [form] = Form.useForm<PropertyFormValues>()
  const selectedDataType = Form.useWatch("dataType", form)

  useEffect(() => {
    if (open) {
      if (property) {
        const pType =
          property.projectType ||
          (property.scope === "COMMON"
            ? "ALL"
            : property.scope === "PER_TYPE"
              ? "MIXED"
              : property.scope === "LOW_RISE_ONLY"
                ? "LOW_RISE"
                : property.scope === "HIGH_RISE_ONLY"
                  ? "HIGH_RISE"
                  : "ALL")
        form.setFieldsValue({
          code: property.code,
          name: property.name,
          description: property.description ?? "",
          unit: property.unit ?? "",
          dataType: property.dataType,
          projectType: pType,
          scope: pType,
          options: property.options ?? [],
          isActive: property.isActive,
          departmentIds: property.departmentIds ?? [],
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          dataType: "NUMBER",
          projectType: "ALL",
          scope: "ALL",
          isActive: true,
          options: [],
          departmentIds: [],
        })
      }
    }
  }, [open, property, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: PropertyCreate = {
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description?.trim() || null,
        unit: values.unit?.trim() || null,
        dataType: values.dataType,
        projectType: values.projectType || values.scope || "ALL",
        options:
          values.dataType === "SELECT" && values.options?.length
            ? values.options
            : null,
        isActive: values.isActive,
        departmentIds: values.departmentIds ?? [],
      }

      if (isEdit && property) {
        await updateMutation.mutateAsync({
          id: property.id,
          data: payload as PropertyUpdate,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      onCancel()
    } catch (error) {
      applyApiFieldErrors(form, error)
    }
  }

  return (
    <Modal
      title={
        isEdit
          ? `Chỉnh sửa cơ sở định biên: ${property?.name}`
          : "Thêm cơ sở định biên mới"
      }
      centered
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
      width={600}
      okText={isEdit ? "Lưu thay đổi" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Tên chỉ số / cơ sở"
            rules={[{ required: true, message: "Vui lòng nhập tên chỉ số" }]}
          >
            <Input placeholder="Ví dụ: Diện tích đất, Phân loại hình dự án..." />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã định danh"
            rules={[
              { required: true, message: "Vui lòng nhập mã định danh" },
              {
                pattern: /^[A-Z0-9_]+$/,
                message: "Chỉ cho phép ký tự in hoa, số và dấu gạch dưới",
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: LAND_AREA, CFA_AREA"
              disabled={isEdit}
              onChange={(e) =>
                form.setFieldValue("code", e.target.value.toUpperCase())
              }
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="dataType"
            label="Kiểu dữ liệu"
            rules={[{ required: true, message: "Vui lòng chọn kiểu dữ liệu" }]}
          >
            <Select options={DATA_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item name="unit" label="Đơn vị tính">
            <Input placeholder="Ví dụ: ha, m2, căn, robot..." />
          </Form.Item>
        </div>

        <Form.Item
          name="projectType"
          label="Loại dự án áp dụng"
          tooltip="Quy định chỉ số này dùng chung toàn dự án hay tách riêng theo Thấp tầng / Cao tầng"
          rules={[{ required: true, message: "Vui lòng chọn loại dự án áp dụng" }]}
        >
          <Select options={PROPERTY_PROJECT_TYPE_OPTIONS} />
        </Form.Item>

        {/* FIELD MỚI: Gán phòng ban */}
        <Form.Item
          name="departmentIds"
          label="Áp dụng cho Phòng ban"
          tooltip="Chọn phòng ban sử dụng chỉ số này khi nhập liệu dự án. Để trống = chỉ số dùng chung cho tất cả phòng ban."
        >
          <DepartmentSelect
            mode="multiple"
            placeholder="Để trống = áp dụng chung tất cả phòng ban..."
            options={property?.departments?.map((d) => ({
              value: d.departmentId,
              label: `${d.departmentCode} — ${d.departmentName}`,
              id: d.departmentId,
              name: d.departmentName,
            }))}
          />
        </Form.Item>

        {selectedDataType === "SELECT" && (
          <Form.Item
            name="options"
            label="Các giá trị lựa chọn (Options)"
            tooltip="Gõ giá trị và nhấn Enter để thêm lựa chọn"
            rules={[
              {
                required: true,
                message: "Vui lòng thêm ít nhất một giá trị lựa chọn",
              },
            ]}
          >
            <Select
              mode="tags"
              placeholder="Nhập giá trị và ấn Enter..."
              tokenSeparators={[","]}
            />
          </Form.Item>
        )}

        <Form.Item name="description" label="Mô tả / Hướng dẫn cách tính">
          <Input.TextArea
            rows={3}
            placeholder="Ghi chú giải thích ý nghĩa chỉ số hoặc cách thức thu thập dữ liệu..."
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái kích hoạt"
          valuePropName="checked"
        >
          <Switch checkedChildren="Đang dùng" unCheckedChildren="Tạm khóa" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PropertyModal
