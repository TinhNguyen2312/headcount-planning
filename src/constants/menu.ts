import {
  Building2,
  LayoutDashboard,
  type LucideIcon,
  Scale,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react"
import type { AppRole } from "@/types"

export interface NavigationTarget {
  to: string
  params?: Record<string, string>
}

export interface UserNavigationContext {
  projectId?: number
  isSuperUser: boolean
}

export interface MenuItemConfig {
  key: string
  icon: LucideIcon
  label: string
  path: string
  roles?: AppRole[]
  position?: "top" | "bottom"
  shortcut?: string
  category?: string
  resolveNavigation?: (context: UserNavigationContext) => NavigationTarget
  resolveLabel?: (context: UserNavigationContext) => string
}

export const MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    label: "Trang chủ",
    path: "/",
    shortcut: "mod+alt+h",
    category: "Điều hướng",
  },
  {
    key: "user",
    icon: Users,
    label: "Nhân sự",
    path: "/user",
    roles: ["SUPER_ADMIN"],
    shortcut: "mod+alt+o",
    category: "Hệ thống",
  },
  {
    key: "projects",
    icon: Building2,
    label: "Dự án",
    path: "/projects",
    shortcut: "mod+alt+p",
    category: "Biểu mẫu",
  },
  {
    key: "admin",
    icon: Settings2,
    label: "Quản trị",
    path: "/admin",
    roles: ["SUPER_ADMIN"],
    position: "bottom",
    shortcut: "mod+alt+a",
    category: "Quản trị",
  },
  {
    key: "organization",
    icon: ShieldCheck,
    label: "Cơ cấu tổ chức",
    path: "/organization",
    roles: ["SUPER_ADMIN"],
    position: "bottom",
    shortcut: "mod+alt+r",
    category: "Quản trị",
  },
  {
    key: "standards",
    icon: Scale,
    label: "Mô hình định biên",
    path: "/standards",
    roles: ["SUPER_ADMIN"],
    position: "top",
    shortcut: "mod+alt+b",
    category: "Quản trị",
  },
  // {
  //   key: "settings",
  //   icon: Settings,
  //   label: "Cài đặt",
  //   path: "/settings",
  //   position: "bottom",
  //   shortcut: "mod+alt+,",
  //   category: "Cá nhân",
  // },
]

export const filterMenuItemsByRole = (
  items: MenuItemConfig[],
  currentRole: AppRole | null,
): MenuItemConfig[] => {
  return items.filter(
    (item) => !item.roles || (currentRole && item.roles.includes(currentRole)),
  )
}

export const findActiveMenuItem = (
  items: MenuItemConfig[],
  pathname: string,
): MenuItemConfig | undefined => {
  return items.find((item) => {
    if (item.path === "/") return pathname === "/"
    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  })
}
