import { Card, Tooltip } from "antd"
import { ChevronDown, ChevronRight, Pencil } from "lucide-react"
import { useState } from "react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import type { RoleResponse } from "@/types"
import RoleModal from "./RoleModal"

export const ROLE_NODE_WIDTH = 250
export const ROLE_NODE_HEIGHT = 120

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
        className="nodrag nopan gap-0 overflow-hidden text-left shadow-sm cursor-default"
      >
        <div className="flex h-full flex-col justify-between gap-1 p-2.5">
          <div className="flex items-start justify-between gap-1">
            <Tooltip title={role.name}>
              <span className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                {role.name}
              </span>
            </Tooltip>
            <ActionMenu
              record={role}
              items={items}
              triggerButtonClassName="nodrag nopan -mt-1 -mr-1 size-5! p-0! shrink-0"
            />
          </div>

          {childCount > 0 ? (
            <button
              type="button"
              onClick={onToggleExpand}
              className="nodrag nopan flex items-center gap-1 text-muted-foreground text-base hover:text-foreground cursor-pointer transition-colors"
            >
              {expanded ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
              {childCount} chức vụ con
            </button>
          ) : (
            <div />
          )}
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
