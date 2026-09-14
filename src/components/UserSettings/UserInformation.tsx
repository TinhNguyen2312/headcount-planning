import { Button, Form, Input } from "antd"
import { useEffect, useState } from "react"

import UnsavedChangesModal from "@/components/Common/UnsavedChangesModal"
import { userQueries } from "@/hooks/server/users"
import useAuth from "@/hooks/useAuth"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { cn } from "@/lib/utils"
import type { UserUpdate } from "@/types"

const UserInformation = () => {
  const { user } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const mutation = userQueries.useUpdate()
  const [form] = Form.useForm<UserUpdate>()

  Form.useWatch([], form)

  const {
    isDirty,
    showWarning,
    setSnapshot,
    confirmLeave,
    cancelLeave,
    markClean,
  } = useUnsavedChanges<UserUpdate>({
    getCurrentValue: () => form.getFieldsValue(true),
  })

  useEffect(() => {
    if (!user) return
    form.setFieldsValue(user)
    setSnapshot(user)
  }, [user, form, setSnapshot])

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const onCancel = () => {
    form.resetFields()
    markClean()
    setEditMode(false)
  }

  const onSubmit = (values: UserUpdate) => {
    if (!user) return
    mutation.mutate(
      {
        id: user.id,
        data: values,
      },
      {
        onSuccess: () => {
          markClean()
          setEditMode(false)
        },
      },
    )
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold py-4">Thông tin cá nhân</h3>
      <Form<UserUpdate>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-4"
        initialValues={user}
      >
        <Form.Item<UserUpdate>
          label="Họ tên"
          name="fullName"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên" },
            { max: 150, message: "Tối đa 150 ký tự" },
          ]}
        >
          {editMode ? (
            <Input />
          ) : (
            <p
              className={cn(
                "py-2 truncate max-w-sm",
                !user?.fullName && "text-muted-foreground",
              )}
            >
              {user?.fullName || "N/A"}
            </p>
          )}
        </Form.Item>

        <Form.Item<UserUpdate>
          label="Số điện thoại"
          name="phone"
          className="mb-0"
          rules={[
            { max: 20, message: "Tối đa 20 ký tự" },
            {
              pattern: /^(0|\+84)[0-9]{9,10}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          {editMode ? (
            <Input />
          ) : (
            <p className="py-2 truncate max-w-sm">{user?.phone || "N/A"}</p>
          )}
        </Form.Item>

        <Form.Item<UserUpdate>
          label="Email"
          name="email"
          className="mb-0"
          rules={[{ type: "email", message: "Email không hợp lệ" }]}
        >
          {editMode ? (
            <Input type="email" />
          ) : (
            <p className="py-2 truncate max-w-sm">{user?.email || "N/A"}</p>
          )}
        </Form.Item>

        <div className="flex gap-3 pt-2">
          {editMode ? (
            <>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
                disabled={!isDirty}
              >
                Lưu
              </Button>
              <Button onClick={onCancel} disabled={mutation.isPending}>
                Hủy
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={toggleEditMode}>
              Chỉnh sửa
            </Button>
          )}
        </div>
      </Form>

      <UnsavedChangesModal
        open={showWarning}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </div>
  )
}

export default UserInformation
