"use client"

import { useRouter } from "next/navigation"
import { Spin } from "antd"
import { type ReactNode, useEffect } from "react"
import useAuth from "@/hooks/useAuth"
import type { SystemRole } from "@/types"

interface ProtectedRouteProps {
  children: ReactNode
  roles?: SystemRole[]
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated, isSuperUser } = useAuth()
  const router = useRouter()

  const systemRole = user?.systemRole
  const hasRole =
    !roles || roles.length === 0 || isSuperUser
      ? true
      : roles.includes(systemRole as SystemRole)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (!hasRole) {
      router.push("/projects")
    }
  }, [isLoading, isAuthenticated, hasRole, router])

  if (isLoading || !isAuthenticated || !hasRole) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
