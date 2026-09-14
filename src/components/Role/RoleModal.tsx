import { Form, Input, InputNumber, Modal, Select } from "antd"
import { useEffect, useMemo } from "react"

import { departmentQueries } from "@/hooks/server/departments"
import { roleQueries } from "@/hooks/server/roles"
import { applyApiFieldErrors } from "@/lib/errors"
import {
  PLANNING_METHOD_OPTIONS,
  type PlanningMethod,
  type RoleCreate,
  type RoleResponse,
  type RoleUpdate,
} from "@/types"

export interface RoleModalProps {
  open: boolean
  onCancel: () => void
  role?: RoleResponse | null
}

interface RoleFormValues {
  name: string
  code: string
  shortCode?: string | null
  level: number
  parentRoleId?: number | null
  departmentId?: number | null
  planningMethod: PlanningMethod
  leadTimeMonths: number
  description?: string | null
}

const RoleModal = ({ open, onCancel, role }: RoleModalProps) => {
  const isEdit = Boolean(role)
  const { data: roles = [] } = roleQueries.useList()
  const { data: departments = [] } = departmentQueries.useList()

  const createMutation = roleQueries.useCreate()
  const updateMutation = roleQueries.useUpdate()
  const [form] = Form.useForm<RoleFormValues>()

  const invalidParentIds = useMemo(() => {
    if (!isEdit || !role || !roles || roles.length === 0) {
      return new Set<number>()
    }
    const childrenByParent = new Map<number, number[]>()
    for (const r of roles) {
      if (r.parentRoleId == null) continue
      const siblings = childrenByParent.get(r.parentRoleId) ?? []
      siblings.push(r.id)
      childrenByParent.set(r.parentRoleId, siblings)
    }
    const invalidIds = new Set<number>([role.id])
    const queue = [...(childrenByParent.get(role.id) ?? [])]
    while (queue.length > 0) {
      const id = queue.pop()
      if (id === undefined || invalidIds.has(id)) continue
      invalidIds.add(id)
      queue.push(...(childrenByParent.get(id) ?? []))
    }
    return invalidIds
  }, [isEdit, roles, role])

  const parentRoleOptions = useMemo(() => {
    return (roles || [])
      .filter((r) => !invalidParentIds.has(r.id))
      .map((r) => ({
        value: r.id,
        label: `${r.name} (${r.code || r.shortCode || ""})`.replace(" ()", ""),
      }))
  }, [roles, invalidParentIds])

  const departmentOptions = useMemo(() => {
    return (departments || []).map((d) => ({
      value: d.id,
      label: `${d.name}`,
    }))
  }, [departments])

  const handleParentChange = (value: unknown) => {
    if (!value) {
      form.setFieldValue("level", 1)
      return
    }
    const parent = roles.find((r) => r.id === Number(value))
    form.setFieldValue("level", parent ? (parent.level ?? 0) + 1 : 1)
  }

  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue({
          name: role.name,
          code: role.code ?? "",
          shortCode: role.shortCode,
          level: role.level ?? 1,
          parentRoleId: role.parentRoleId,
          departmentId: role.departmentId,
          planningMethod: role.planningMethod ?? "BY_PROJECT",
          leadTimeMonths: role.leadTimeMonths ?? 0,
          description: role.description,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          name: "",
          code: "",
          shortCode: null,
          level: 1,
          parentRoleId: null,
          departmentId: null,
          planningMethod: "BY_PROJECT",
          leadTimeMonths: 0,
          description: null,
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, role, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleClose = () => {
    form.resetFields()
    onCancel()
  }

  const onSubmit = (values: RoleFormValues) => {
    if (isEdit && role) {
      const updatePayload: RoleUpdate = {
        name: values.name.trim(),
        code: values.code.trim(),
        shortCode: values.shortCode?.trim() || null,
        level: values.level,
        departmentId: values.departmentId ?? null,
        parentRoleId: values.parentRoleId ?? null,
        planningMethod: values.planningMethod ?? "BY_PROJECT",
        leadTimeMonths: values.leadTimeMonths ?? 0,
        description: values.description?.trim() || null,
      }

      updateMutation.mutate(
        {
          id: role.id,
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
      const createPayload: RoleCreate = {
        name: values.name.trim(),
        code: values.code.trim(),
        shortCode: values.shortCode?.trim() || null,
        level: values.level,
        departmentId: values.departmentId ?? null,
        parentRoleId: values.parentRoleId ?? null,
        planningMethod: values.planningMethod ?? "BY_PROJECT",
        leadTimeMonths: values.leadTimeMonths ?? 0,
        description: values.description?.trim() || null,
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
      title={isEdit ? "Chỉnh sửa chức vụ" : "Thêm chức vụ"}
      centered
      destroyOnHidden
      width={620}
      cancelButtonProps={{ disabled: isPending }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {isEdit
          ? `Cập nhật thông tin của "${role?.name}".`
          : "Tạo mới chức vụ và thiết lập vị trí trong cơ cấu tổ chức."}
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-3.5"
      >
        <Form.Item
          label="Tên chức vụ"
          name="name"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập tên chức vụ" },
            { max: 100, message: "Tối đa 100 ký tự" },
          ]}
        >
          <Input placeholder="ví dụ: KTS Công trường" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Form.Item
            label="Mã chức vụ (Novator Hub)"
            name="code"
            className="mb-0 col-span-2"
            rules={[
              { required: true, message: "Vui lòng nhập mã chức vụ" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input placeholder="ví dụ: 20047387" />
          </Form.Item>

          <Form.Item
            label="Mã viết tắt"
            name="shortCode"
            className="mb-0"
            rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
          >
            <Input placeholder="ví dụ: KTS_CT" />
          </Form.Item>

          <Form.Item
            label="Cấp bậc"
            name="level"
            className="mb-0"
            rules={[{ required: true, message: "Vui lòng nhập cấp bậc" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item label="Chức vụ cha" name="parentRoleId" className="mb-0">
            <Select
              placeholder="Chọn chức vụ cha"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={parentRoleOptions}
              onChange={handleParentChange}
            />
          </Form.Item>

          <Form.Item label="Phòng ban" name="departmentId" className="mb-0">
            <Select
              placeholder="Chọn phòng ban"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={departmentOptions}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Phương thức chạy định biên"
            name="planningMethod"
            className="mb-0"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn phương thức định biên",
              },
            ]}
            tooltip="Phân nhóm định biên: Theo Khu vực (01), Theo Vùng (02) hoặc Theo Dự án (03)"
          >
            <Select
              placeholder="Chọn phương thức định biên"
              options={PLANNING_METHOD_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Dung sai tuyển dụng (Lead time)"
            name="leadTimeMonths"
            className="mb-0"
            rules={[
              { required: true, message: "Vui lòng nhập số tháng chuẩn bị" },
            ]}
            tooltip="Số tháng chuẩn bị tuyển dụng trước khi chạy định biên(ví dụ: KTS cần trước 4 tháng, GĐ PCD cần trước 1 tháng)"
          >
            <InputNumber
              min={0}
              max={36}
              className="w-full"
              addonAfter="tháng"
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả công việc" name="description" className="mb-0">
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Mô tả phạm vi trách nhiệm & chức năng nhiệm vụ..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RoleModal
