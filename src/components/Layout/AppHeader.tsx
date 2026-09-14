import Link from "next/link"
import {
  Avatar,
  Breadcrumb,
  type BreadcrumbProps,
  Dropdown,
  Layout,
  type MenuProps,
  message,
} from "antd"
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { ThemeToggle } from "@/components/Common/ThemeToggle"
import { getQuickLoginAccounts } from "@/constants/auth"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/lib/utils"
import type { UserResponse } from "@/types"

const { Header } = Layout

const quickAccounts = getQuickLoginAccounts()

interface AppHeaderProps {
  collapsed: boolean
  isMobile: boolean
  onToggleCollapse: () => void
  breadcrumbItems: BreadcrumbProps["items"]
  user?: UserResponse | null
  onLogout: () => void
}

export const AppHeader = ({
  collapsed,
  isMobile,
  onToggleCollapse,
  breadcrumbItems,
  user,
  onLogout,
}: AppHeaderProps) => {
  const { loginMutation } = useAuth()

  const handleQuickSwitch = (
    email: string,
    password: string,
    label: string,
  ) => {
    message.loading({
      content: `Đang chuyển sang tài khoản ${label}...`,
      key: "quick-switch",
      duration: 0,
    })
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          message.success({
            content: `Đã chuyển sang ${label}`,
            key: "quick-switch",
            duration: 1.5,
          })
          window.location.href = "/"
        },
        onError: () => {
          message.destroy("quick-switch")
        },
      },
    )
  }

  const dropdownMenuItems: MenuProps["items"] = [
    {
      key: "settings",
      icon: <Settings className="size-4" />,
      label: <Link href="/settings">Cài đặt</Link>,
    },
    ...(quickAccounts.length > 0
      ? [
          { type: "divider" as const },
          {
            key: "quick-accounts-header",
            type: "group" as const,
            label: (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                <Sparkles className="size-3" />
                Đổi tài khoản nhanh
              </span>
            ),
            children: quickAccounts.map((acc) => {
              return {
                key: `quick-${acc.email}`,
                icon: <UserCheck className="size-3.5 text-primary" />,
                label: (
                  <div className="flex flex-col py-0.5">
                    <span className="text-base font-semibold text-foreground leading-tight">
                      {acc.label}
                    </span>
                  </div>
                ),
                onClick: () => {
                  handleQuickSwitch(acc.email, acc.password, acc.label)
                },
              }
            }),
          },
        ]
      : []),
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogOut className="size-4" />,
      label: "Đăng xuất",
      danger: true,
      onClick: onLogout,
    },
  ]

  return (
    <Header className="flex h-16 items-center justify-between border-b border-border bg-background! pl-1! pr-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Đóng/mở menu"
          onClick={onToggleCollapse}
          className="flex size-8 items-center justify-center rounded-md text-lg text-foreground hover:bg-accent"
        >
          {collapsed || isMobile ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>
        <Breadcrumb className="hidden md:block" items={breadcrumbItems} />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden text-right md:block">
          <div className="text-sm font-semibold text-foreground">
            {user?.fullName ?? "Nhân sự"}
          </div>
          <div className="text-base text-muted-foreground">{user?.email}</div>
        </div>
        <Dropdown
          placement="bottomRight"
          trigger={["click"]}
          menu={{ items: dropdownMenuItems }}
        >
          <Avatar
            data-testid="user-menu"
            className="cursor-pointer bg-primary!"
          >
            {getInitials(user?.fullName || "User")}
          </Avatar>
        </Dropdown>
      </div>
    </Header>
  )
}
