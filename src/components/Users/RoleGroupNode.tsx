import { Card } from "antd"
import { UserCheck, UserX } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RoleGroupUserItem {
  id?: number
  fullName: string
  note?: string | null // vd: "(KN)", "Tuyển (01 - 06/26)"
  isVacancy?: boolean
}

export interface RoleSectionGroup {
  roleId: number
  roleName: string
  users: RoleGroupUserItem[]
}

export interface RoleGroupNodeData extends Record<string, unknown> {
  type: "manager" | "group"
  title: string
  departmentName?: string | null
  managerUsers?: { id?: number; fullName: string }[]
  managerName?: string
  isVacancy?: boolean
  sections?: RoleSectionGroup[]
  isHighlighted?: boolean
}

interface RoleGroupNodeProps {
  data: RoleGroupNodeData
}

export const RoleGroupNode = ({ data }: RoleGroupNodeProps) => {
  const {
    type,
    title,
    departmentName,
    managerUsers,
    managerName,
    sections,
    isHighlighted,
  } = data

  if (type === "manager") {
    const displayManagers =
      managerUsers && managerUsers.length > 0
        ? managerUsers
        : managerName
          ? [{ fullName: managerName }]
          : []
    const isVacancy = displayManagers.length === 0

    return (
      <Card
        className={cn(
          "w-[260px] min-h-[95px] nodrag nopan overflow-hidden p-3 text-center shadow-xs border bg-card transition-all cursor-default flex flex-col justify-center items-center gap-1 border-slate-300 dark:border-slate-700 hover:shadow-md",
          isHighlighted &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md",
          isVacancy
            ? "bg-amber-50/40 dark:bg-amber-950/20 border-dashed border-amber-300"
            : "bg-card",
        )}
      >
        <div className="text-base font-bold text-foreground leading-tight uppercase tracking-tight">
          {title}
        </div>
        {departmentName && (
          <div className="text-[10px] text-muted-foreground font-medium truncate max-w-full">
            {departmentName}
          </div>
        )}
        <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 w-full flex flex-col items-center justify-center gap-1 text-base font-semibold">
          {isVacancy ? (
            <span className="text-amber-600 dark:text-amber-400 italic font-normal flex items-center gap-1">
              <UserX className="size-3.5" />
              Chưa có nhân sự
            </span>
          ) : (
            displayManagers.map((m, idx) => (
              <span
                key={m.id || `mgr-${idx}`}
                className="text-slate-800 dark:text-slate-100 flex items-center gap-1 leading-tight"
              >
                <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{m.fullName}</span>
              </span>
            ))
          )}
        </div>
      </Card>
    )
  }

  // Type === "group" (Gom nhóm 9 vị trí chuyên viên / giám sát)
  return (
    <Card
      className={cn(
        "w-[260px] nodrag nopan overflow-hidden py-3 px-3 text-center shadow-xs border bg-card transition-all cursor-default border-slate-300 dark:border-slate-700 hover:shadow-md",
        isHighlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md",
      )}
    >
      <div className="flex flex-col gap-3">
        {sections && sections.length > 0 ? (
          sections.map((sec, idx) => (
            <div
              key={sec.roleId}
              className={cn(
                "flex flex-col gap-1 text-center",
                idx > 0 &&
                  "pt-2.5 border-t border-slate-200 dark:border-slate-800",
              )}
            >
              <div className="text-[11px] font-bold text-foreground leading-snug">
                {sec.roleName}
              </div>
              <div className="flex flex-col gap-0.5 text-[11px]">
                {sec.users && sec.users.length > 0 ? (
                  sec.users.map((u, uIdx) => (
                    <div
                      key={u.id || `vacancy-${uIdx}`}
                      className={cn(
                        "leading-tight truncate",
                        u.isVacancy
                          ? "text-amber-600 dark:text-amber-400 italic font-normal"
                          : "text-slate-700 dark:text-slate-200 font-medium",
                      )}
                    >
                      {u.fullName}{" "}
                      {u.note ? (
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {u.note}
                        </span>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 italic text-[10px]">
                    Chưa có nhân sự
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-base text-muted-foreground italic py-2">
            Chưa có nhân sự
          </div>
        )}
      </div>
    </Card>
  )
}

export default RoleGroupNode
