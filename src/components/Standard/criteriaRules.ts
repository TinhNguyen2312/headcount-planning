import type {
  ConditionOperator,
  HeadcountCriteriaResponse,
  PropertyDataType,
  PropertyResponse,
} from "@/types"

export type CriteriaInputMode =
  | "RANGE"
  | "SINGLE_NUMBER"
  | "SELECT"
  | "BOOLEAN"
  | "TEXT"

export interface DataTypeOperatorRule {
  value: ConditionOperator
  label: string
  mode: CriteriaInputMode
}

export interface DataTypeConfig {
  operators: DataTypeOperatorRule[]
  defaultOperator: ConditionOperator
  valueType: "number" | "text"
}

export const DATA_TYPE_RULES: Record<PropertyDataType, DataTypeConfig> = {
  NUMBER: {
    operators: [
      { value: "BETWEEN", label: "BETWEEN", mode: "RANGE" },
      { value: ">=", label: ">=", mode: "SINGLE_NUMBER" },
      { value: "<=", label: "<=", mode: "SINGLE_NUMBER" },
      { value: ">", label: ">", mode: "SINGLE_NUMBER" },
      { value: "<", label: "<", mode: "SINGLE_NUMBER" },
      { value: "=", label: "=", mode: "SINGLE_NUMBER" },
    ],
    defaultOperator: "BETWEEN",
    valueType: "number",
  },
  SELECT: {
    operators: [{ value: "=", label: "=", mode: "SELECT" }],
    defaultOperator: "=",
    valueType: "text",
  },
  BOOLEAN: {
    operators: [{ value: "=", label: "=", mode: "BOOLEAN" }],
    defaultOperator: "=",
    valueType: "text",
  },
  STRING: {
    operators: [{ value: "=", label: "=", mode: "TEXT" }],
    defaultOperator: "=",
    valueType: "text",
  },
}

export const BOOLEAN_OPTIONS = [
  { value: "true", label: "Có / Đúng" },
  { value: "false", label: "Không / Sai" },
]

export function getOperatorsForDataType(
  dataType?: PropertyDataType | null,
): DataTypeOperatorRule[] {
  if (!dataType || !DATA_TYPE_RULES[dataType]) {
    return DATA_TYPE_RULES.NUMBER.operators
  }
  return DATA_TYPE_RULES[dataType].operators
}

export function getDefaultOperatorForDataType(
  dataType?: PropertyDataType | null,
): ConditionOperator {
  if (!dataType || !DATA_TYPE_RULES[dataType]) {
    return "BETWEEN"
  }
  return DATA_TYPE_RULES[dataType].defaultOperator
}

export function isOperatorAllowedForDataType(
  dataType: PropertyDataType,
  operator: ConditionOperator,
): boolean {
  const allowed = getOperatorsForDataType(dataType)
  return allowed.some((op) => op.value === operator)
}

export function formatCriteriaDisplay(
  crit:
    | HeadcountCriteriaResponse
    | {
        conditionOperator: ConditionOperator
        minValue?: number | null
        maxValue?: number | null
        valueText?: string | null
        property?: PropertyResponse | null
      },
): string {
  const prop = crit.property
  const propName = prop?.name || "Chỉ số"
  const unit = prop?.unit ? ` ${prop.unit}` : ""
  const dataType = prop?.dataType || "NUMBER"
  const op = crit.conditionOperator

  if (dataType === "SELECT") {
    return `${propName}: ${crit.valueText || "Chưa chọn"}`
  }

  if (dataType === "BOOLEAN") {
    const isTrue =
      crit.valueText === "true" || crit.valueText === "1" || crit.minValue === 1
    return `${propName}: ${isTrue ? "Có" : "Không"}`
  }

  if (dataType === "STRING") {
    return `${propName}: "${crit.valueText || ""}"`
  }

  // NUMBER
  if (op === "BETWEEN") {
    const minStr =
      crit.minValue !== null && crit.minValue !== undefined
        ? String(crit.minValue)
        : "?"
    const maxStr =
      crit.maxValue !== null && crit.maxValue !== undefined
        ? String(crit.maxValue)
        : "?"
    return `${propName}: ${minStr} - ${maxStr}${unit}`
  }
  if (op === ">" || op === ">=" || op === "=") {
    const minStr =
      crit.minValue !== null && crit.minValue !== undefined
        ? String(crit.minValue)
        : "?"
    return `${propName} ${op} ${minStr}${unit}`
  }
  if (op === "<" || op === "<=") {
    const maxStr =
      crit.maxValue !== null && crit.maxValue !== undefined
        ? String(crit.maxValue)
        : "?"
    return `${propName} ${op} ${maxStr}${unit}`
  }

  return `${propName}`
}
