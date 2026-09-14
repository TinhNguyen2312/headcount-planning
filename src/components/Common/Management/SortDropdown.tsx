import { Button, Dropdown, type MenuProps } from "antd"
import { ArrowUpDown } from "lucide-react"
import { DEFAULT_SORT_OPTIONS } from "@/constants/sort"
import type { SortConfig, SortOption } from "@/types/common"

const toKey = (o: Pick<SortOption, "sortBy" | "order">) =>
  `${o.sortBy}_${o.order.toUpperCase()}`

const isSameSort = (a: SortOption, b?: SortConfig["sort"]) =>
  Boolean(
    b &&
      a.sortBy.toLowerCase() === b.sortBy.toLowerCase() &&
      a.order.toUpperCase() === b.order.toUpperCase(),
  )

interface SortDropdownProps {
  value: SortConfig
  onChange: (config: SortConfig) => void
  options?: SortOption[]
  placeholder?: string
}

export const SortDropdown = ({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  placeholder = "Sắp xếp",
}: SortDropdownProps) => {
  const current = options.find((o) => isSameSort(o, value.sort))
  const isActive = Boolean(current)

  const items: MenuProps["items"] = options.map((option) => ({
    key: toKey(option),
    label: option.label,
    onClick: () =>
      onChange({
        ...value,
        sort: { sortBy: option.sortBy, order: option.order },
      }),
  }))

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: current ? [toKey(current)] : [],
      }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        icon={<ArrowUpDown className="size-4" />}
        type={isActive ? "default" : "default"}
        className="h-9!"
      >
        {current?.label ?? placeholder}
      </Button>
    </Dropdown>
  )
}
