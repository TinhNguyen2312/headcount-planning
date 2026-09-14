"use client"

import { Layout } from "antd"
import { useEffect, useState } from "react"
import { AppDrawer, AppHeader, AppSider } from "@/components/Layout"
import useAuth from "@/hooks/useAuth"
import { useLayout } from "@/hooks/useLayout"
import { CommandPalette, useShortcuts } from "@/keyboard"

const { Content } = Layout

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useShortcuts({
    toggleSidebar: {
      keys: "mod+alt+b",
      storageId: "action.toggleSidebar",
      label: "Đóng/Mở thanh điều hướng (Sidebar)",
      category: "Giao diện",
      handler: () => {
        if (isMobile) {
          setDrawerOpen((v) => !v)
        } else {
          setCollapsed((v) => !v)
        }
      },
    },
  })

  const {
    topMenuItems,
    bottomMenuItems,
    activeKey,
    activeLabel,
    navigateHome,
  } = useLayout()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const breadcrumbItems = [
    {
      title: (
        <button
          type="button"
          className="cursor-pointer text-sm hover:text-primary"
          onClick={navigateHome}
        >
          Trang chủ
        </button>
      ),
    },
    ...(activeLabel
      ? [
          {
            title: <span className="text-sm font-semibold">{activeLabel}</span>,
          },
        ]
      : []),
  ]

  return (
    <Layout className="h-screen overflow-hidden">
      <AppSider
        collapsed={collapsed}
        isMobile={isMobile}
        activeKey={activeKey}
        topMenuItems={topMenuItems}
        bottomMenuItems={bottomMenuItems}
      />

      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeKey={activeKey}
        topMenuItems={topMenuItems}
        bottomMenuItems={bottomMenuItems}
      />

      <Layout className="min-h-0 flex-1 flex flex-col overflow-hidden">
        <AppHeader
          collapsed={collapsed}
          isMobile={isMobile}
          onToggleCollapse={() =>
            isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)
          }
          breadcrumbItems={breadcrumbItems}
          user={user}
          onLogout={logout}
        />

        <Content className="min-h-0 overflow-auto bg-background p-6 md:p-4">
          {children}
        </Content>
      </Layout>

      <CommandPalette />
    </Layout>
  )
}
