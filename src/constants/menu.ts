import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Database,
  FileCheck,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderCheck,
  HardHat,
  Inbox,
  Layers,
  LayoutDashboard,
  LineChart,
  ListChecks,
  type LucideIcon,
  MapPin,
  Network,
  PlusSquare,
  Scale,
  Settings2,
  ShieldCheck,
  TableProperties,
  UserCheck,
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

/* Menu cho Phân hệ Định biên Nhân sự (Headcount Planning) */
export const HEADCOUNT_MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    label: "Trang chủ",
    path: "/",
    shortcut: "mod+alt+h",
    category: "Điều hướng",
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
    key: "user",
    icon: Users,
    label: "Nhân sự",
    path: "/user",
    roles: ["SUPER_ADMIN"],
    shortcut: "mod+alt+o",
    category: "Hệ thống",
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
  {
    key: "headcount-reports",
    icon: FileSpreadsheet,
    label: "Báo cáo định biên",
    path: "/headcount-reports",
    roles: ["SUPER_ADMIN"],
    position: "top",
    shortcut: "mod+alt+r",
    category: "Báo cáo",
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
    key: "admin",
    icon: Settings2,
    label: "Quản trị",
    path: "/admin",
    roles: ["SUPER_ADMIN"],
    position: "bottom",
    shortcut: "mod+alt+a",
    category: "Quản trị",
  },
]

/* Menu cho Phân hệ Tiến độ Tổng thể Master Timeline (SOP06) */
export const TIMELINE_MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "timeline-director",
    icon: LayoutDashboard,
    label: "Bàn làm việc Lãnh đạo",
    path: "/timeline?tab=director_hub",
    category: "Lãnh đạo",
  },
  {
    key: "timeline-workspace",
    icon: Layers,
    label: "MTL Workspace (Bước 5)",
    path: "/timeline?tab=workspace",
    category: "Tiến độ",
  },
  {
    key: "timeline-overview",
    icon: BarChart3,
    label: "Theo dõi thực hiện",
    path: "/timeline?tab=overview",
    category: "Tiến độ",
  },
  {
    key: "timeline-design",
    icon: Compass,
    label: "Quản lý Thiết kế",
    path: "/timeline?tab=design",
    category: "Tiến độ",
  },
  {
    key: "timeline-fs",
    icon: Calendar,
    label: "Phương án kinh doanh (FS)",
    path: "/timeline?tab=fs",
    category: "Kinh doanh",
  },
  {
    key: "timeline-confirm",
    icon: FileCheck2,
    label: "Xác nhận MTL (PBCM)",
    path: "/timeline?tab=confirm",
    category: "Thẩm định",
  },
  {
    key: "timeline-switch-dmd",
    icon: Layers,
    label: "Quản lý Thiết kế (DMD)",
    path: "/dmd",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "timeline-switch-checker",
    icon: FileCheck,
    label: "Thẩm định Bản vẽ AI",
    path: "/drawing-checker",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "timeline-switch-headcount",
    icon: Users,
    label: "Sang Định biên Nhân sự",
    path: "/projects",
    position: "bottom",
    category: "Điều hướng",
  },
]

