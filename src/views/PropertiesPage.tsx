"use client"

import { Button } from "antd"
import { Plus } from "lucide-react"
import { useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import { PropertyModal, PropertyTableView } from "@/components/Property"
import type { PropertyResponse } from "@/types"

export default function PropertiesPage() {
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [editingProperty, setEditingProperty] =
    useState<PropertyResponse | null>(null)

  return (
    <PageContainer
      title="Cơ sở định biên"
      rightSlot={
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => setIsAddPropertyOpen(true)}
        >
          Thêm cơ sở định biên
        </Button>
      }
    >
      <div className="pt-2">
        <PropertyTableView
          onEditProperty={(prop) => setEditingProperty(prop)}
        />
      </div>

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
