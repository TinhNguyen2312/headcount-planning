"use client"

import React, { Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button, Result, Spin } from "antd"
import { FileCheck, Layers } from "lucide-react"
import { useMtlStore } from "@/stores/useMtlStore"
import { useMtlUiStore, type MtlViewMode } from "@/stores/useMtlUiStore"
import {
  ApprovalWorkflowModal,
  CreateProjectModal,
  ExecutiveCockpit,
  ImportExportModal,
  MilestoneModal,
  MtlHeaderBar,
  ParameterDrawer,
  ValidationDrawer,
  WorkspaceView,
} from "@/components/Mtl"
import { DEFAULT_INITIAL_PROJECTS } from "@/constants/mtl"
import { normalizeProject } from "@/lib/mtl/mtl-calculations"

function TimelinePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab") as MtlViewMode | null
  const projectParam = searchParams.get("project")

  const { projects, setProjects, activeProjectId, setActiveProjectId } =
    useMtlStore()
  const { view, setView } = useMtlUiStore()

  // Khởi tạo các dự án mẫu nếu danh sách đang rỗng
  useEffect(() => {
    if (!projects || projects.length === 0) {
      const initialList = DEFAULT_INITIAL_PROJECTS.map(normalizeProject)
      setProjects(initialList)
      if (initialList[0]) {
        setActiveProjectId(initialList[0].id)
      }
    }
  }, [projects, setProjects, setActiveProjectId])

  // Đồng bộ query parameter `tab` với Zustand view store
  useEffect(() => {
    if (tabParam && tabParam !== view) {
      setView(tabParam)
    }
  }, [tabParam, view, setView])

  // Đồng bộ query parameter `project` với Zustand activeProjectId
  useEffect(() => {
    if (projectParam && projectParam !== activeProjectId) {
      const found = projects.find(
        (p) => p.id === projectParam || p.code === projectParam
      )
      if (found) {
        setActiveProjectId(found.id)
      }
    }
  }, [projectParam, activeProjectId, projects, setActiveProjectId])

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background overflow-hidden h-full">
      {/* MTL Dedicated Action Toolbar */}
      <MtlHeaderBar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {view === "director_hub" ? (
          <ExecutiveCockpit />
        ) : view === "workspace" ? (
          <WorkspaceView />
        ) : view === "design" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card text-center">
            <div className="max-w-xl space-y-4 p-8 rounded-xl border border-border bg-background shadow-xs">
              <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                <FileCheck className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Quản lý Hồ sơ Thiết kế & Thẩm định Bản vẽ AI
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hồ sơ thiết kế cơ sở và bản vẽ thi công thuộc Mốc T2 (Thiết kế 1/500) và Mốc T3 (Hồ sơ xin GPXD)
                được thẩm định tự động thông qua Hệ thống AI Soát xét Bản vẽ Kiến trúc (CHTK).
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="primary"
                  icon={<FileCheck className="size-4" />}
                  className="bg-primary hover:!bg-primary/90 font-semibold text-xs"
                  onClick={() => router.push("/drawing-checker")}
                >
                  Mở Thẩm định Bản vẽ AI (Drawing Checker)
                </Button>
                <Button onClick={() => setView("workspace")} className="text-xs">
                  Xem WBS Thiết kế
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 bg-card">
            <Result
              icon={<Layers className="size-16 text-primary mx-auto" />}
              title={
                view === "overview"
                  ? "Theo dõi thực hiện công việc (Overview)"
                  : view === "fs"
                    ? "Phương án kinh doanh (FS - Feasibility Study)"
                    : "Xác nhận MTL (PBCM - Phòng Ban Chuyên Môn)"
              }
              subTitle="Phân hệ này đang liên thông trực tiếp với Cây công việc WBS & Biểu đồ Gantt của Master Timeline."
              extra={
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="primary"
                    className="bg-primary hover:!bg-primary/90"
                    onClick={() => setView("workspace")}
                  >
                    Mở MTL Workspace (Bước 5)
                  </Button>
                  <Button onClick={() => setView("director_hub")}>
                    Về Bàn làm việc Lãnh đạo
                  </Button>
                </div>
              }
            />
          </div>
        )}
      </main>

      {/* Modals & Drawers available across all timeline views */}
      <MilestoneModal />
      <ParameterDrawer />
      <ValidationDrawer />
      <ApprovalWorkflowModal />
      <CreateProjectModal />
      <ImportExportModal />
    </div>
  )
}

export default function TimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <TimelinePageContent />
    </Suspense>
  )
}
