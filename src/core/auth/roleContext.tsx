/**
 * Role Context & 3-Tier Multi-Perspective Permissions for DMD Platform
 * Conforming to Novaland Design Management Governance:
 * - BOM / AM: Ban Tổng Giám Đốc / Giám Đốc Ban QLDA (AM Approver)
 * - DMD_HEAD: Trưởng Phòng Quản Lý Thiết Kế (DMD Head / Lead PIC)
 * - DESIGNER: Chuyên Gia / KTS Thiết Kế Chuyên Môn (Design Specialist)
 */

import React, { createContext, ReactNode, useContext, useState } from "react"

export type DmdRole = "BOM" | "DMD_HEAD" | "DESIGNER"

export interface UserProfile {
  id: string
  name: string
  title: string
  email: string
  avatar: string
  color: string
  role: DmdRole
  roleName: string
  roleDescription: string
  department: string
  assignedProjects: string[]
}

export interface RolePermissions {
  canApproveAM: boolean // Ký duyệt AM Cổng G1-G7
  canApprovePayment: boolean // Ký duyệt đợt thanh toán TVTK 2.5.1
  canSignF08: boolean // Ký duyệt báo cáo thay đổi thiết kế Form F08
  canTickAnyTask: boolean // Tick duyệt công việc của bất kỳ nhân sự nào
  canTickOwnTask: boolean // Tick duyệt công việc cá nhân được giao
  canExportGmdReport: boolean // Xuất Báo cáo tuần tổng hợp gửi GMD
  canManageContracts: boolean // Quản lý hợp đồng & xử lý phát sinh
}

export const PERSONA_PROFILES: Record<DmdRole, UserProfile> = {
  BOM: {
    id: "user-bom-01",
    name: "Ông Lê Văn Hùng",
    title: "Giám Đốc Ban QLDA (AM Approver)",
    email: "hung.levan@novaland.com.vn",
    avatar: "AM",
    color: "#722ed1",
    role: "BOM",
    roleName: "Ban Tổng Giám Đốc (BOM / AM)",
    roleDescription:
      "Phê duyệt cấp cao nhất: ký duyệt AM Cổng G1-G7, ký duyệt Báo cáo thay đổi Form F08, phê duyệt phát sinh hợp đồng & xem báo cáo tổng hợp GMD.",
    department: "Ban Tổng Giám Đốc / Ban QLDA",
    assignedProjects: ["aqua-city", "novaworld-pt", "grand-marina"],
  },
  DMD_HEAD: {
    id: "user-dmd-01",
    name: "KTS. Hoàng Minh Trí",
    title: "Trưởng Phòng Quản Lý Thiết Kế",
    email: "tri.hoangminh@novaland.com.vn",
    avatar: "TK",
    color: "#1677ff",
    role: "DMD_HEAD",
    roleName: "Trưởng Phòng QLTK (DMD Head)",
    roleDescription: "",
    department: "Phòng Quản Lý Thiết Kế (DMD)",
    assignedProjects: ["aqua-city", "novaworld-pt"],
  },
  DESIGNER: {
    id: "user-des-01",
    name: "KTS. Trần Hải Đăng",
    title: "Chuyên Gia Thiết Kế Kiến Trúc",
    email: "dang.tranhai@novaland.com.vn",
    avatar: "KT",
    color: "#2db34b",
    role: "DESIGNER",
    roleName: "Chuyên Gia KTS Thiết Kế (Specialist)",
    roleDescription:
      "Thực hiện công việc tuần cá nhân, phát hành hồ sơ bản vẽ Revision, xử lý RFI hiện trường PCD và theo dõi điểm KPI SMART cá nhân.",
    department: "Tổ Kiến Trúc - Phòng QLTK",
    assignedProjects: ["aqua-city"],
  },
}

export const ROLE_PERMISSIONS: Record<DmdRole, RolePermissions> = {
  BOM: {
    canApproveAM: true,
    canApprovePayment: true,
    canSignF08: true,
    canTickAnyTask: false, // Chế độ giám sát, không can thiệp tick việc tác nghiệp
    canTickOwnTask: false,
    canExportGmdReport: true,
    canManageContracts: true,
  },
  DMD_HEAD: {
    canApproveAM: false, // Trình ký AM chứ không tự duyệt AM
    canApprovePayment: true,
    canSignF08: true, // Ký xác nhận kỹ thuật Form F08 trình BOM
    canTickAnyTask: true, // Toàn quyền tick duyệt công việc tuần của cả team
    canTickOwnTask: true,
    canExportGmdReport: true,
    canManageContracts: true,
  },
  DESIGNER: {
    canApproveAM: false,
    canApprovePayment: false, // Không có quyền duyệt thanh toán
    canSignF08: false, // Chỉ được lập đề xuất, không ký duyệt
    canTickAnyTask: false, // Không được tick việc của đồng nghiệp khác
    canTickOwnTask: true, // Toàn quyền tick việc của cá nhân mình
    canExportGmdReport: false,
    canManageContracts: false,
  },
}

interface RoleContextValue {
  currentRole: DmdRole
  currentUser: UserProfile
  permissions: RolePermissions
  switchRole: (role: DmdRole) => void
  allRoles: DmdRole[]
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined)

export const DmdRoleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentRole, setCurrentRole] = useState<DmdRole>("DMD_HEAD")

  const switchRole = (role: DmdRole) => {
    setCurrentRole(role)
  }

  const value: RoleContextValue = {
    currentRole,
    currentUser: PERSONA_PROFILES[currentRole],
    permissions: ROLE_PERMISSIONS[currentRole],
    switchRole,
    allRoles: ["BOM", "DMD_HEAD", "DESIGNER"],
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export const useDmdRole = (): RoleContextValue => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useDmdRole must be used within a DmdRoleProvider")
  }
  return context
}
