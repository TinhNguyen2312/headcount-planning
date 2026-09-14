/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Alert, Button, Form, Input } from "antd"
import { Sparkles, UserCheck } from "lucide-react"
import { useCallback, useState } from "react"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { ProjectRoleSelectionModal } from "@/components/Common/ProjectRoleSelectionModal"
import { getQuickLoginAccounts, type QuickLoginAccount } from "@/constants/auth"
import useAuth from "@/hooks/useAuth"
import { useUI } from "@/hooks/useUI"
import { extractApiErrorMessage } from "@/lib/errors"
import { authStore } from "@/stores/authStore"
import type { LocalLoginRequest, UserMeResponse } from "@/types"

const QUICK_LOGIN_ACCOUNTS = getQuickLoginAccounts()

export default function LoginPage() {
  const { loginMutation } = useAuth()
  const { showError } = useUI()
  const [form] = Form.useForm<LocalLoginRequest>()

  const [pendingUser, setPendingUser] = useState<UserMeResponse | null>(null)
  const [pendingStep, setPendingStep] = useState<"project" | "role" | null>(
    null,
  )
  const [pendingChoices, setPendingChoices] = useState<{
    projects: { id: number; name: string }[]
    roles: UserMeResponse["projects"]
  }>({ projects: [], roles: [] })

  const goHome = useCallback(() => {
    window.location.href = "/projects"
  }, [])

  const evaluateSelection = useCallback(
    (user: UserMeResponse, redirectHome: () => void) => {
      authStore.getState().setUser(user)
      if (authStore.getState().role) {
        redirectHome()
        return
      }

      const rows = user.projects ?? []
      if (rows.length === 0) {
        redirectHome()
        return
      }

      const projects = [...new Map(rows.map((r) => [r.id, r.name ?? ""]))].map(
        ([id, name]) => ({ id: id as number, name }),
      )

      if (projects.length > 1) {
        setPendingUser(user)
        setPendingStep("project")
        setPendingChoices({ projects, roles: [] })
        return
      }

      setPendingUser(user)
      setPendingStep("role")
      setPendingChoices({ projects: [], roles: rows })
    },
    [],
  )

  const handleSelectProject = (projectId: number) => {
    if (!pendingUser) return
    const rows = (pendingUser.projects ?? []).filter((r) => r.id === projectId)
    if (rows.length === 1) {
      authStore.getState().setProjectRole(rows[0])
      goHome()
      return
    }
    setPendingStep("role")
    setPendingChoices({ projects: [], roles: rows })
  }

  const handleSelectRole = (roleId: number) => {
    const row = pendingChoices.roles.find((r) => r.roleId === roleId)
    if (!row) return
    authStore.getState().setProjectRole(row)
    goHome()
  }

  const handleSubmit = async (values: LocalLoginRequest) => {
    try {
      const response = await loginMutation.mutateAsync(values)
      const userData = (response as any)?.result || response
      if (userData) {
        evaluateSelection(userData as UserMeResponse, goHome)
      } else {
        goHome()
      }
    } catch (error) {
      showError(extractApiErrorMessage(error, "Đăng nhập thất bại"))
    }
  }

  const fillQuickAccount = (account: QuickLoginAccount) => {
    form.setFieldsValue({
      email: account.email,
      password: account.password,
    })
    if (loginMutation.isError) {
      loginMutation.reset()
    }
  }

  return (
    <AuthLayout>
      {pendingStep && (
        <ProjectRoleSelectionModal
          step={pendingStep}
          projectChoices={pendingChoices.projects}
          roleChoices={pendingChoices.roles}
          onSelectProject={handleSelectProject}
          onSelectRole={handleSelectRole}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="space-y-4"
      >
        {loginMutation.isError && (
          <Alert
            type="error"
            showIcon
            title={extractApiErrorMessage(
              loginMutation.error,
              "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
            )}
            className="mb-4 w-full"
          />
        )}
        <Form.Item
          name="email"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không đúng định dạng" },
          ]}
        >
          <Input data-testid="identifier-input" placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          className="mb-0"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password data-testid="password-input" placeholder="Mật khẩu" />
        </Form.Item>

        {QUICK_LOGIN_ACCOUNTS.length > 0 && (
          <div className="my-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" />
                Nhập nhanh tài khoản
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_LOGIN_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  className="flex h-auto items-center justify-start gap-2 rounded-lg p-2 text-left shadow-2xs hover:border-primary!"
                  onClick={() => fillQuickAccount(account)}
                  title={`Email: ${account.email}`}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-base">
                    <UserCheck className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold text-foreground truncate leading-tight">
                      {account.label}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button
          type="primary"
          htmlType="submit"
          loading={loginMutation.isPending}
          block
          className="mt-1"
        >
          Đăng nhập
        </Button>
      </Form>
    </AuthLayout>
  )
}
