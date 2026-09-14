import type { Metadata } from "next"
import { Providers } from "@/components/Providers"
import "@/index.css"

export const metadata: Metadata = {
  title: "Hệ thống Định biên Nhân sự",
  description: "Headcount Planning System - Quản trị và phân bổ nhân sự dự án",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
