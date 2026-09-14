"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "antd"

const ProjectsPage = dynamic(() => import("@/views/ProjectsPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  ),
})

export default function Page() {
  return <ProjectsPage />
}
