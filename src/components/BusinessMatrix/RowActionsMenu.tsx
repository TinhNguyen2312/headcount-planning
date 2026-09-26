import { CornerDownRight, Pencil, Plus, Trash2 } from "lucide-react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import type { BusinessMatrixResponse } from "@/types"

interface RowActionsMenuProps {
  record: BusinessMatrixResponse
  onStartEdit: () => void
  onAddChild: () => void
  onAddSibling: () => void
  onDelete: () => void
}

const RowActionsMenu = ({
  record,
  onStartEdit,
  onAddChild,
  onAddSibling,
  onDelete,
}: RowActionsMenuProps) => {
  const items: ActionMenuItem<BusinessMatrixResponse>[] = [
    {
      key: "edit",
      label: "Sửa",
      icon: <Pencil className="size-4" />,
      onClick: onStartEdit,
    },
    { type: "divider" },
    {
      key: "add-child",
      label: "Thêm nghiệp vụ con",
      icon: <Plus className="size-4" />,
      onClick: onAddChild,
    },
    {
      key: "add-sibling",
      label: "Thêm nghiệp vụ ngang hàng",
      icon: <CornerDownRight className="size-4" />,
      onClick: onAddSibling,
    },
    { type: "divider" },
    {
      key: "delete",
      label: "Xóa",
      icon: <Trash2 className="size-4" />,
      danger: true,
      confirm: (r) => ({
        title: "Xóa nghiệp vụ",
        content:
          r.children && r.children.length > 0
            ? `Xóa "${r.title}" sẽ xóa luôn ${r.children.length} nghiệp vụ con bên trong. Tiếp tục?`
            : `Xóa "${r.title}"?`,
        okText: "Xóa",
        okType: "danger",
      }),
      onClick: onDelete,
    },
  ]

  return <ActionMenu record={record} items={items} />
}

export default RowActionsMenu
