import type { MenuProps } from "antd"
import { Button, Dropdown, Modal, Tooltip } from "antd"
import { EllipsisVertical } from "lucide-react"
import React, { type ReactNode, useMemo } from "react"

import { useProjectAuth } from "@/hooks/useProjectAuth"
import type { ProjectRole, SystemRole } from "@/types"

export interface ActionConfirmConfig<T> {
  title: string | ((record: T) => string)
  content?: ReactNode | ((record: T) => ReactNode)
  okText?: string
  cancelText?: string
  okType?: "primary" | "danger"
}

export type ActionMenuItem<T> =
  | {
      type: "divider"
      key?: string
      hidden?: boolean | ((record: T) => boolean)
    }
  | {
      type?: "item"
      key: string
      label: ReactNode | ((record: T) => ReactNode)
      icon?: ReactNode | ((record: T) => ReactNode)
      danger?: boolean | ((record: T) => boolean)
      loading?: boolean | ((record: T) => boolean)
      systemRoles?: SystemRole[]
      projectRoles?: ProjectRole[]
      hidden?: boolean | ((record: T) => boolean)
      disabled?: boolean | string | ((record: T) => boolean | string)
      confirm?: ActionConfirmConfig<T> | ((record: T) => ActionConfirmConfig<T>)
      onClick: (record: T, e?: React.MouseEvent) => void | Promise<void>
    }

export interface ActionMenuProps<T> {
  record: T
  items: ActionMenuItem<T>[]
  mode?: "dropdown" | "inline" | "auto"
  size?: "small" | "middle" | "large"
  className?: string
  triggerButtonClassName?: string
  projectRoles?: ProjectRole[]
}

export function ActionMenu<T>({
  record,
  items,
  mode = "dropdown",
  size = "small",
  className,
  triggerButtonClassName,
  projectRoles = [],
}: ActionMenuProps<T>) {
  const { isSuperUser, hasProjectRole } = useProjectAuth()

  const hasMenuAccess =
    projectRoles.length === 0 || isSuperUser || hasProjectRole(...projectRoles)

  const visibleItems = useMemo(() => {
    if (!hasMenuAccess) return []
    return items.filter((item) => {
      const isHidden =
        typeof item.hidden === "function" ? item.hidden(record) : item.hidden
      if (isHidden) return false

      if (item.type === "divider") return true

      if (item.systemRoles && item.systemRoles.length > 0 && !isSuperUser) {
        return false
      }

      if (item.projectRoles && item.projectRoles.length > 0) {
        if (!hasProjectRole(...item.projectRoles)) {
          return false
        }
      }

      return true
    })
  }, [items, record, hasMenuAccess, isSuperUser, hasProjectRole])

  const actionItemsOnly = useMemo(() => {
    return visibleItems.filter((i) => i.type !== "divider") as Extract<
      ActionMenuItem<T>,
      { key: string }
    >[]
  }, [visibleItems])

  if (actionItemsOnly.length === 0) return null

  const handleItemClick = (
    item: Extract<ActionMenuItem<T>, { key: string }>,
    e?: React.MouseEvent,
  ) => {
    if (!item.confirm) {
      item.onClick(record, e)
      return
    }

    const conf =
      typeof item.confirm === "function" ? item.confirm(record) : item.confirm
    const title =
      typeof conf.title === "function" ? conf.title(record) : conf.title
    const content =
      typeof conf.content === "function" ? conf.content(record) : conf.content
    const isDanger =
      typeof item.danger === "function" ? item.danger(record) : item.danger

    Modal.confirm({
      title,
      content,
      okText: conf.okText || (isDanger ? "Xóa" : "Xác nhận"),
      cancelText: conf.cancelText || "Hủy",
      okType: conf.okType || (isDanger ? "danger" : "primary"),
      onOk: () => item.onClick(record, e),
    })
  }

  const finalMode =
    mode === "auto"
      ? actionItemsOnly.length <= 2
        ? "inline"
        : "dropdown"
      : mode

  if (finalMode === "inline") {
    return (
      <div className={`flex items-center gap-1 ${className || ""}`}>
        {actionItemsOnly.map((item) => {
          const rawDisabled =
            typeof item.disabled === "function"
              ? item.disabled(record)
              : item.disabled
          const isDisabled = Boolean(rawDisabled)
          const tooltipText =
            typeof rawDisabled === "string" ? rawDisabled : undefined
          const label =
            typeof item.label === "function" ? item.label(record) : item.label
          const icon =
            typeof item.icon === "function" ? item.icon(record) : item.icon
          const isDanger =
            typeof item.danger === "function"
              ? item.danger(record)
              : item.danger
          const isLoading =
            typeof item.loading === "function"
              ? item.loading(record)
              : item.loading

          const btn = (
            <Button
              key={item.key}
              type="text"
              size={size}
              danger={isDanger}
              disabled={isDisabled}
              loading={isLoading}
              icon={icon}
              title={
                tooltipText || (typeof label === "string" ? label : undefined)
              }
              onClick={(e) => {
                e.stopPropagation()
                handleItemClick(item, e)
              }}
            />
          )

          return (
            <Tooltip key={item.key} title={tooltipText || label}>
              {btn}
            </Tooltip>
          )
        })}
      </div>
    )
  }

  const menuItems: MenuProps["items"] = []
  visibleItems.forEach((item, index) => {
    if (item.type === "divider") {
      if (
        menuItems.length > 0 &&
        menuItems[menuItems.length - 1]?.type !== "divider"
      ) {
        menuItems.push({ type: "divider", key: `divider-${index}` })
      }
      return
    }

    const rawDisabled =
      typeof item.disabled === "function"
        ? item.disabled(record)
        : item.disabled
    const isDisabled = Boolean(rawDisabled)
    const label =
      typeof item.label === "function" ? item.label(record) : item.label
    const icon = typeof item.icon === "function" ? item.icon(record) : item.icon
    const isDanger =
      typeof item.danger === "function" ? item.danger(record) : item.danger

    menuItems.push({
      key: item.key,
      label: <span className="font-medium text-sm">{label}</span>,
      icon,
      danger: isDanger,
      disabled: isDisabled,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation()
        handleItemClick(item, domEvent as unknown as React.MouseEvent)
      },
    })
  })

  while (
    menuItems.length > 0 &&
    menuItems[menuItems.length - 1]?.type === "divider"
  ) {
    menuItems.pop()
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        size={size}
        icon={
          <EllipsisVertical className="size-4 text-muted-foreground hover:text-foreground" />
        }
        onClick={(e) => e.stopPropagation()}
        className={triggerButtonClassName || className}
      />
    </Dropdown>
  )
}

export default ActionMenu
