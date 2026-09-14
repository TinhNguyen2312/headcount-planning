import { Layout, type MenuProps } from "antd"
import { BrandHeader } from "./BrandHeader"
import { SidebarFooter } from "./SidebarFooter"
import { SidebarMenu } from "./SidebarMenu"

const { Sider } = Layout

interface AppSiderProps {
  collapsed: boolean
  isMobile: boolean
  activeKey: string
  topMenuItems: MenuProps["items"]
  bottomMenuItems: MenuProps["items"]
}

export const AppSider = ({
  collapsed,
  isMobile,
  activeKey,
  topMenuItems,
  bottomMenuItems,
}: AppSiderProps) => {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      className={`overflow-hidden border-r border-sidebar-border bg-sidebar! ${isMobile ? "hidden" : ""}`}
    >
      <div className="flex h-screen flex-col justify-between">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <BrandHeader collapsed={collapsed} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-3">
            <SidebarMenu items={topMenuItems} selectedKeys={[activeKey]} />
          </div>
        </div>

        <div className="shrink-0 pb-3">
          {(bottomMenuItems?.length ?? 0) > 0 && (
            <div className="mb-2">
              <SidebarMenu items={bottomMenuItems} selectedKeys={[activeKey]} />
            </div>
          )}
          <SidebarFooter collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  )
}
