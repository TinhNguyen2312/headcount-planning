import { Button, Card, Dropdown, type MenuProps, Space, Tooltip } from "antd"
import { MoreVertical } from "lucide-react"
import { Fragment, type ReactNode } from "react"
import type { ButtonConfig, ListViewItemBase } from "./ListView"

const { Meta } = Card

export interface GridViewProps<T extends ListViewItemBase> {
  items: T[]
  getImageSrc?: (item: T) => string
  buttons?: ButtonConfig<T>[]
  renderTitle?: (item: T) => ReactNode
  showTitleTooltip?: boolean
  showDescription?: boolean
  actionAriaLabel?: string
  imageComponent?: (item: T) => ReactNode
  renderCustomCard?: (item: T) => ReactNode
  gridClassName?: string
}

export const GridView = <T extends ListViewItemBase>({
  items,
  getImageSrc,
  buttons,
  renderTitle,
  imageComponent,
  renderCustomCard,
  showTitleTooltip = false,
  showDescription = true,
  actionAriaLabel = "Tùy chọn",
  gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
}: GridViewProps<T>) => {
  return (
    <div className={gridClassName}>
      {items.map((item) => {
        if (renderCustomCard) {
          return <Fragment key={item.id}>{renderCustomCard(item)}</Fragment>
        }

        const menuItems: MenuProps["items"] =
          buttons?.flatMap((btn, idx) =>
            !btn.render && btn.onClick
              ? [
                  {
                    key: String(idx),
                    label: btn.label,
                    icon: btn.icon,
                    danger: btn.danger,
                    disabled: btn.getDisabled?.(item) ?? false,
                  },
                ]
              : [],
          ) ?? []

        const handleMenuClick: MenuProps["onClick"] = (e) => {
          const btn = buttons?.[Number(e.key)]
          btn?.onClick?.(item)
        }

        const titleNode = renderTitle ? (
          renderTitle(item)
        ) : (
          <span className="block truncate font-semibold">{item.name}</span>
        )

        return (
          <Card
            key={item.id}
            className="flex flex-col h-full overflow-hidden p-0 border border-border shadow-xs hover:shadow-md transition-shadow"
            hoverable
            cover={
              imageComponent || getImageSrc ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted group">
                  {imageComponent ? (
                    imageComponent(item)
                  ) : getImageSrc ? (
                    <img
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      src={getImageSrc(item)}
                    />
                  ) : null}

                  {menuItems.length > 0 && (
                    <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Dropdown
                        menu={{ items: menuItems, onClick: handleMenuClick }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={<MoreVertical className="size-4" />}
                          aria-label={actionAriaLabel}
                          className="size-7 p-0! rounded-full bg-background/80 shadow-xs backdrop-blur"
                        />
                      </Dropdown>
                    </div>
                  )}
                </div>
              ) : undefined
            }
          >
            <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
              <div>
                <Meta
                  title={
                    showTitleTooltip ? (
                      <Tooltip title={item.name}>{titleNode}</Tooltip>
                    ) : (
                      titleNode
                    )
                  }
                  description={
                    showDescription && item.description ? (
                      <p className="text-base text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    ) : undefined
                  }
                />
              </div>

              {buttons && buttons.length > 0 && (
                <Space size="small" className="w-full flex-wrap pt-2">
                  {buttons.map((btn, idx) => {
                    if (btn.render) {
                      return <Fragment key={idx}>{btn.render(item)}</Fragment>
                    }
                    const disabled = btn.getDisabled?.(item) ?? false
                    const cls =
                      typeof btn.className === "function"
                        ? btn.className(item)
                        : btn.className
                    return (
                      <Button
                        key={idx}
                        icon={btn.icon}
                        disabled={disabled}
                        onClick={() => btn.onClick?.(item)}
                        className={cls}
                        danger={btn.danger}
                        size="small"
                      >
                        {btn.label}
                      </Button>
                    )
                  })}
                </Space>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
