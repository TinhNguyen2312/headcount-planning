import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useUI } from "@/hooks/useUI"
import { ChecklistsAPI } from "@/services/checklists"
import type { ParsedChecklistTemplate } from "@/types"

export interface ImportExecutionProgress {
  percent: number
  currentSheet: string
  errors: string[]
}

export function useExecuteChecklistImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<ImportExecutionProgress>(
    {
      percent: 0,
      currentSheet: "",
      errors: [],
    },
  )

  const queryClient = useQueryClient()
  const { message } = useUI()

  const resetProgress = () => {
    setIsImporting(false)
    setImportProgress({ percent: 0, currentSheet: "", errors: [] })
  }

  const executeImport = async (
    templates: ParsedChecklistTemplate[],
    onSuccess: () => void,
  ) => {
    setIsImporting(true)
    const totalSteps =
      templates.length + templates.reduce((acc, t) => acc + t.items.length, 0)
    let completedSteps = 0
    const importErrors: string[] = []

    for (let tIdx = 0; tIdx < templates.length; tIdx++) {
      const tpl = templates[tIdx]
      setImportProgress({
        percent: Math.round((completedSteps / totalSteps) * 100),
        currentSheet: `Đang tạo biểu mẫu: ${tpl.code} - ${tpl.name}`,
        errors: importErrors,
      })

      try {
        const createRes = await ChecklistsAPI.createOne({
          taskItemId: tpl.taskItemId as number,
          code: tpl.code.trim(),
          name: tpl.name.trim(),
          description: tpl.description.trim() || null,
          custodianDepartment: tpl.custodianDepartment?.trim() || null,
          recipients: tpl.recipients?.trim() || null,
        })

        const templateId = createRes.result.id

        completedSteps++
        setImportProgress((p) => ({
          ...p,
          percent: Math.round((completedSteps / totalSteps) * 100),
        }))

        if (templateId) {
          for (let iIdx = 0; iIdx < tpl.items.length; iIdx++) {
            const it = tpl.items[iIdx]
            setImportProgress((p) => ({
              ...p,
              currentSheet: `Đang tạo mục [${iIdx + 1}/${tpl.items.length}] của ${tpl.code}`,
            }))

            try {
              await ChecklistsAPI.addItem(templateId, {
                title: it.title.trim() || "Mục kiểm tra",
                checkingMethod: it.checkingMethod.trim() || null,
                orderIndex: it.orderIndex,
                requirementType:
                  it.requirementType === "none" ? null : it.requirementType,
              })
            } catch {
              importErrors.push(`Lỗi tạo mục "${it.title}" trong`)
            }

            completedSteps++
            setImportProgress((p) => ({
              ...p,
              percent: Math.round((completedSteps / totalSteps) * 100),
            }))
          }
        }
      } catch {
        importErrors.push(`Lỗi tạo biểu mẫu`)
      }
    }

    setIsImporting(false)
    queryClient.invalidateQueries({ queryKey: ["checklists"] })

    if (importErrors.length === 0) {
      message.success(`Import hoàn tất ${templates.length} biểu mẫu!`)
      onSuccess()
    } else {
      message.warning(
        `Import hoàn tất với ${importErrors.length} cảnh báo. Vui lòng kiểm tra lại.`,
      )
    }
  }

  return {
    isImporting,
    importProgress,
    executeImport,
    resetProgress,
  }
}
