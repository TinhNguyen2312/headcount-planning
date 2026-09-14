"use client"

import { useRouter } from "next/navigation"
import { Button } from "antd"
import { ShieldAlert } from "lucide-react"

const UnauthorizedAccess = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card gap-4 my-8">
      <ShieldAlert className="size-12 text-destructive" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">Từ chối truy cập</h2>
        <p className="text-sm text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>
      <Button onClick={() => router.push("/projects")}>
        Quay lại trang chủ
      </Button>
    </div>
  )
}

export default UnauthorizedAccess
