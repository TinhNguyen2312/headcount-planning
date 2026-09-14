import { ConfigProvider, Menu, type MenuProps } from "antd"

const SIDEBAR_MENU_THEME = {
  components: {
    Menu: {
      itemBg: "transparent",
      itemColor: "rgba(255, 255, 255, 0.85)",
      itemHoverColor: "#ffffff",
      itemHoverBg: "rgba(255, 255, 255, 0.1)",
      itemSelectedColor: "#ffffff",
      itemSelectedBg: "#2db34b",
      activeBarWidth: 0,
      itemBorderRadius: 6,
      itemMarginInline: 8,
    },
  },
}

interface SidebarMenuProps {
  items: MenuProps["items"]
  selectedKeys?: string[]
}

export const SidebarMenu = ({ items, selectedKeys }: SidebarMenuProps) => {
  return (
    <ConfigProvider theme={SIDEBAR_MENU_THEME}>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={items}
        className="border-0 bg-transparent!"
      />
    </ConfigProvider>
  )
}
