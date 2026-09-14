"use client"

import { Button, Tabs } from "antd"
import {
  Building2,
  Milestone,
  Plus,
  Shield,
  SlidersHorizontal,
} from "lucide-react"
import { useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import DepartmentFlowView from "@/components/Department/DepartmentFlowView"
import DepartmentModal from "@/components/Department/DepartmentModal"
import { MilestoneFlowView, MilestoneModal } from "@/components/Milestone"
import { PropertyModal, PropertyTableView } from "@/components/Property"
import RoleFlowView from "@/components/Role/RoleFlowView"
import RoleModal from "@/components/Role/RoleModal"
import type {
  DepartmentResponse,
  MilestoneResponse,
  PropertyResponse,
  RoleResponse,
} from "@/types"

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<
    "roles" | "departments" | "milestones" | "properties"
  >("roles")

  // Property modal states
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [editingProperty, setEditingProperty] =
    useState<PropertyResponse | null>(null)

  // Role modal states
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null)

  // Department modal states
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentResponse | null>(null)

  // Milestone modal states
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] =
    useState<MilestoneResponse | null>(null)

  const tabItems = [
    {
      key: "roles",
      icon: <Shield className="size-4" />,
      label: "Chức vụ",
      children: (
        <div className="pt-2">
          <RoleFlowView onEditRole={(role) => setEditingRole(role)} />
        </div>
      ),
    },
    {
      key: "departments",
      icon: <Building2 className="size-4" />,
      label: "Phòng ban",
      children: (
        <div className="pt-2">
          <DepartmentFlowView
            onEditDepartment={(dept) => setEditingDepartment(dept)}
          />
        </div>
      ),
    },
    {
      key: "milestones",
      icon: <Milestone className="size-4" />,
      label: "Mốc tiến độ chuẩn",
      children: (
        <div className="pt-2">
          <MilestoneFlowView onEditMilestone={(m) => setEditingMilestone(m)} />
        </div>
      ),
    },
    {
      key: "properties",
      icon: <SlidersHorizontal className="size-4" />,
      label: "Cơ sở định biên",
      children: (
        <div className="pt-2">
          <PropertyTableView
            onEditProperty={(prop) => setEditingProperty(prop)}
          />
        </div>
      ),
    },
  ]

  const getAddButtonText = () => {
    switch (activeTab) {
      case "roles":
        return "Thêm chức vụ"
      case "departments":
        return "Thêm phòng ban"
      case "milestones":
        return "Thêm mốc tiến độ"
      case "properties":
        return "Thêm cơ sở định biên"
      default:
        return "Thêm mới"
    }
  }

  const handleAddClick = () => {
    if (activeTab === "roles") {
      setIsAddRoleOpen(true)
    } else if (activeTab === "departments") {
      setIsAddDepartmentOpen(true)
    } else if (activeTab === "milestones") {
      setIsAddMilestoneOpen(true)
    } else if (activeTab === "properties") {
      setIsAddPropertyOpen(true)
    }
  }

  return (
    <PageContainer
      title="Cơ cấu tổ chức & Master Data"
      rightSlot={
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={handleAddClick}
        >
          {getAddButtonText()}
        </Button>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) =>
          setActiveTab(
            key as "roles" | "departments" | "milestones" | "properties",
          )
        }
        items={tabItems}
        tabBarGutter={24}
        className="w-full"
      />

      <RoleModal
        role={editingRole}
        open={isAddRoleOpen || Boolean(editingRole)}
        onCancel={() => {
          setIsAddRoleOpen(false)
          setEditingRole(null)
        }}
      />

      <DepartmentModal
        department={editingDepartment}
        open={isAddDepartmentOpen || Boolean(editingDepartment)}
        onCancel={() => {
          setIsAddDepartmentOpen(false)
          setEditingDepartment(null)
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
