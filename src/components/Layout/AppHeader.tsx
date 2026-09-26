import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  Clock,
  FileCheck,
  HardHat,
  Layers,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react"
import { ThemeToggle } from "@/components/Common/ThemeToggle"
import { getQuickLoginAccounts } from "@/constants/auth"
import useAuth from "@/hooks/useAuth"
import { cn, getInitials } from "@/lib/utils"
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
  const router = useRouter()
  const pathname = usePathname() || ""
  const isTimeline = pathname.startsWith("/timeline")
  const isDmd = pathname.startsWith("/dmd")
  const isPcd = pathname.startsWith("/pcd")
  const isDrawingChecker = pathname.startsWith("/drawing-checker")
  const isHeadcount = !isTimeline && !isDmd && !isPcd && !isDrawingChecker

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
    <Header className="flex h-16 items-center justify-between border-b border-border bg-background! pl-2 pr-4 z-10">
      {/* Left: Collapse Button & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Đóng/mở menu"
          onClick={onToggleCollapse}
          className="flex size-8 items-center justify-center rounded-md text-lg text-foreground hover:bg-accent cursor-pointer"
        >
          {collapsed || isMobile ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>
        <Breadcrumb className="hidden xl:block text-xs" items={breadcrumbItems} />
      </div>

      {/* Center: Executive Penta-Module Switcher */}
      <div className="flex items-center rounded-lg bg-muted/80 p-0.5 border border-border/80 shadow-xs overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => router.push("/timeline")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            isTimeline
              ? "bg-[#2db34b] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Clock className="size-3.5" />
          <span>Master Timeline</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/dmd")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            isDmd
              ? "bg-[#2db34b] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Layers className="size-3.5" />
          <span>Quản lý Thiết kế (DMD)</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/pcd")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            isPcd
              ? "bg-[#2db34b] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <HardHat className="size-3.5" />
          <span>Quản lý Thi công (PCD)</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/drawing-checker")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            isDrawingChecker
              ? "bg-[#2db34b] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <FileCheck className="size-3.5" />
          <span>Thẩm định Bản vẽ AI</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/projects")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            isHeadcount
              ? "bg-[#2db34b] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Users className="size-3.5" />
          <span>Định biên Nhân sự</span>
        </button>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden md:block text-right">
          <div className="text-sm font-semibold text-foreground leading-tight">
            {user?.fullName ?? "Lãnh đạo Novaland"}
          </div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
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
            {getInitials(user?.fullName || "BOD")}
          </Avatar>
        </Dropdown>
      </div>
    </Header>
  )
}
