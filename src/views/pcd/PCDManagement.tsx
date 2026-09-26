import { Skeleton, Tabs } from "antd"
import {
  ClipboardCheck,
  Database,
  Layers,
  MapPin,
  TableProperties,
} from "lucide-react"
import { Suspense, useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import AccPage from "./AccPage"
import BusinessMatrixPage from "./BusinessMatrixPage"
import ChecklistsPage from "./ChecklistsPage"
import TrackingMapPage from "./TrackingMapPage"

export type PCDTabKey =
  | "checklists"
  | "business-matrix"
  | "tracking-map"
  | "acc"

interface PCDManagementProps {
  defaultTab?: PCDTabKey
}

export default function PCDManagement({
  defaultTab = "checklists",
}: PCDManagementProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  const tabItems = [
    {
      key: "checklists",
      label: (
        <span className="flex items-center gap-2 font-medium">
          <ClipboardCheck className="size-4" />
          Checklists
        </span>
      ),
      children: (
        <div className="pt-1">
          <ChecklistsPage embedded />
        </div>
      ),
    },
    {
      key: "business-matrix",
      label: (
        <span className="flex items-center gap-2 font-medium">
          <TableProperties className="size-4" />
          Ma trận nghiệp vụ
        </span>
      ),
      children: (
        <div className="pt-1">
          <Suspense fallback={<Skeleton active className="p-4" />}>
            <BusinessMatrixPage embedded />
          </Suspense>
        </div>
      ),
    },
    {
      key: "tracking-map",
      label: (
        <span className="flex items-center gap-2 font-medium">
          <MapPin className="size-4" />
          Lộ trình di chuyển
        </span>
      ),
      children: (
        <div className="pt-1">
          <TrackingMapPage embedded />
        </div>
      ),
    },
    {
      key: "acc",
      label: (
        <span className="flex items-center gap-2 font-medium">
          <Database className="size-4" />
          Đồng bộ ACC
        </span>
      ),
      children: (
        <div className="pt-1">
          <AccPage embedded />
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-2.5">
          <Layers className="size-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Quản lý PCD
            </h1>
          </div>
        </div>
      }
      subtitle="Quản lý tập trung biểu mẫu checklist, ma trận phân bổ nghiệp vụ, lộ trình di chuyển và đồng bộ Autodesk Construction Cloud"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        destroyOnHidden
        className="w-full"
      />
    </PageContainer>
  )
}
