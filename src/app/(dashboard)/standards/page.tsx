"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "antd"

const StandardsPage = dynamic(() => import("@/views/StandardsPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  ),
})

export default function Page() {
  return <StandardsPage />
}
