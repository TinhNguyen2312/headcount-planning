"use client"

import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Skeleton } from "antd"

const ProjectUsersPage = dynamic(() => import("@/views/ProjectUsersPage"), {
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
    <ProjectUsersPage
      projectId={projectId}
      onBack={() => router.push(`/projects/${projectId}/edit`)}
    />
  )
}
