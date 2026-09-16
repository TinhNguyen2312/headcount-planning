import { Card, Tag } from "antd"
import { ChevronDown, ChevronRight, Mail, Phone } from "lucide-react"
import useAuth from "@/hooks/useAuth"
import { cn, formatRoleDepartment, getInitials } from "@/lib/utils"
import type { UserTreeNodeResponse, UserWithProjectsResponse } from "@/types"
import { UserActionsMenu } from "./UserActionsMenu"

export const USER_NODE_WIDTH = 290
export const USER_NODE_HEIGHT = 175

const statusConfig: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  active: {
    label: "Hoạt động",
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  inactive: {
    label: "Ngưng hoạt động",
    dotClass: "bg-amber-500",
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  locked: {
    label: "Đã khóa",
    dotClass: "bg-rose-500",
    badgeClass:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
}

interface UserNodeProps {
  user: UserTreeNodeResponse | UserWithProjectsResponse
  childCount?: number
  expanded?: boolean
  onToggleExpand?: () => void
  isHighlighted?: boolean
}

const UserNode = ({
  user,
  childCount = 0,
  expanded = true,
  onToggleExpand,
  isHighlighted = false,
}: UserNodeProps) => {
  const { user: currentUser } = useAuth()
  const isSelf = currentUser?.id === user.id
  const status = statusConfig[user.status] || statusConfig.active

  const initials = getInitials(user.fullName || "U")

  return (
    <Card
      style={{ width: USER_NODE_WIDTH, height: USER_NODE_HEIGHT }}
      className={cn(
        "nodrag nopan gap-0 overflow-hidden py-2.5 px-3 text-left shadow-sm transition-all duration-200 cursor-default border bg-card hover:shadow-md",
        isHighlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
        isSelf && "border-primary/50 bg-primary/[0.02]",
      )}
    >
      <div className="flex h-full flex-col justify-between p-0 gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative size-9 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base border border-primary/20 shadow-xs">
              {initials}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
                  status.dotClass,
                )}
                title={status.label}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="truncate text-sm font-semibold leading-tight text-foreground"
                  title={user.fullName}
                >
                  {user.fullName}
                </span>
                {isSelf && (
                  <Tag
                    color="blue"
                    className="text-[10px] px-1 shrink-0 font-medium m-0 leading-none"
                  >
                    Bạn
                  </Tag>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {user.roleName && (
                  <span
                    className="text-[10px] text-muted-foreground truncate"
                    title={user.roleName}
                  >
                    · {user.roleName}
                  </span>
                )}
                {user.systemRole === "SUPER_ADMIN" && (
                  <Tag
                    color="error"
                    className="text-[9px] px-1 m-0 shrink-0 leading-none"
                  >
                    Super Admin
                  </Tag>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 -mt-1 -mr-1">
            <UserActionsMenu user={user} />
          </div>
        </div>

        <div className="min-h-7 flex flex-col justify-center">
          {(() => {
            const projects = user.projects || []
            if (projects.length === 0) {
              return (
                <span className="text-[11px] text-muted-foreground italic">
                  Chưa phân công dự án
                </span>
              )
            }
            return (
              <div className="flex flex-wrap gap-1 items-center">
                {projects.slice(0, 2).map((p) => (
                  <Tag
                    key={p.roleId}
                    className="text-[10px] font-normal truncate max-w-[240px] px-1.5 py-0 m-0"
                    title={`${p.name} - ${formatRoleDepartment(p.roleName)}`}
                  >
                    <span className="truncate">
                      {p.name}: {p.roleName}
                    </span>
                  </Tag>
                ))}
                {projects.length > 2 && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    +{projects.length - 2}
                  </span>
                )}
              </div>
            )
          })()}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground truncate">
          {user.email && (
            <div
              className="flex items-center gap-1 truncate"
              title={user.email}
            >
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div
              className="flex items-center gap-1 shrink-0"
              title={user.phone}
            >
              <Phone className="size-3 shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-1.5 text-[11px]">
          {childCount > 0 && onToggleExpand ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
              className="nodrag nopan flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              {expanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
              <span>{childCount} cấp dưới</span>
            </button>
          ) : (
            <span className="text-muted-foreground/60 text-[10px]">
              Không có cấp dưới
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export default UserNode
