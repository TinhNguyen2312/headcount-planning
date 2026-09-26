export type AccFactorType = "submittal" | "rfis" | "schedule"
export type LogicOperator = "AND" | "OR"

export interface FactorFieldDef {
  key: string
  label: string
  placeholder?: string
}

export interface FactorConfig {
  key: AccFactorType
  label: string
  fields: FactorFieldDef[]
}

export const ACC_FACTORS_CONFIG: Record<AccFactorType, FactorConfig> = {
  submittal: {
    key: "submittal",
    label: "Submittal",
    fields: [
      {
        key: "type",
        label: "Type (Loại đệ trình)",
        placeholder: "Nhập loại đệ trình (vd: Thi công, Kiểm tra)...",
      },
      {
        key: "package",
        label: "Package (Gói thầu)",
        placeholder: "Nhập tên hoặc mã gói thầu...",
      },
      {
        key: "spec",
        label: "Spec (Phân mục)",
        placeholder: "Nhập mã phân mục spec...",
      },
    ],
  },
  rfis: {
    key: "rfis",
    label: "RFIs",
    fields: [
      {
        key: "type",
        label: "Type (Loại RFI)",
        placeholder: "Nhập loại RFI...",
      },
      {
        key: "priority",
        label: "Priority (Độ ưu tiên)",
        placeholder: "Nhập độ ưu tiên (vd: Normal, High, Low)...",
      },
      {
        key: "status",
        label: "Status (Trạng thái)",
        placeholder: "Nhập trạng thái (vd: submitted, open, answered)...",
      },
      {
        key: "discipline",
        label: "Discipline (Bộ môn)",
        placeholder: "Nhập bộ môn (vd: MEP, Kiến trúc, Kết cấu)...",
      },
      {
        key: "category",
        label: "Category (Hạng mục)",
        placeholder: "Nhập hạng mục...",
      },
      {
        key: "costImpact",
        label: "Cost Impact (Tác động chi phí)",
        placeholder: "Nhập tác động chi phí (vd: Yes, No)...",
      },
      {
        key: "scheduleImpact",
        label: "Schedule Impact (Tác động tiến độ)",
        placeholder: "Nhập tác động tiến độ (vd: Yes, No)...",
      },
    ],
  },
  schedule: {
    key: "schedule",
    label: "Schedule",
    fields: [],
  },
}

export const normalizeFieldKey = (raw: string): string => {
  return raw
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
}

export interface AccRuleItem {
  id: string
  field: string
  value: string
  operator: LogicOperator
}

export interface AccConditionBuilderState {
  factor: AccFactorType
  rules: AccRuleItem[]
}

export const createDefaultRule = (field = "type"): AccRuleItem => ({
  id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
  field,
  value: "",
  operator: "OR",
})

export const buildAccConditionString = (
  state: AccConditionBuilderState,
): string => {
  const validRules = state.rules.filter(
    (rule) => rule.field && rule.value.trim() !== "",
  )

  if (validRules.length === 0) {
    return ""
  }

  let inner = ""
  for (let i = 0; i < validRules.length; i++) {
    const rule = validRules[i]
    inner += `${rule.field}="${rule.value.trim()}"`
    if (i < validRules.length - 1) {
      inner += rule.operator || "OR"
    }
  }

  return `${state.factor}[${inner}]`
}

export const parseAccConditionString = (
  raw?: string | null,
): AccConditionBuilderState => {
  const defaultState: AccConditionBuilderState = {
    factor: "submittal",
    rules: [],
  }

  if (!raw || typeof raw !== "string") {
    return defaultState
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return defaultState
  }

  const match = trimmed.match(/^([a-zA-Z0-9_]+)\[(.*)\]$/)
  if (!match) {
    return defaultState
  }

  const rawFactor = match[1].toLowerCase() as AccFactorType
  const factor: AccFactorType =
    rawFactor in ACC_FACTORS_CONFIG ? rawFactor : "submittal"
  const inner = match[2].trim()

  if (!inner) {
    return { factor, rules: [] }
  }

  const itemRegex = /(AND|OR)?\s*([a-zA-Z0-9_]+)\s*=\s*"([^"]*)"/gi
  const rules: AccRuleItem[] = []
  let itemMatch: RegExpExecArray | null

  while ((itemMatch = itemRegex.exec(inner)) !== null) {
    const leadingOp = itemMatch[1]
      ? (itemMatch[1].toUpperCase() as LogicOperator)
      : null
    const field = itemMatch[2]
    const value = itemMatch[3]

    if (rules.length > 0 && leadingOp) {
      rules[rules.length - 1].operator = leadingOp
    }

    rules.push({
      id: `rule-${rules.length}-${Math.random().toString(36).substr(2, 6)}`,
      field,
      value,
      operator: "OR",
    })
  }

  return { factor, rules }
}
