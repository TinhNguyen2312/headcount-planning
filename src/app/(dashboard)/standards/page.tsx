"use client"

import { Skeleton } from "antd"
import dynamic from "next/dynamic"

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
