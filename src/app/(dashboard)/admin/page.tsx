"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "antd"

const AdminPage = dynamic(() => import("@/views/AdminPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  ),
})

export default function Page() {
  return <AdminPage />
}
