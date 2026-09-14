"use client"

import { Button } from "antd"
import { Plus } from "lucide-react"
import { useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import { MilestoneFlowView, MilestoneModal } from "@/components/Milestone"
import type { MilestoneResponse } from "@/types"

export default function MilestonesPage() {
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] =
    useState<MilestoneResponse | null>(null)

  return (
    <PageContainer
      title="Mốc tiến độ chuẩn"
      rightSlot={
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => setIsAddMilestoneOpen(true)}
        >
          Thêm mốc tiến độ
        </Button>
      }
    >
      <div className="pt-2">
        <MilestoneFlowView onEditMilestone={(m) => setEditingMilestone(m)} />
      </div>

      <MilestoneModal
        milestone={editingMilestone}
        open={isAddMilestoneOpen || Boolean(editingMilestone)}
        onCancel={() => {
          setIsAddMilestoneOpen(false)
          setEditingMilestone(null)
        }}
      />
    </PageContainer>
  )
}
