"use client"

import { Button, Tabs } from "antd"
import { MapPin, Milestone, Plus, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"

import PageContainer from "@/components/Common/PageContainer"
import { MilestoneFlowView, MilestoneModal } from "@/components/Milestone"
import SectorRegionManager from "@/components/Projects/SectorRegionManager"
import { PropertyModal, PropertyTableView } from "@/components/Property"
import type { MilestoneResponse, PropertyResponse } from "@/types"

type AdminTabKey = "regions" | "milestones" | "properties"

function AdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") as AdminTabKey | null
  const [activeTab, setActiveTab] = useState<AdminTabKey>(
    tabFromUrl && ["regions", "milestones", "properties"].includes(tabFromUrl)
      ? tabFromUrl
      : "regions",
  )

  // Milestone modal state
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] =
    useState<MilestoneResponse | null>(null)

  // Property modal state
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [editingProperty, setEditingProperty] =
    useState<PropertyResponse | null>(null)

  const handleTabChange = (key: string) => {
    const nextTab = key as AdminTabKey
    setActiveTab(nextTab)
    router.replace(`/admin?tab=${nextTab}`, { scroll: false })
  }

  const tabItems = useMemo(
    () => [
      {
        key: "regions",
        label: (
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="size-4" />
            Khu vực & Vùng
          </span>
        ),
        children: (
          <div className="pt-2">
            <SectorRegionManager />
          </div>
        ),
      },
      {
        key: "milestones",
        label: (
          <span className="flex items-center gap-1.5 font-medium">
            <Milestone className="size-4" />
            Mốc tiến độ
          </span>
        ),
        children: (
          <div className="pt-2">
            <MilestoneFlowView
              onEditMilestone={(m) => setEditingMilestone(m)}
            />
          </div>
        ),
      },
      {
        key: "properties",
        label: (
          <span className="flex items-center gap-1.5 font-medium">
            <SlidersHorizontal className="size-4" />
            Cơ sở định biên
          </span>
        ),
        children: (
          <div className="pt-2">
            <PropertyTableView
              onEditProperty={(prop) => setEditingProperty(prop)}
            />
          </div>
        ),
      },
    ],
    [],
  )

  const renderRightSlot = () => {
    if (activeTab === "milestones") {
      return (
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => setIsAddMilestoneOpen(true)}
        >
          Thêm mốc tiến độ
        </Button>
      )
    }
    if (activeTab === "properties") {
      return (
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => setIsAddPropertyOpen(true)}
        >
          Thêm cơ sở định biên
        </Button>
      )
    }
    return null
  }

  return (
    <PageContainer title="Quản trị" rightSlot={renderRightSlot()}>
      <div className="pt-1">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          className="admin-tabs"
        />
      </div>

      <MilestoneModal
        milestone={editingMilestone}
        open={isAddMilestoneOpen || Boolean(editingMilestone)}
        onCancel={() => {
          setIsAddMilestoneOpen(false)
          setEditingMilestone(null)
        }}
      />

      <PropertyModal
        property={editingProperty}
        open={isAddPropertyOpen || Boolean(editingProperty)}
        onCancel={() => {
          setIsAddPropertyOpen(false)
          setEditingProperty(null)
        }}
      />
    </PageContainer>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminContent />
    </Suspense>
  )
}
