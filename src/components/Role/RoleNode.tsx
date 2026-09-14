import { Card, Tooltip } from "antd"
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Info,
  Pencil,
} from "lucide-react"
import { useState } from "react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import type { RoleResponse } from "@/types"
import RoleModal from "./RoleModal"

export const ROLE_NODE_WIDTH = 260
export const ROLE_NODE_HEIGHT = 125

interface RoleNodeProps {
  role: RoleResponse
  childCount?: number
  expanded?: boolean
  onToggleExpand?: () => void
  onEdit?: (role: RoleResponse) => void
}

const RoleNode = ({
  role,
  childCount = 0,
  expanded = true,
  onToggleExpand,
  onEdit,
}: RoleNodeProps) => {
  const [editOpen, setEditOpen] = useState(false)

  const items: ActionMenuItem<RoleResponse>[] = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <Pencil className="size-4" />,
      onClick: (r) => {
        if (onEdit) {
          onEdit(r)
        } else {
          setEditOpen(true)
        }
      },
    },
  ]
  return (
    <>
      <Card
        style={{ width: ROLE_NODE_WIDTH, height: ROLE_NODE_HEIGHT }}
        className="nodrag nopan gap-0 overflow-hidden text-left shadow-xs border border-border/80 hover:border-primary/50 transition-all cursor-default bg-card"
        bodyStyle={{ padding: "8px 10px", height: "100%" }}
      >
        <div className="flex h-full flex-col justify-between gap-1">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {role.departmentName && (
                <Tooltip title={`Phòng/ban: ${role.departmentName}`}>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                    <Building2 className="size-3 shrink-0 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{role.departmentName}</span>
                  </span>
                </Tooltip>
              )}
            </div>

            <ActionMenu
              record={role}
              items={items}
              triggerButtonClassName="nodrag nopan -mt-1 -mr-1 size-5! p-0! shrink-0"
            />
          </div>
          <div className="my-auto">
            <Tooltip title={role.name}>
              <span className="line-clamp-2 text-[13px] font-bold leading-tight text-slate-900 dark:text-slate-100">
                {role.name}
              </span>
            </Tooltip>
            {role.description &&
              role.description.trim() !== role.name.trim() && (
                <Tooltip title={role.description}>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                    <Info className="size-3 shrink-0 text-slate-500 dark:text-slate-400" />
                    <span className="truncate">{role.description}</span>
                  </div>
                </Tooltip>
              )}
          </div>
          <div className="flex items-center justify-between gap-1 pt-1 text-[11px]">
            {childCount > 0 && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="nodrag nopan flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 cursor-pointer transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
                <span>{childCount} cấp dưới</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {!onEdit && editOpen && (
        <RoleModal
          role={role}
          open={editOpen}
          onCancel={() => setEditOpen(false)}
        />
      )}
    </>
  )
}

export default RoleNode
