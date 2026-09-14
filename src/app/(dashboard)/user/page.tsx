"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Skeleton } from "antd"

const UsersPage = dynamic(() => import("@/views/UsersPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  ),
})

export default function Page() {
  const [activeTab, setActiveTab] = useState<"list" | "hierarchy">("list")

  return <UsersPage activeTab={activeTab} onTabChange={setActiveTab} />
}
