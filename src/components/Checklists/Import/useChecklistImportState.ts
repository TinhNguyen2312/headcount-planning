import { useMemo, useState } from "react"
import { useUI } from "@/hooks/useUI"
import type { ParsedChecklistItem, ParsedChecklistTemplate } from "@/types"

export interface ChecklistImportValidation {
  validCount: number
  totalItemsCount: number
  isAllValid: boolean
  errors: string[]
}

export function useChecklistImportState() {
  const [fileName, setFileName] = useState<string>("")
  const [templates, setTemplates] = useState<ParsedChecklistTemplate[]>([])
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0)

  const { message } = useUI()

  const activeTemplate = templates[activeSheetIndex]

  const loadParsedTemplates = (
    name: string,
    parsed: ParsedChecklistTemplate[],
  ) => {
    setFileName(name)
    setTemplates(parsed)
    setActiveSheetIndex(0)
  }

  const resetState = () => {
    setFileName("")
    setTemplates([])
    setActiveSheetIndex(0)
  }

  const updateActiveTemplate = (fields: Partial<ParsedChecklistTemplate>) => {
    setTemplates((prev) =>
      prev.map((tpl, idx) =>
        idx === activeSheetIndex ? { ...tpl, ...fields } : tpl,
      ),
    )
  }

  const applyTaskItemToAll = (taskItemId: number | null) => {
    if (!taskItemId) return
    setTemplates((prev) => prev.map((tpl) => ({ ...tpl, taskItemId })))
    message.success("Đã áp dụng nghiệp vụ cho tất cả các biểu mẫu!")
  }

  const updateItem = (itemId: string, fields: Partial<ParsedChecklistItem>) => {
    setTemplates((prev) =>
      prev.map((tpl, idx) => {
        if (idx !== activeSheetIndex) return tpl
        return {
          ...tpl,
          items: tpl.items.map((it) =>
            it.id === itemId ? { ...it, ...fields } : it,
          ),
        }
      }),
    )
  }

  const deleteItem = (itemId: string) => {
    setTemplates((prev) =>
      prev.map((tpl, idx) => {
        if (idx !== activeSheetIndex) return tpl
        return {
          ...tpl,
          items: tpl.items.filter((it) => it.id !== itemId),
        }
      }),
    )
  }

  const addItem = () => {
    const newItem: ParsedChecklistItem = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `item-${Date.now()}`,
      orderIndex: (activeTemplate?.items.length || 0) + 1,
      title: "",
      checkingMethod: "",
      requirementType: "none",
    }

    setTemplates((prev) =>
      prev.map((tpl, idx) => {
        if (idx !== activeSheetIndex) return tpl
        return {
          ...tpl,
          items: [...tpl.items, newItem],
        }
      }),
    )
  }

  const validationStatus: ChecklistImportValidation = useMemo(() => {
    let validCount = 0
    let totalItemsCount = 0
    const errors: string[] = []

    templates.forEach((tpl) => {
      totalItemsCount += tpl.items.length
      if (!tpl.taskItemId) {
        errors.push(`Sheet "${tpl.sheetName}": Chưa chọn nghiệp vụ áp dụng`)
      } else if (!tpl.code.trim()) {
        errors.push(`Sheet "${tpl.sheetName}": Thiếu mã biểu mẫu`)
      } else if (!tpl.name.trim()) {
        errors.push(`Sheet "${tpl.sheetName}": Thiếu tên biểu mẫu`)
      } else {
        validCount++
      }
    })

    const isAllValid = templates.length > 0 && validCount === templates.length
    return { validCount, totalItemsCount, isAllValid, errors }
  }, [templates])

  return {
    fileName,
    templates,
    activeSheetIndex,
    activeTemplate,
    validationStatus,
    setActiveSheetIndex,
    loadParsedTemplates,
    resetState,
    updateActiveTemplate,
    applyTaskItemToAll,
    updateItem,
    deleteItem,
    addItem,
  }
}
