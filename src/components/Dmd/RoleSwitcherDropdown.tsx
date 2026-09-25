import { Avatar, Dropdown, message, Space, Tag, Typography } from "antd"
import {
  CheckCircle2,
  ChevronDown,
  Crown,
  Edit3,
  Lock,
  Shield,
} from "lucide-react"
import React from "react"
import { DmdRole, PERSONA_PROFILES, useDmdRole } from "@/core/auth/roleContext"

const { Text } = Typography

export const RoleSwitcherDropdown: React.FC = () => {
  const { currentRole, currentUser, switchRole, allRoles } = useDmdRole()

  const handleRoleSelect = (role: DmdRole) => {
    if (role === currentRole) return
    switchRole(role)
    const newProfile = PERSONA_PROFILES[role]
    message.success({
      content: `Đã chuyển sang góc nhìn: ${newProfile.roleName} (${newProfile.name})`,
      duration: 3,
    })
  }

  const getRoleIcon = (role: DmdRole, size = 14) => {
    switch (role) {
      case "BOM":
        return <Crown size={size} className="text-purple-500" />
      case "DMD_HEAD":
        return <Shield size={size} className="text-blue-500" />
      case "DESIGNER":
        return <Edit3 size={size} className="text-emerald-500" />
    }
  }

  const getRoleTagColor = (role: DmdRole) => {
    switch (role) {
      case "BOM":
        return "purple"
      case "DMD_HEAD":
        return "blue"
      case "DESIGNER":
        return "green"
    }
  }

  const menuItems = allRoles.map((role) => {
    const profile = PERSONA_PROFILES[role]
    const isSelected = role === currentRole

    return {
      key: role,
      onClick: () => handleRoleSelect(role),
      label: (
        <div
          className={`p-2.5 rounded-lg transition-colors w-[320px] ${
            isSelected
              ? "bg-primary/10 border border-primary/30"
              : "hover:bg-muted/50 border border-transparent"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Space size="small">
              <Avatar style={{ backgroundColor: profile.color }} size={26}>
                {profile.avatar}
              </Avatar>
              <div>
                <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  {profile.name}
                  {isSelected && (
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {profile.title}
                </div>
              </div>
            </Space>

            <Tag color={getRoleTagColor(role)} className="text-[10px] m-0">
              {role === "BOM"
                ? "BOM / AM"
                : role === "DMD_HEAD"
                  ? "DMD Head"
                  : "Specialist"}
            </Tag>
          </div>

          {/* <p className="text-[11px] text-muted-foreground/90 leading-relaxed mt-1 mb-2 line-clamp-2">
            {profile.roleDescription}
          </p> */}

          <div className="flex flex-wrap gap-1 text-[10px]">
            {role === "BOM" && (
              <>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-medium">
                  Ký duyệt AM Cổng G1-G7
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-medium">
                  Duyệt F08 Thay đổi
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-medium">
                  Phê duyệt phát sinh GTPS
                </span>
              </>
            )}
            {role === "DMD_HEAD" && (
              <>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
                  Điều phối 7 bộ môn
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
                  Duyệt thanh toán TVTK
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
                  Xuất Báo cáo GMD
                </span>
              </>
            )}
            {role === "DESIGNER" && (
              <>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                  Tick việc cá nhân tuần
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                  Giải trình RFI hiện trường
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium flex items-center gap-0.5">
                  <Lock size={9} /> Khóa quyền giải ngân
                </span>
              </>
            )}
          </div>
        </div>
      ),
    }
  })

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 cursor-pointer bg-muted/20 transition-all select-none">
        <Avatar style={{ backgroundColor: currentUser.color }} size={30}>
          {currentUser.avatar}
        </Avatar>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
            {currentUser.name}
            {getRoleIcon(currentRole, 13)}
          </div>
          <div className="text-[11px] text-muted-foreground leading-tight">
            {currentUser.title}
          </div>
        </div>

        <Tag
          color={getRoleTagColor(currentRole)}
          className="font-semibold text-xs ml-1 hidden md:inline-flex"
        >
          {currentUser.roleName.split("(")[0].trim()}
        </Tag>

        <ChevronDown size={14} className="text-muted-foreground ml-0.5" />
      </div>
    </Dropdown>
  )
}
