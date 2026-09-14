import { Badge, Button, Dropdown, type MenuProps } from "antd"
import { Filter, X } from "lucide-react"
import type React from "react"
import { useState } from "react"
import type { FilterUIItem } from "@/lib/filter"

export interface FilterDropdownProps {
  filters: FilterUIItem[]
  onReset: () => void
}

export function FilterDropdown({ filters, onReset }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)

  const activeCount = filters.filter((f) => f.isActive()).length

  const handleResetOne = (e: React.MouseEvent, filter: FilterUIItem) => {
    e.stopPropagation()
    filter.reset()
  }

  const items: MenuProps["items"] = [
    ...filters.map((filter) => ({
      key: filter.key,
      label: (
        <div className="flex items-center justify-between gap-4 min-w-[180px]">
          <span>{filter.label}</span>
          {filter.isActive() && (
            <X
              className="size-3 text-muted-foreground hover:text-destructive cursor-pointer"
              onClick={(e) => handleResetOne(e, filter)}
            />
          )}
        </div>
      ),
      children: [
        {
          disabled: true,
          key: `${filter.key}_control`,
          label: (
            <div className="p-1 cursor-default">
              {filter.render(() => setOpen(false))}
            </div>
          ),
        },
      ],
    })),
    ...(activeCount > 0
      ? [
          { type: "divider" as const },
          {
            key: "__reset__",
            label: (
              <span className="text-destructive font-medium">
                Xóa tất cả bộ lọc
              </span>
            ),
            onClick: () => {
              onReset()
              setOpen(false)
            },
          },
        ]
      : []),
  ]

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomLeft"
      open={open}
      onOpenChange={(next, info) => {
        if (!next && info.source === "trigger") setOpen(false)
        if (next) setOpen(true)
      }}
    >
      <Badge count={activeCount} offset={[-4, 4]}>
        <Button
          icon={<Filter className="size-4" />}
          type={activeCount > 0 ? "primary" : "default"}
          className="h-9!"
        >
          Bộ lọc
        </Button>
      </Badge>
    </Dropdown>
  )
}
