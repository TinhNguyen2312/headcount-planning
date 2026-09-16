"use client"

import { Skeleton } from "antd"
import dynamic from "next/dynamic"

const HeadcountReportsPage = dynamic(
  () => import("@/views/HeadcountReportsPage"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    ),
  },
)

export default function Page() {
  return <HeadcountReportsPage />
}
