import type { Metadata } from "next"
import { Providers } from "@/components/Providers"
import "@/index.css"

export const metadata: Metadata = {
  title: "Hệ thống Định biên Nhân sự",
  description: "Headcount Planning System - Quản trị và phân bổ nhân sự dự án",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
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
