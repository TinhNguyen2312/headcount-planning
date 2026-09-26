import { Tag } from "antd"

import RoleSelect from "@/components/Common/RoleSelect"

interface RoleMultiSelectCellProps {
  value?: number[]
  onChange?: (roleIds: number[]) => void
  roles?: { roleId: number; roleName: string }[]
  isEditing?: boolean
}

const RoleMultiSelectCell = ({
  value = [],
  onChange,
  roles = [],
  isEditing = false,
}: RoleMultiSelectCellProps) => {
  if (isEditing) {
    return (
      <RoleSelect
        mode="multiple"
        value={value}
        onChange={onChange}
        placeholder="Chọn chức danh..."
        className="w-full"
      />
    )
  }

  return roles.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Tag key={role.roleId} className="m-0 text-[11px]">
          {role.roleName}
        </Tag>
      ))}
    </div>
  ) : (
    <span className="text-md text-muted-foreground">—</span>
  )
}

export default RoleMultiSelectCell
