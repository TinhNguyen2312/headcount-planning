"use client"

import { Button, Tabs } from "antd"
import { MapPin, Milestone, Plus, ShieldCheck, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"

import { AccessRoleModal, AccessRoleTableView } from "@/components/AccessRole"
import PageContainer from "@/components/Common/PageContainer"
import { MilestoneFlowView, MilestoneModal } from "@/components/Milestone"
import SectorRegionManager from "@/components/Projects/SectorRegionManager"
import { PropertyModal, PropertyTableView } from "@/components/Property"
import type {
  AccessRoleResponse,
  MilestoneResponse,
  PropertyResponse,
} from "@/types"

type AdminTabKey = "regions" | "milestones" | "properties" | "access-roles"

function AdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") as AdminTabKey | null
  const [activeTab, setActiveTab] = useState<AdminTabKey>(
    tabFromUrl &&
      ["regions", "milestones", "properties", "access-roles"].includes(
        tabFromUrl,
      )
      ? tabFromUrl
      : "regions",
  )

  // Access role modal state
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<AccessRoleResponse | null>(null)
  const [isDuplicate, setIsDuplicate] = useState(false)

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
      {
        key: "access-roles",
        label: (
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4" />
            Vai trò & Phân quyền
          </span>
        ),
        children: (
          <div className="pt-2">
            <AccessRoleTableView
              onEditRole={(role) => {
                setEditingRole(role)
                setIsDuplicate(false)
              }}
              onDuplicateRole={(role) => {
                setEditingRole(role)
                setIsDuplicate(true)
              }}
            />
          </div>
        ),
      },
    ],
    [],
  )

  const renderRightSlot = () => {
    if (activeTab === "access-roles") {
      return (
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => {
            setEditingRole(null)
            setIsDuplicate(false)
            setIsAddRoleOpen(true)
          }}
        >
          Thêm vai trò truy cập
        </Button>
      )
    }
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

      <AccessRoleModal
        role={editingRole}
        isDuplicate={isDuplicate}
        open={isAddRoleOpen || Boolean(editingRole)}
        onCancel={() => {
          setIsAddRoleOpen(false)
          setEditingRole(null)
          setIsDuplicate(false)
        }}
      />

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
