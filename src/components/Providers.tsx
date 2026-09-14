"use client"

import React, { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import { ThemeProvider } from "./theme-provider"
import { AntdProvider } from "./AntdProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <AntdRegistry>
      <ThemeProvider defaultTheme="light">
        <AntdProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AntdProvider>
      </ThemeProvider>
    </AntdRegistry>
  )
}
