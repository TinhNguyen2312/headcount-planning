import { Button, Form, Input } from "antd"

import useAuth from "@/hooks/useAuth"

interface ChangePasswordFormValues {
  current_password: string
  new_password: string
  confirm_password: string
}

const ChangePassword = () => {
  const { changePasswordMutation } = useAuth()
  const [form] = Form.useForm<ChangePasswordFormValues>()

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.current_password,
        newPassword: values.new_password,
      },
      { onSuccess: () => form.resetFields() },
    )
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold py-4">Đổi mật khẩu</h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-4"
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="current_password"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password
            data-testid="current-password-input"
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="new_password"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
          ]}
        >
          <Input.Password
            data-testid="new-password-input"
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm_password"
          className="mb-0"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"))
              },
            }),
          ]}
        >
          <Input.Password
            data-testid="confirm-password-input"
            placeholder="••••••••"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={changePasswordMutation.isPending}
          className="self-start mt-2"
        >
          Cập nhật mật khẩu
        </Button>
      </Form>
    </div>
  )
}

export default ChangePassword
