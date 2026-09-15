"use client"

import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Skeleton } from "antd"

const ProjectEditPage = dynamic(() => import("@/views/ProjectEditPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  ),
})

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params?.projectId)

  return (
    <ProjectEditPage
      projectId={projectId}
      onBack={() => router.push("/projects")}
    />
  )
}
