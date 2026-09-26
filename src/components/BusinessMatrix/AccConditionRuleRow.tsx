import { Button, Input, Select, Tooltip } from "antd"
import { Trash2 } from "lucide-react"
import { useMemo } from "react"
import type { AccRuleItem, FactorFieldDef } from "./accConditionConfig"

interface AccConditionRuleRowProps {
  rule: AccRuleItem
  fields: FactorFieldDef[]
  disabled?: boolean
  onFieldChange: (field: string) => void
  onValueChange: (value: string) => void
  onDelete: () => void
}

export default function AccConditionRuleRow({
  rule,
  fields,
  disabled,
  onFieldChange,
  onValueChange,
  onDelete,
}: AccConditionRuleRowProps) {
  const currentFieldDef = fields.find((f) => f.key === rule.field)
  const placeholder = currentFieldDef?.placeholder || "Nhập giá trị..."

  const options = useMemo(() => {
    const list: Array<{ value: string; label: React.ReactNode }> = fields.map(
      (f) => ({
        value: f.key,
        label: f.label,
      }),
    )

    if (rule.field && !list.some((item) => item.value === rule.field)) {
      list.push({
        value: rule.field,
        label: rule.field,
      })
    }

    return list
  }, [fields, rule.field])

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5 shadow-xs">
      <Select
        value={rule.field}
        onChange={(val) => onFieldChange(val)}
        className="w-56 shrink-0"
        placeholder="Chọn trường..."
        disabled={disabled}
        options={options}
      />
      <span className="text-muted-foreground font-semibold">=</span>
      <Input
        value={rule.value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      {!disabled && (
        <Tooltip title="Xóa điều kiện này">
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 className="size-4" />}
            onClick={onDelete}
          />
        </Tooltip>
      )}
    </div>
  )
}
