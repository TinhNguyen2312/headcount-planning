import { Select } from "antd"
import type { LogicOperator } from "./accConditionConfig"

interface AccConditionOperatorSelectProps {
  operator: LogicOperator
  disabled?: boolean
  onChange: (op: LogicOperator) => void
}

export default function AccConditionOperatorSelect({
  operator,
  disabled,
  onChange,
}: AccConditionOperatorSelectProps) {
  return (
    <div className="flex items-center justify-center my-0.5">
      <Select<LogicOperator>
        value={operator}
        onChange={onChange}
        disabled={disabled}
        size="small"
        className="w-48 font-mono text-xs"
        options={[
          { value: "OR", label: "HOẶC (OR)" },
          { value: "AND", label: "VÀ (AND)" },
        ]}
      />
    </div>
  )
}
