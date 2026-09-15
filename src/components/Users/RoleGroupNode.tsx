import { Card, Tag, Tooltip } from "antd"
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  UserX,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import type { RoleResponse } from "@/types"

export const USER_ROLE_CARD_WIDTH = 270

export interface AssignedUserItem {
  id: number
  fullName: string
  email?: string | null
  phone?: string | null
  status?: string
  isMultiProject?: boolean
}

export interface UserRoleNodeProps {
  role: RoleResponse
  users: AssignedUserItem[]
  childCount?: number
  expanded?: boolean
  onToggleExpand?: () => void
  isHighlighted?: boolean
}

export const calculateUserRoleNodeHeight = (userCount: number): number => {
  if (userCount <= 0) return 105
  return 80 + userCount * 38
}

export const UserRoleNode = ({
  role,
  users = [],
  childCount = 0,
  expanded = true,
  onToggleExpand,
  isHighlighted = false,
}: UserRoleNodeProps) => {
  const isVacancy = users.length === 0
  const height = calculateUserRoleNodeHeight(users.length)

  return (
    <Card
      style={{ width: USER_ROLE_CARD_WIDTH, minHeight: height }}
      className={cn(
        "nodrag nopan gap-0 overflow-hidden text-left shadow-xs border transition-all cursor-default bg-card flex flex-col justify-between",
        isVacancy
          ? "border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10"
          : "border-slate-300 dark:border-slate-700 hover:border-primary/50",
        isHighlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md",
      )}
      bodyStyle={{
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        gap: "6px",
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1">
          <Tooltip title={role.departmentName}>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[170px]">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">{role.departmentName}</span>
            </span>
          </Tooltip>

          {role.shortCode && (
            <Tag className="text-[9px] px-1 py-0 m-0 font-mono shrink-0">
              {role.shortCode}
            </Tag>
          )}
        </div>

        <Tooltip title={role.name}>
          <div className="text-[12px] font-bold leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
            {role.name}
          </div>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-1.5 py-1 border-t border-slate-200 dark:border-slate-800">
        {isVacancy ? (
          <div className="flex items-center gap-1.5 py-1 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
            <UserX className="size-3.5 shrink-0" />
            <span>Chưa có nhân sự</span>
          </div>
        ) : (
          users.map((u) => {
            const initials = getInitials(u.fullName || "U")
            return (
              <div
                key={u.id}
                className="flex items-center gap-2 p-1 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60"
              >
                <div className="size-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                  {initials}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate"
                      title={u.fullName}
                    >
                      {u.fullName}
                    </span>
                    {u.isMultiProject && (
                      <Tag
                        color="orange"
                        className="text-[8px] px-1 py-0 m-0 leading-none shrink-0"
                      >
                        Kiêm nhiệm
                      </Tag>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground truncate">
                    {u.email && (
                      <span
                        className="flex items-center gap-0.5 truncate"
                        title={u.email}
                      >
                        <Mail className="size-2.5 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </span>
                    )}
                    {u.phone && (
                      <span
                        className="flex items-center gap-0.5 shrink-0"
                        title={u.phone}
                      >
                        <Phone className="size-2.5 shrink-0" />
                        <span>{u.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {childCount > 0 && onToggleExpand && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="nodrag nopan flex items-center gap-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 font-semibold cursor-pointer transition-colors"
          >
            {expanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
            <span>{childCount} cấp dưới</span>
          </button>
        </div>
      )}
    </Card>
  )
}

export default UserRoleNode
