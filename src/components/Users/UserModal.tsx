import { Form, Input, Modal, Select } from "antd"
import { useEffect, useMemo } from "react"

import InfiniteSelect from "@/components/Common/InfiniteSelect"
import RoleSelect from "@/components/Common/RoleSelect"
import { accessRoleQueries } from "@/hooks/server/accessRoles"
import { roleQueries } from "@/hooks/server/roles"
import { userQueries } from "@/hooks/server/users"
import { applyApiFieldErrors } from "@/lib/errors"
import type { UserResponse, UserWithProjectsResponse } from "@/types"

interface UserFormValues {
  fullName: string
  phone?: string
  email?: string
  password?: string
  confirm_password?: string
  roleId?: number
  accessRoleIds?: number[]
  perNumber?: string
  departmentCode?: string
  divisionCode?: string
  managerPerNumber?: string
}

export interface UserModalProps {
  open: boolean
  onCancel: () => void
  user?: UserResponse | null
}

const UserModal = ({ open, onCancel, user }: UserModalProps) => {
  const isEdit = Boolean(user)
  const [form] = Form.useForm<UserFormValues>()
  const createMutation = userQueries.useCreate()
  const updateMutation = userQueries.useUpdate()
  const resetPasswordMutation = userQueries.useResetPassword()
  const { data: roles = [] } = roleQueries.useList()

  const { data: globalRoles = [] } = accessRoleQueries.useList({
    scope: "GLOBAL",
    limit: 100,
  })
  const { data: userAccessRoles = [] } =
    accessRoleQueries.useUserAccessRoles(user?.id, {
      enabled: isEdit && open,
    })
  const updateUserRolesMutation = accessRoleQueries.useUpdateUserRoles()

  const globalRoleOptions = useMemo(() => {
    return globalRoles.map((r) => ({
      label: `${r.name}${r.isSystem ? " (Hệ thống)" : ""}`,
      value: r.id,
    }))
  }, [globalRoles])

  const watchedRoleId = Form.useWatch("roleId", form)
  const selectedRoleId = isEdit
    ? (user?.roleId ?? watchedRoleId)
    : watchedRoleId

  const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles])

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  )
  const parentRoleId = selectedRole?.parentRoleId ?? undefined

  const managerOptions = useMemo(
    () =>
      user?.managerPerNumber
        ? [
            {
              value: user.managerPerNumber,
              label: `${user.managerName || user.managerPerNumber} - #${user.managerPerNumber}`,
            },
          ]
        : undefined,
    [user],
  )

  useEffect(() => {
    if (open) {
      if (user) {
        const assignedRoleIds = userAccessRoles.map((r) => r.id)
        form.setFieldsValue({
          fullName: user.fullName,
          perNumber: user.perNumber ?? "",
          phone: user.phone ?? "",
          email: user.email ?? "",
          managerPerNumber: user.managerPerNumber ?? undefined,
          password: "",
          confirm_password: "",
          roleId: user.roleId ?? undefined,
          accessRoleIds: assignedRoleIds,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, user, userAccessRoles, form])

  const isSyncedUser = Boolean(isEdit && user?.perNumber)
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    resetPasswordMutation.isPending ||
    updateUserRolesMutation.isPending

  const handleClose = () => {
    form.resetFields()
    onCancel()
  }

  const onSubmit = (values: UserFormValues) => {
    if (isEdit && user) {
      updateMutation.mutate(
        {
          id: user.id,
          data: {
            fullName: values.fullName.trim(),
            perNumber: values.perNumber?.trim() || null,
            phone: values.phone?.trim() || null,
            email: values.email?.trim() || null,
            managerPerNumber: values.managerPerNumber || null,
            roleId: user.roleId ?? undefined,
          },
        },
        {
          onSuccess: () => {
            if (values.accessRoleIds !== undefined) {
              updateUserRolesMutation.mutate({
                userId: user.id,
                accessRoleIds: values.accessRoleIds,
              })
            }
            if (values.password) {
              resetPasswordMutation.mutate(
                { id: user.id, data: { newPassword: values.password } },
                {
                  onSuccess: handleClose,
                  onError: (error) => {
                    applyApiFieldErrors(form, error)
                  },
                },
              )
            } else {
              handleClose()
            }
          },
          onError: (error) => {
            applyApiFieldErrors(form, error)
          },
        },
      )
    } else {
      createMutation.mutate(
        {
          fullName: values.fullName.trim(),
          perNumber: values.perNumber?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          email: values.email?.trim() ?? "",
          managerPerNumber: values.managerPerNumber || undefined,
          password: values.password || "",
          roleId: values.roleId,
        },
        {
          onSuccess: (res: any) => {
            const createdUserId = res?.data?.id
            if (
              createdUserId &&
              values.accessRoleIds &&
              values.accessRoleIds.length > 0
            ) {
              updateUserRolesMutation.mutate({
                userId: createdUserId,
                accessRoleIds: values.accessRoleIds,
              })
            }
            handleClose()
          },
          onError: (error) => {
            applyApiFieldErrors(form, error)
          },
        },
      )
    }
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={form.submit}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={isPending}
      title={isEdit ? "Sửa nhân sự" : "Thêm nhân sự"}
      centered
      width={700}
      cancelButtonProps={{ disabled: isPending }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1"
      >
        <Form.Item
          label="Mã nhân viên"
          name="perNumber"
          rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
        >
          <Input placeholder="ví dụ: 35285" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Họ tên" disabled={isSyncedUser} />
        </Form.Item>

        <Form.Item
          label="Chức danh chính"
          name="roleId"
          rules={
            isEdit
              ? []
              : [{ required: true, message: "Vui lòng chọn chức danh chính" }]
          }
        >
          <RoleSelect
            placeholder="Chọn chức danh"
            allowClear={!isEdit}
            disabled={isEdit}
          />
        </Form.Item>

        <Form.Item
          label="Quản lý trực tiếp"
          name="managerPerNumber"
          rules={[
            {
              required: Boolean(selectedRole?.parentRoleId),
              message: "Vui lòng chọn người quản lý trực tiếp",
            },
          ]}
        >
          <InfiniteSelect<UserWithProjectsResponse, string>
            placeholder="Chọn người quản lý trực tiếp"
            allowClear
            disabled={!selectedRoleId}
            options={managerOptions}
            useList={userQueries.useList}
            extraParams={{
              status: "ACTIVE",
              roleId: parentRoleId,
            }}
            filterItem={(u) => {
              if (u.status !== "ACTIVE") return false
              if (isEdit && u.id === user?.id) return false
              if (!u.perNumber) return false
              return true
            }}
            transformItem={(u) => {
              const role = u.roleId ? roleMap.get(u.roleId) : null
              return {
                value: u.perNumber!,
                label: `${u.fullName}${role ? ` (${role.name})` : ""} - #${u.perNumber}`,
                ...u,
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="Vai trò truy cập toàn cục (Global Access Roles)"
          name="accessRoleIds"
          className="col-span-full"
          tooltip="Gán vai trò phân quyền toàn hệ thống (RBAC) cho người dùng này"
        >
          <Select
            mode="multiple"
            placeholder="Chọn các vai trò toàn cục (VD: Quản trị viên, Quản trị Nhân sự...)"
            options={globalRoleOptions}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { max: 20, message: "Tối đa 20 ký tự" },
            {
              pattern: /^(0|\+84)[0-9]{9,10}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input placeholder="ví dụ: 0901234567" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          required
          rules={[
            {
              required: !isEdit,
              message: "Vui lòng nhập email",
            },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Email" type="email" />
        </Form.Item>

        <Form.Item
          label={isEdit ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
          name="password"
          rules={[
            {
              required: !isEdit,
              message: "Vui lòng nhập mật khẩu",
            },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
          ]}
        >
          <Input.Password placeholder={isEdit ? "Mật khẩu mới" : "Mật khẩu"} />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm_password"
          dependencies={["password"]}
          rules={[
            {
              required: !isEdit,
              message: "Vui lòng xác nhận mật khẩu",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const password = getFieldValue("password")
                if (!password && !value) {
                  return Promise.resolve()
                }
                if (password && !value) {
                  return Promise.reject(new Error("Vui lòng xác nhận mật khẩu"))
                }
                if (password && value !== password) {
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp"),
                  )
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input.Password
            placeholder={isEdit ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu"}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserModal
