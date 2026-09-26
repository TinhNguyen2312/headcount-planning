import { Tag } from "antd"
import { useMemo } from "react"

import { checklistQueries } from "@/hooks/server/checklists"
import type { ChecklistResponse } from "@/types"

interface ChecklistMultiSelectCellProps {
  taskId?: number
  checklists?: ChecklistResponse[]
}

const ChecklistMultiSelectCell = ({
  taskId,
  checklists = [],
}: ChecklistMultiSelectCellProps) => {
  const { data: allTemplates = [] } = checklistQueries.useList()

  const assignedTemplates = useMemo(() => {
    if (checklists.length > 0) {
      return checklists
    }
    if (!taskId) return []
    return allTemplates.filter((t) => t.taskItemId === taskId)
  }, [checklists, allTemplates, taskId])

  if (assignedTemplates.length === 0) {
    return <span className="text-md text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {assignedTemplates.map((item) => (
        <Tag
          key={item.id}
          className="m-0 text-[11px] max-w-full truncate"
          title={item.code ? `[${item.code}] ${item.name}` : item.name}
        >
          {item.code ? `${item.code}` : item.name}
        </Tag>
      ))}
    </div>
  )
}

export default ChecklistMultiSelectCell
