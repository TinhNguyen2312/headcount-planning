"use client"

import { Button, Tabs } from "antd"
import { Building2, Plus, Scale } from "lucide-react"
import { useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import {
  AddHeadcountProjectModal,
  HeadcountProjectTableView,
} from "@/components/HeadcountProject"
import { StandardModal, StandardTableView } from "@/components/Standard"
import type { HeadcountStandardResponse } from "@/types"

export default function StandardsPage() {
  const [activeTab, setActiveTab] = useState("standards")
  const [isAddStandardOpen, setIsAddStandardOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [editingStandard, setEditingStandard] =
    useState<HeadcountStandardResponse | null>(null)
  const [viewingStandard, setViewingStandard] =
    useState<HeadcountStandardResponse | null>(null)

  const tabItems = [
    {
      key: "standards",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Scale className="size-4" />
          Khung định biên chuẩn
        </span>
      ),
      children: (
        <div className="pt-2">
          <StandardTableView
            onEditStandard={(std) => setEditingStandard(std)}
            onViewStandard={(std) => setViewingStandard(std)}
          />
        </div>
      ),
    },
    {
      key: "projects",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Building2 className="size-4" />
          Dự án chạy định biên
        </span>
      ),
      children: (
        <div className="pt-2">
          <HeadcountProjectTableView />
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Mô hình định biên"
      rightSlot={
        activeTab === "standards" ? (
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setIsAddStandardOpen(true)}
          >
            Thêm định biên
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setIsAddProjectOpen(true)}
          >
            Kích hoạt dự án
          </Button>
        )
      }
    >
      <div className="pt-1">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          className="standards-tabs"
        />
      </div>

      <StandardModal
        standard={viewingStandard || editingStandard}
        open={
          isAddStandardOpen ||
          Boolean(editingStandard) ||
          Boolean(viewingStandard)
        }
        readOnly={Boolean(viewingStandard)}
        onCancel={() => {
          setIsAddStandardOpen(false)
          setEditingStandard(null)
          setViewingStandard(null)
        }}
      />

      <AddHeadcountProjectModal
        open={isAddProjectOpen}
        onCancel={() => setIsAddProjectOpen(false)}
      />
    </PageContainer>
  )
}
