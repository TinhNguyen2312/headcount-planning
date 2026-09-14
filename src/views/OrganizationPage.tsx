"use client"

import { Button, Tabs } from "antd"
import { Building2, Plus, Shield } from "lucide-react"
import { useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import DepartmentFlowView from "@/components/Department/DepartmentFlowView"
import DepartmentModal from "@/components/Department/DepartmentModal"
import RoleFlowView from "@/components/Role/RoleFlowView"
import RoleModal from "@/components/Role/RoleModal"
import type { DepartmentResponse, RoleResponse } from "@/types"

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "departments">("roles")

  // Role modal states
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null)

  // Department modal states
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentResponse | null>(null)

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
  ]

  return (
    <PageContainer
      title="Cơ cấu tổ chức & Phân quyền"
      rightSlot={
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => {
            if (activeTab === "roles") {
              setIsAddRoleOpen(true)
            } else {
              setIsAddDepartmentOpen(true)
            }
          }}
        >
          {activeTab === "roles" ? "Thêm chức vụ" : "Thêm phòng ban"}
        </Button>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "roles" | "departments")}
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
    </PageContainer>
  )
}
