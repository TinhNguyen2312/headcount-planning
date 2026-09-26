import { Button } from "antd"
import { Settings } from "lucide-react"
import { useState } from "react"

import AccConditionModal from "@/components/BusinessMatrix/AccConditionModal"
import type { BusinessMatrixResponse } from "@/types"

interface AccConditionCellProps {
  record: BusinessMatrixResponse
  onSave: (accCondition: string | null) => Promise<void> | void
  isEditing: boolean
}

export default function AccConditionCell({
  record,
  onSave,
  isEditing,
}: AccConditionCellProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (accCondition: string | null) => {
    try {
      setIsSaving(true)
      await onSave(accCondition)
      setOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<Settings className="size-3.5" />}
        className="p-0 h-auto text-xs inline-flex items-center gap-1"
        onClick={() => setOpen(true)}
        title="Cấu hình ACC"
      >
        Cấu hình ACC
      </Button>
      <AccConditionModal
        isEditing={isEditing}
        open={open}
        record={record}
        isSaving={isSaving}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