/* Menu cho Phân hệ Thẩm định Hồ sơ Thiết kế AI (Arch Drawing Checker AI) */
export const DRAWING_CHECKER_MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "checker-dashboard",
    icon: LayoutDashboard,
    label: "Bảng điều khiển",
    path: "/drawing-checker",
    category: "Không gian làm việc",
  },
  {
    key: "checker-reviews",
    icon: FolderCheck,
    label: "Hồ sơ thẩm định",
    path: "/drawing-checker/reviews",
    category: "Không gian làm việc",
  },
  {
    key: "checker-rules",
    icon: BookOpenCheck,
    label: "Tiêu chuẩn CHTK",
    path: "/drawing-checker/rules",
    category: "Không gian làm việc",
  },
  {
    key: "checker-findings",
    icon: ListChecks,
    label: "Kết quả tiêu chí",
    path: "/drawing-checker/findings",
    category: "Không gian làm việc",
  },
  {
    key: "checker-zones",
    icon: MapPin,
    label: "Phân khu & Dự án",
    path: "/drawing-checker/zones",
    category: "Không gian làm việc",
  },
  {
    key: "checker-my-tasks",
    icon: CheckSquare,
    label: "Việc của tôi",
    path: "/drawing-checker/my-tasks",
    position: "bottom",
    category: "Cá nhân",
  },
  {
    key: "checker-inbox",
    icon: Inbox,
    label: "Hộp thư",
    path: "/drawing-checker/inbox",
    position: "bottom",
    category: "Cá nhân",
  },
  {
    key: "checker-members",
    icon: Users,
    label: "Thành viên",
    path: "/drawing-checker/members",
    position: "bottom",
    category: "Cá nhân",
  },
  {
    key: "checker-switch-dmd",
    icon: Layers,
    label: "Sang Quản lý Thiết kế DMD",
    path: "/dmd",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "checker-switch-timeline",
    icon: Clock,
    label: "Sang Master Timeline",
    path: "/timeline",
    position: "bottom",
    category: "Điều hướng",
  },
]

/* Menu cho Phân hệ Quản lý Thiết kế (DMD - SOP09) */
export const DMD_MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "dmd-stage-gate",
    icon: Layers,
    label: "Cổng Stage-Gate (G1–G7)",
    path: "/dmd?tab=timeline",
    category: "Quy trình SOP09",
  },
  {
    key: "dmd-competencies",
    icon: Network,
    label: "Khung Nghiệp Vụ (5–23 NV)",
    path: "/dmd?tab=competencies",
    category: "Quy trình SOP09",
  },
  {
    key: "dmd-deliverables",
    icon: FileText,
    label: "Hồ Sơ & Bản Vẽ (AFC)",
    path: "/dmd?tab=deliverables",
    category: "Quy trình SOP09",
  },
  {
    key: "dmd-cross-review",
    icon: Users,
    label: "Ma Trận Phối Hợp (SOP09)",
    path: "/dmd?tab=cross-review",
    category: "Quy trình SOP09",
  },
  {
    key: "dmd-rfi",
    icon: AlertTriangle,
    label: "Xử Lý RFI & Thay Đổi (F02)",
    path: "/dmd?tab=rfi-change",
    category: "Tác nghiệp & Kỹ thuật",
  },
  {
    key: "dmd-contracts",
    icon: Compass,
    label: "Hợp Đồng & TVTK (2.5)",
    path: "/dmd?tab=consultants",
    category: "Tác nghiệp & Kỹ thuật",
  },
  {
    key: "dmd-kpi",
    icon: CheckCircle2,
    label: "Kế Hoạch Tuần & KPI (3.1)",
    path: "/dmd?tab=kpi-work",
    category: "Tác nghiệp & Kỹ thuật",
  },
  {
    key: "dmd-standards",
    icon: FileCheck,
    label: "Thư Viện SPEC & SOP03/08",
    path: "/dmd?tab=standards",
    category: "Tác nghiệp & Kỹ thuật",
  },
  {
    key: "dmd-switch-pcd",
    icon: HardHat,
    label: "Sang Quản lý Thi công PCD",
    path: "/pcd",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "dmd-switch-timeline",
    icon: Clock,
    label: "Sang Master Timeline",
    path: "/timeline",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "dmd-switch-checker",
    icon: FileCheck2,
    label: "Sang Thẩm định Bản vẽ AI",
    path: "/drawing-checker",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "dmd-switch-headcount",
    icon: Building2,
    label: "Sang Định biên Nhân sự",
    path: "/projects",
    position: "bottom",
    category: "Điều hướng",
  },
]

