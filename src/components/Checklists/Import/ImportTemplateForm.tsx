import { Input } from "antd"
import { TaskTreeSelect } from "@/components/Common/TaskTreeSelect"
import type { ParsedChecklistTemplate } from "@/types"

interface ImportTemplateFormProps {
  template: ParsedChecklistTemplate
  onUpdateTemplate: (fields: Partial<ParsedChecklistTemplate>) => void
}

export function ImportTemplateForm({
  template,
  onUpdateTemplate,
}: ImportTemplateFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/20 border border-border rounded-lg">
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label
          className="text-base font-medium text-foreground flex items-center gap-1"
          htmlFor="import-task-item"
        >
          Nghiệp vụ áp dụng *
          {!template.taskItemId && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-normal">
              (Bắt buộc)
            </span>
          )}
        </label>
        <TaskTreeSelect
          id="import-task-item"
          placeholder="Chọn nghiệp vụ (leaf task)..."
          value={template.taskItemId}
          onChange={(val) => onUpdateTemplate({ taskItemId: val })}
          status={!template.taskItemId ? "warning" : ""}
          className="w-full"
          maxHeight={320}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-base font-medium text-foreground"
          htmlFor="import-tpl-code"
        >
          Mã biểu mẫu *
        </label>
        <Input
          id="import-tpl-code"
          size="small"
          value={template.code}
          onChange={(e) => onUpdateTemplate({ code: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-base font-medium text-foreground"
          htmlFor="import-tpl-name"
        >
          Tên biểu mẫu *
        </label>
        <Input
          id="import-tpl-name"
          size="small"
          value={template.name}
          onChange={(e) => onUpdateTemplate({ name: e.target.value })}
        />
      </div>
    </div>
  )
}
