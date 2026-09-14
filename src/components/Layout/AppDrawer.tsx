import { Drawer, type MenuProps } from "antd"
import { BrandHeader } from "./BrandHeader"
import { SidebarFooter } from "./SidebarFooter"
import { SidebarMenu } from "./SidebarMenu"

interface AppDrawerProps {
  open: boolean
  onClose: () => void
  activeKey: string
  topMenuItems: MenuProps["items"]
  bottomMenuItems: MenuProps["items"]
}

export const AppDrawer = ({
  open,
  onClose,
  activeKey,
  topMenuItems,
  bottomMenuItems,
}: AppDrawerProps) => {
  const drawerTopItems = topMenuItems?.map((item) => {
    if (!item || typeof item !== "object") return item
    const origOnClick =
      "onClick" in item && typeof item.onClick === "function"
        ? item.onClick
        : undefined
    return {
      ...item,
      onClick: (info: Parameters<NonNullable<typeof origOnClick>>[0]) => {
        origOnClick?.(info)
        onClose()
      },
    }
  })

  const drawerBottomItems = bottomMenuItems?.map((item) => {
    if (!item || typeof item !== "object") return item
    const origOnClick =
      "onClick" in item && typeof item.onClick === "function"
        ? item.onClick
        : undefined
    return {
      ...item,
      onClick: (info: Parameters<NonNullable<typeof origOnClick>>[0]) => {
        origOnClick?.(info)
        onClose()
      },
    }
  })

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="left"
      styles={{
        body: { padding: 0, backgroundColor: "#002B60" },
        wrapper: { width: 260 },
      }}
      closable={false}
    >
      <div className="flex h-full flex-col justify-between bg-sidebar text-sidebar-foreground">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <BrandHeader onItemClick={onClose} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-3">
            <SidebarMenu items={drawerTopItems} selectedKeys={[activeKey]} />
          </div>
        </div>

        <div className="shrink-0 pb-3">
          {(drawerBottomItems?.length ?? 0) > 0 && (
            <div className="mb-2">
              <SidebarMenu
                items={drawerBottomItems}
                selectedKeys={[activeKey]}
              />
            </div>
          )}
          <SidebarFooter />
        </div>
      </div>
    </Drawer>
  )
}
