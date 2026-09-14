/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, List } from "antd"
import { ImageIcon } from "lucide-react"
import { Fragment, type ReactNode } from "react"

export interface ButtonConfig<T> {
  label?: ReactNode
  icon?: ReactNode
  onClick?: (item: T) => void
  className?: string | ((item: T) => string)
  getDisabled?: (item: T) => boolean
  danger?: boolean
  render?: (item: T) => ReactNode
}

export interface ListViewItemBase {
  id: number | string
  name?: string
  description?: string | null
  [key: string]: any
}

export interface ListViewProps<T extends ListViewItemBase> {
  items: T[]
  getImageSrc?: (item: T) => string
  buttons?: ButtonConfig<T>[]
  itemClassName?: string
  renderTitle?: (item: T) => ReactNode
  showDescription?: boolean
  actionLayout?: "horizontal" | "vertical"
  imageComponent?: (item: T) => ReactNode
  renderCustomRow?: (item: T) => ReactNode
}

export const ListView = <T extends ListViewItemBase>({
  items,
  getImageSrc,
  buttons,
  imageComponent,
  itemClassName = "px-4! py-3 rounded-lg border border-border transition-colors bg-card hover:border-primary/40",
  showDescription = true,
  actionLayout = "horizontal",
  renderTitle,
  renderCustomRow,
}: ListViewProps<T>) => {
  return (
    <List
      dataSource={items}
      className="flex flex-col gap-3"
      renderItem={(item) => {
        if (renderCustomRow) {
          return (
            <div key={item.id} className="w-full">
              {renderCustomRow(item)}
            </div>
          )
        }

        const actionsClassName =
          actionLayout === "vertical"
            ? "flex flex-col gap-2 shrink-0 ml-4"
            : "flex items-center gap-2 shrink-0 ml-4 flex-wrap"

        return (
          <List.Item key={item.id} className={itemClassName}>
            <List.Item.Meta
              avatar={
                imageComponent
                  ? imageComponent(item)
                  : getImageSrc
                    ? (() => {
                        const src = getImageSrc(item)
                        return src ? (
                          <Avatar
                            shape="square"
                            size={64}
                            src={src}
                            alt={item.name}
                            className="shrink-0"
                          />
                        ) : (
                          <div className="flex size-16 items-center justify-center rounded-lg bg-muted shrink-0">
                            <ImageIcon className="size-6 text-muted-foreground/40" />
                          </div>
                        )
                      })()
                    : null
              }
              title={
                <div>
                  {renderTitle ? (
                    renderTitle(item)
                  ) : (
                    <div className="font-semibold text-foreground">
                      {item.name}
                    </div>
                  )}
                </div>
              }
              description={
                showDescription && item.description ? (
                  <p className="max-w-xl text-base text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                ) : null
              }
            />

            <div className={actionsClassName}>
              {buttons?.map((btn, idx) => {
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
                    onClick={() => btn.onClick?.(item)}
                    disabled={disabled}
                    className={cls}
                    danger={btn.danger}
                    size="small"
                  >
                    {btn.label}
                  </Button>
                )
              })}
            </div>
          </List.Item>
        )
      }}
    />
  )
}
