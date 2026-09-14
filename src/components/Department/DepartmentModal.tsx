import { Form, Input, Modal, Select } from "antd"
import { useEffect, useMemo } from "react"
import { departmentQueries } from "@/hooks/server/departments"
import { applyApiFieldErrors } from "@/lib/errors"
import {
  DEPARTMENT_TYPE_OPTIONS,
  type DepartmentCreate,
  type DepartmentResponse,
  type DepartmentUpdate,
} from "@/types"

export interface DepartmentModalProps {
  open: boolean
  onCancel: () => void
  department?: DepartmentResponse | null
}

const COLOR_PRESETS = [
  { value: "#2563eb", label: "Xanh dương (Blue)" },
  { value: "#059669", label: "Xanh lá (Emerald)" },
  { value: "#7c3aed", label: "Tím (Violet)" },
  { value: "#d97706", label: "Cam vàng (Amber)" },
  { value: "#e11d48", label: "Đỏ hồng (Rose)" },
  { value: "#0891b2", label: "Xanh ngọc (Cyan)" },
  { value: "#4f46e5", label: "Chàm (Indigo)" },
  { value: "#475569", label: "Xám đá (Slate)" },
]

interface DepartmentFormValues {
  name: string
  code: string
  type: string
  level: number
  parentId?: number | null
  status: string
  description?: string | null
  color?: string | null
}

const DepartmentModal = ({
  open,
  onCancel,
  department,
}: DepartmentModalProps) => {
  const isEdit = Boolean(department)
  const { data: departments = [] } = departmentQueries.useList()

  const createMutation = departmentQueries.useCreate()
  const updateMutation = departmentQueries.useUpdate()
  const [form] = Form.useForm<DepartmentFormValues>()

  const invalidParentIds = useMemo(() => {
    if (!isEdit || !department || !departments || departments.length === 0) {
      return new Set<number>()
    }
    const childrenByParent = new Map<number, number[]>()
    for (const d of departments) {
      if (d.parentId == null) continue
      const siblings = childrenByParent.get(d.parentId) ?? []
      siblings.push(d.id)
      childrenByParent.set(d.parentId, siblings)
    }
    const invalidIds = new Set<number>([department.id])
    const queue = [...(childrenByParent.get(department.id) ?? [])]
    while (queue.length > 0) {
      const id = queue.pop()
      if (id === undefined || invalidIds.has(id)) continue
      invalidIds.add(id)
      queue.push(...(childrenByParent.get(id) ?? []))
    }
    return invalidIds
  }, [isEdit, departments, department])

  const parentOptions = useMemo(() => {
    return (departments || [])
      .filter((d) => !invalidParentIds.has(d.id))
      .map((d) => ({
        value: d.id,
        label: `${d.name} (${d.code})`,
      }))
  }, [departments, invalidParentIds])

  const handleParentChange = (value: unknown) => {
    if (!value) {
      form.setFieldValue("level", 1)
      return
    }
    const parent = departments.find((d) => d.id === Number(value))
    form.setFieldValue("level", parent ? (parent.level ?? 0) + 1 : 1)
  }

  useEffect(() => {
    if (open) {
      if (department) {
        let existingColor: string | null = null
        if (department.metadata && typeof department.metadata === "object") {
          const meta = department.metadata as Record<string, unknown>
          if (typeof meta.color === "string") existingColor = meta.color
        } else if (
          department.metadataJson &&
          typeof department.metadataJson === "object"
        ) {
          const meta = department.metadataJson as Record<string, unknown>
          if (typeof meta.color === "string") existingColor = meta.color
        }

        form.setFieldsValue({
          name: department.name,
          code: department.code,
          type: department.type || "Phòng",
          level: department.level ?? 1,
          parentId: department.parentId ?? null,
          status: department.status || "ACTIVE",
          description: department.description,
          color: existingColor,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          name: "",
          code: "",
          type: "Phòng",
          level: 1,
          parentId: null,
          status: "ACTIVE",
          description: null,
          color: null,
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, department, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleClose = () => {
    form.resetFields()
    onCancel()
  }

  const onSubmit = (values: DepartmentFormValues) => {
    const existingMeta =
      department?.metadata && typeof department.metadata === "object"
        ? (department.metadata as Record<string, unknown>)
        : {}
    const metadataPayload = values.color
      ? { ...existingMeta, color: values.color }
      : { ...existingMeta, color: null }

    if (isEdit && department) {
      const updatePayload: DepartmentUpdate = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.type,
        level: values.level,
        parentId: values.parentId ?? null,
        status: values.status,
        description: values.description?.trim() || null,
        metadata: metadataPayload,
      }

      updateMutation.mutate(
        {
          id: department.id,
          data: updatePayload,
        },
        {
          onSuccess: handleClose,
          onError: (error) => {
            applyApiFieldErrors(form, error)
          },
        },
      )
    } else {
      const createPayload: DepartmentCreate = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.type,
        level: values.level,
        parentId: values.parentId ?? null,
        status: values.status,
        description: values.description?.trim() || null,
        metadata: metadataPayload,
      }

      createMutation.mutate(createPayload, {
        onSuccess: handleClose,
        onError: (error) => {
          applyApiFieldErrors(form, error)
        },
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
      title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban"}
      centered
      destroyOnHidden
      width={560}
      cancelButtonProps={{ disabled: isPending }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {isEdit
          ? `Cập nhật thông tin của đơn vị "${department?.name}".`
          : "Tạo mới đơn vị/phòng ban trong cơ cấu tổ chức doanh nghiệp."}
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-3.5"
      >
        <Form.Item
          label="Tên phòng ban / đơn vị"
          name="name"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập tên phòng ban" },
            { max: 255, message: "Tối đa 255 ký tự" },
          ]}
        >
          <Input placeholder="ví dụ: Ban Quản lý Thiết kế" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            label="Mã phòng ban"
            name="code"
            className="mb-0 col-span-2"
            rules={[
              { required: true, message: "Vui lòng nhập mã phòng ban" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input placeholder="ví dụ: PCD" />
          </Form.Item>

          <Form.Item
            label="Loại đơn vị"
            name="type"
            className="mb-0"
            rules={[{ required: true, message: "Vui lòng chọn loại đơn vị" }]}
          >
            <Select options={DEPARTMENT_TYPE_OPTIONS} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            label="Đơn vị cấp trên trực thuộc"
            name="parentId"
            className="mb-0 col-span-2"
          >
            <Select
              placeholder="Chọn đơn vị trực thuộc (nếu có)"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={parentOptions}
              onChange={handleParentChange}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            className="mb-0"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={[
                { value: "ACTIVE", label: "Hoạt động" },
                { value: "INACTIVE", label: "Tạm dừng" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Màu chủ đề nhóm phòng ban"
          name="color"
          className="mb-0"
        >
          <Select
            placeholder="Mặc định theo hệ thống"
            allowClear
            options={COLOR_PRESETS.map((c) => ({
              value: c.value,
              label: (
                <div className="flex items-center gap-2">
                  <span
                    className="size-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <span>{c.label}</span>
                </div>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả chức năng nhiệm vụ"
          name="description"
          className="mb-0"
        >
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Mô tả chức năng, nhiệm vụ và phạm vi hoạt động của phòng ban..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DepartmentModal
