"use client"

import { Button } from "antd"
import { Plus } from "lucide-react"
import { useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import { StandardModal, StandardTableView } from "@/components/Standard"
import type { HeadcountStandardResponse } from "@/types"

export default function StandardsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingStandard, setEditingStandard] =
    useState<HeadcountStandardResponse | null>(null)

  return (
    <PageContainer
      title="Khung định biên"
      rightSlot={
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => setIsAddOpen(true)}
        >
          Thêm định biên
        </Button>
      }
    >
      <div className="pt-2">
        <StandardTableView onEditStandard={(std) => setEditingStandard(std)} />
      </div>

      <StandardModal
        standard={editingStandard}
        open={isAddOpen || Boolean(editingStandard)}
        onCancel={() => {
          setIsAddOpen(false)
          setEditingStandard(null)
        }}
      />
    </PageContainer>
  )
}
