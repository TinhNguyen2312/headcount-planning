"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "antd"

const OrganizationPage = dynamic(() => import("@/views/OrganizationPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  ),
})

export default function Page() {
  return <OrganizationPage />
}
