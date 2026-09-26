"use client"

import React, { Suspense } from "react"
import { Spin } from "antd"
import { PcdWorkspacePage } from "@/views/pcd/PcdWorkspacePage"

export default function PcdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center p-12">
          <Spin size="large" />
        </div>
      }
    >
      <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <PcdWorkspacePage />
      </div>
    </Suspense>
  )
}