/* Menu cho Phân hệ Quản lý Thi công Hiện trường (PCD - SOP07) */
export const PCD_MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "pcd-dashboard",
    icon: LineChart,
    label: "Tổng quan Thi công",
    path: "/pcd?tab=dashboard",
    category: "Hiện trường PCD",
  },
  {
    key: "pcd-my-tasks",
    icon: CheckSquare,
    label: "Công việc Hiện trường",
    path: "/pcd?tab=my-tasks",
    category: "Hiện trường PCD",
  },
  {
    key: "pcd-subordinates",
    icon: UserCheck,
    label: "Việc Cấp dưới",
    path: "/pcd?tab=subordinates",
    category: "Hiện trường PCD",
  },
  {
    key: "pcd-adhoc",
    icon: PlusSquare,
    label: "Giao việc Đột xuất",
    path: "/pcd?tab=adhoc",
    category: "Tác nghiệp Nhanh",
  },
  {
    key: "pcd-schedules",
    icon: CalendarDays,
    label: "Lịch trực & Ca Công trường",
    path: "/pcd?tab=schedules",
    category: "Lịch trình & Nhân sự",
  },
  {
    key: "pcd-checklists",
    icon: FileCheck,
    label: "Biểu Mẫu & Nghiệm Thu",
    path: "/pcd?tab=checklists",
    category: "Chất lượng & Tiêu chuẩn",
  },
  {
    key: "pcd-business-matrix",
    icon: TableProperties,
    label: "Ma Trận Nghiệp Vụ",
    path: "/pcd?tab=business-matrix",
    category: "Chất lượng & Tiêu chuẩn",
  },
  {
    key: "pcd-tracking",
    icon: MapPin,
    label: "Bản Đồ Lộ Trình GPS",
    path: "/pcd?tab=tracking",
    category: "Giám sát Thực địa",
  },
  {
    key: "pcd-acc",
    icon: Database,
    label: "Đồng Bộ ACC Cloud",
    path: "/pcd?tab=acc",
    category: "Hệ thống & BIM",
  },
  {
    key: "pcd-switch-timeline",
    icon: Clock,
    label: "Sang Master Timeline",
    path: "/timeline",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "pcd-switch-dmd",
    icon: Layers,
    label: "Sang Quản lý Thiết kế DMD",
    path: "/dmd",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "pcd-switch-checker",
    icon: FileCheck2,
    label: "Sang Thẩm định Bản vẽ AI",
    path: "/drawing-checker",
    position: "bottom",
    category: "Điều hướng",
  },
  {
    key: "pcd-switch-headcount",
    icon: Building2,
    label: "Sang Định biên Nhân sự",
    path: "/projects",
    position: "bottom",
    category: "Điều hướng",
  },
]

// Fallback & default
export const MENU_ITEMS = HEADCOUNT_MENU_ITEMS

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
  searchQuery = "",
): MenuItemConfig | undefined => {
  if (pathname.startsWith("/timeline")) {
    const active = items.find((item) => {
      if (item.path.includes("?") && searchQuery) {
        return item.path.includes(searchQuery)
      }
      return false
    })
    if (active) return active
    return items.find((item) => item.key === "timeline-director" || item.key === "timeline-workspace")
  }

  if (pathname.startsWith("/dmd")) {
    const active = items.find((item) => {
      if (item.path.includes("?") && searchQuery) {
        return item.path.includes(searchQuery)
      }
      return false
    })
    if (active) return active
    return items[0]
  }

  if (pathname.startsWith("/pcd")) {
    const active = items.find((item) => {
      if (item.path.includes("?") && searchQuery) {
        return item.path.includes(searchQuery)
      }
      return false
    })
    if (active) return active
    return items[0]
  }

  if (pathname.startsWith("/drawing-checker")) {
    // Exact or prefix match for drawing checker subroutes
    const matched = items.find((item) => {
      if (item.path === "/drawing-checker") {
        return pathname === "/drawing-checker"
      }
      return pathname.startsWith(item.path)
    })
    return matched || items[0]
  }

  return items.find((item) => {
    if (item.path === "/") return pathname === "/"
    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  })
}
