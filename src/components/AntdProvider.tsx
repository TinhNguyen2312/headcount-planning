"use client"

import { App, ConfigProvider } from "antd"
import viVN from "antd/locale/vi_VN"
import type { ReactNode } from "react"
import { useTheme } from "@/components/theme-provider"
import { getAntdTheme } from "@/theme/antdTheme"

export const AntdProvider = ({ children }: { children: ReactNode }) => {
  const { resolvedTheme } = useTheme()

  return (
    <ConfigProvider
      locale={viVN}
      theme={getAntdTheme(resolvedTheme === "dark")}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}
