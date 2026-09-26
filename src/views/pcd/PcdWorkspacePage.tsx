"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Tag,
  Tabs,
} from "antd"
import {
  AlertTriangle,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Database,
  FileCheck,
  HardHat,
  Layers,
  LineChart,
  MapPin,
  PlusSquare,
  TableProperties,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"

import { DashboardPage } from "./DashboardPage"
import MyTasksPage from "./MyTasksPage"
import MyTaskDetailPage from "./MyTaskDetailPage"
import SubordinatesPage from "./SubordinatesPage"
import CreateAdhocTaskPage from "./CreateAdhocTaskPage"
import WorkSchedulePage from "./WorkSchedulePage"
import ChecklistsPage from "./ChecklistsPage"
import BusinessMatrixPage from "./BusinessMatrixPage"
import TrackingMapPage from "./TrackingMapPage"
import AccPage from "./AccPage"
import type { TaskInstanceResponse } from "@/types"

export function PcdWorkspacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab") || "dashboard"

  const [selectedKey, setSelectedKey] = useState(tabParam)
  const [selectedProject, setSelectedProject] = useState("novaworld-pt")
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

  useEffect(() => {
    if (tabParam && tabParam !== selectedKey) {
      setSelectedKey(tabParam)
    }
  }, [tabParam, selectedKey])

  const handleTabChange = (key: string) => {
    setSelectedKey(key)
    setSelectedTaskId(null)
    router.push(`/pcd?tab=${key}`, { scroll: false })
  }

  const tabItems = [
    {
      key: "dashboard",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <LineChart size={15} />
          <span>Tổng Quan Thi Công</span>
        </span>
      ),
    },
    {
      key: "my-tasks",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <CheckSquare size={15} />
          <span>Công Việc Hiện Trường</span>
        </span>
      ),
    },
    {
      key: "subordinates",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <UserCheck size={15} />
          <span>Việc Cấp Dưới</span>
        </span>
      ),
    },
    {
      key: "adhoc",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <PlusSquare size={15} />
          <span>Giao Việc Đột Xuất</span>
        </span>
      ),
    },
    {
      key: "schedules",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <CalendarDays size={15} />
          <span>Lịch Trực Ca Công Trường</span>
        </span>
      ),
    },
    {
      key: "checklists",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileCheck size={15} />
          <span>Biểu Mẫu & Nghiệm Thu</span>
        </span>
      ),
    },
    {
      key: "business-matrix",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <TableProperties size={15} />
          <span>Ma Trận Nghiệp Vụ</span>
        </span>
      ),
    },
    {
      key: "tracking",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin size={15} />
          <span>Bản Đồ GPS Lộ Trình</span>
        </span>
      ),
    },
    {
      key: "acc",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Database size={15} />
          <span>Đồng Bộ ACC Cloud</span>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4 pb-12">
      {/* Top Project & Role Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card rounded-xl border border-border shadow-xs">
        <Space size="middle" wrap>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#2db34b]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dự Án:
            </span>
          </div>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 230 }}
            options={[
              { value: "novaworld-pt", label: "NovaWorld Phan Thiết" },
              { value: "aqua-city", label: "Khu Đô Thị Aqua City" },
              { value: "grand-marina", label: "Grand Marina Saigon" },
            ]}
          />
          <Tag color="orange" className="font-semibold text-xs py-0.5 flex items-center gap-1">
            <HardHat size={12} />
            <span>Ban Quản Lý Thi Công (PCD)</span>
          </Tag>
          <Tag color="green" className="font-semibold text-xs py-0.5">
            Quy Trình: NVLG-PCD-SOP07
          </Tag>
          <Tag color="blue" className="font-semibold text-xs py-0.5">
            BIM / ACC: Đang Đồng Bộ
          </Tag>
        </Space>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dmd?tab=deliverables")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-xs font-medium text-foreground bg-muted/40 hover:bg-muted/60 transition-all cursor-pointer"
          >
            <Layers size={14} className="text-[#2db34b]" />
            <span>Xem Bản Vẽ AFC (DMD)</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/timeline")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-xs font-medium text-foreground bg-muted/40 hover:bg-muted/60 transition-all cursor-pointer"
          >
            <Clock size={14} className="text-blue-500" />
            <span>Tiến Độ MTL</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Tiến Độ Thi Công Thực Tế
                </div>
                <div className="text-2xl font-bold mt-1 text-foreground">77.1%</div>
                <div className="text-xs text-[#2db34b] font-medium mt-1">185/240 đầu việc hoàn thành</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#2db34b]">
                <TrendingUp size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Nghiệm Thu Tuần Hiện Trường
                </div>
                <div className="text-2xl font-bold mt-1 text-blue-600">24 Biên Bản</div>
                <div className="text-xs text-muted-foreground mt-1">18 đạt chuẩn, 6 đang kiểm tra lại</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Kỹ Sư Trực Ca Hiện Trường
                </div>
                <div className="text-2xl font-bold mt-1 text-purple-600">38 Nhân Sự</div>
                <div className="text-xs text-purple-600 font-medium mt-1">Độ phủ ca trực: 92%</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Users size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Tỷ Lệ Đúng Hạn SLA PCD
                </div>
                <div className="text-2xl font-bold mt-1 text-amber-500">94.5%</div>
                <div className="text-xs text-amber-600 font-medium mt-1">2 sự vụ cần xử lý trong 24h</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={22} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs Navigation */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
        <Tabs
          activeKey={selectedKey}
          onChange={handleTabChange}
          items={tabItems}
          type="line"
          className="pcd-tabs"
        />

        {/* Tab Content */}
        <div className="mt-4">
          {selectedKey === "dashboard" && <DashboardPage />}

          {selectedKey === "my-tasks" && (
            selectedTaskId ? (
              <MyTaskDetailPage
                taskInstanceId={selectedTaskId}
                onBack={() => setSelectedTaskId(null)}
              />
            ) : (
              <MyTasksPage
                onOpenDetail={(task: TaskInstanceResponse) => setSelectedTaskId(task.id)}
              />
            )
          )}

          {selectedKey === "subordinates" && <SubordinatesPage />}
          {selectedKey === "adhoc" && <CreateAdhocTaskPage />}
          {selectedKey === "schedules" && <WorkSchedulePage />}
          {selectedKey === "checklists" && <ChecklistsPage embedded />}
          {selectedKey === "business-matrix" && <BusinessMatrixPage embedded />}
          {selectedKey === "tracking" && <TrackingMapPage embedded />}
          {selectedKey === "acc" && <AccPage embedded />}
        </div>
      </div>
    </div>
  )
}
