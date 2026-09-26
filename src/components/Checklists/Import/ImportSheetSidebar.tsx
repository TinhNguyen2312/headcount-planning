import { Tag, Tooltip } from "antd"
import { AlertCircle, CheckCircle2, Layers } from "lucide-react"
import type { ParsedChecklistTemplate } from "@/types"

interface ImportSheetSidebarProps {
  templates: ParsedChecklistTemplate[]
  activeSheetIndex: number
  onSelectSheet: (index: number) => void
}

export function ImportSheetSidebar({
  templates,
  activeSheetIndex,
  onSelectSheet,
}: ImportSheetSidebarProps) {
  return (
    <div className="col-span-2 flex flex-col gap-2 overflow-y-auto pr-1 border-r border-border">
      <div className="flex items-center gap-1.5 text-base font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        <Layers className="size-3.5" />
        <span>Danh sách checklist ({templates.length})</span>
      </div>
      {templates.map((tpl, idx) => {
        const isSelected = idx === activeSheetIndex
        const isValid = !!tpl.taskItemId && !!tpl.name.trim()

        return (
          <button
            key={tpl.sheetName}
            type="button"
            onClick={() => onSelectSheet(idx)}
            className={`flex flex-col gap-1 p-2.5 rounded-md text-left transition-all border ${
              isSelected
                ? "border-primary bg-primary/5 text-foreground shadow-xs"
                : "border-border/60 bg-card hover:bg-muted/50 text-card-foreground"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-base font-semibold">
                {tpl.code || tpl.sheetName}
              </span>
              {isValid ? (
                <Tooltip title="Đã đủ thông tin">
                  <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </Tooltip>
              ) : (
                <Tooltip title="Chưa chọn nghiệp vụ áp dụng">
                  <AlertCircle className="size-4.5 text-amber-500 shrink-0" />
                </Tooltip>
              )}
            </div>
            <span className="text-base line-clamp-1 text-muted-foreground font-normal">
              {tpl.name || "Chưa có tên"}
            </span>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>{tpl.items.length} mục</span>
              {!tpl.taskItemId && (
                <Tag
                  color="warning"
                  variant="filled"
                  className="text-[10px] leading-tight px-1 py-0 m-0"
                >
                  Thiếu nghiệp vụ
                </Tag>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
