import { DatePicker, InputNumber, Select, Space, TimePicker } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import type React from "react"

export interface FilterUIItem {
  key: string
  label: string
  isActive: (value?: unknown) => boolean
  reset: () => void
  render: (close: () => void) => React.ReactNode
}

export interface FilterDef<TItem, TValue = unknown> extends FilterUIItem {
  value: TValue
  onChange: (value: TValue) => void
  filterFn?: (item: TItem, value: TValue) => boolean
  asyncFilterFn?: (item: TItem, value: TValue) => Promise<boolean>
  renderControl?: (
    value: TValue,
    onChange: (value: TValue) => void,
  ) => React.ReactNode
}

export interface TimeRangeValue {
  from: Dayjs | null
  to: Dayjs | null
}

export const DEFAULT_TIME_RANGE: TimeRangeValue = { from: null, to: null }

export interface DateRangeValue {
  from: Date | null
  to: Date | null
}

export const DEFAULT_DATE_RANGE: DateRangeValue = { from: null, to: null }

export type NumberOperator = "gt" | "gte" | "lt" | "lte" | "eq"

export interface NumberCompareValue {
  operator: NumberOperator
  number: number | null
}

export const DEFAULT_NUMBER_COMPARE: NumberCompareValue = {
  operator: "gte",
  number: null,
}

const OPERATOR_LABELS: Record<NumberOperator, string> = {
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  eq: "=",
}

interface SelectFilterOptions<TItem, TValue> {
  key: string
  label: string
  value: TValue | "all"
  onChange: (value: TValue | "all") => void
  getField: (item: TItem) => TValue
  options: { label: string; value: TValue | "all" }[]
  placeholder?: string
  width?: number
  asyncFilterFn?: (item: TItem, value: TValue | "all") => Promise<boolean>
}

export function createSelectFilter<TItem, TValue>({
  key,
  label,
  value,
  onChange,
  getField,
  options,
  placeholder,
  width = 180,
  asyncFilterFn,
}: SelectFilterOptions<TItem, TValue>): FilterDef<TItem, TValue | "all"> {
  const renderControl = (
    val: TValue | "all",
    onChg: (val: TValue | "all") => void,
  ) => (
    <Select
      style={{ minWidth: width }}
      value={val}
      onChange={onChg}
      placeholder={placeholder}
      options={options}
    />
  )

  return {
    key,
    label,
    value,
    onChange,
    reset: () => onChange("all"),
    isActive: (val?: unknown) =>
      val !== undefined ? val !== "all" : value !== "all",
    renderControl,
    render: (close) =>
      renderControl(value, (next) => {
        onChange(next)
        close()
      }),
    filterFn: (item, val) => val === "all" || getField(item) === val,
    asyncFilterFn,
  }
}

interface MultiSelectFilterOptions<TItem, TValue> {
  key: string
  label: string
  value: TValue[]
  onChange: (value: TValue[]) => void
  getField: (item: TItem) => TValue
  options: { label: string; value: TValue }[]
  placeholder?: string
  width?: number
  asyncFilterFn?: (item: TItem, value: TValue[]) => Promise<boolean>
}

export function createMultiSelectFilter<TItem, TValue>({
  key,
  label,
  value,
  onChange,
  getField,
  options,
  placeholder = "Chọn...",
  width = 220,
  asyncFilterFn,
}: MultiSelectFilterOptions<TItem, TValue>): FilterDef<TItem, TValue[]> {
  const renderControl = (val: TValue[], onChg: (val: TValue[]) => void) => (
    <Select
      mode="multiple"
      style={{ minWidth: width }}
      value={val}
      onChange={onChg}
      placeholder={placeholder}
      options={options}
      maxTagCount="responsive"
    />
  )

  return {
    key,
    label,
    value,
    onChange,
    reset: () => onChange([]),
    isActive: (val?: unknown) =>
      val !== undefined ? (val as TValue[]).length > 0 : value.length > 0,
    renderControl,
    render: (close) =>
      renderControl(value, (next) => {
        onChange(next)
        close()
      }),
    filterFn: (item, val) => val.length === 0 || val.includes(getField(item)),
    asyncFilterFn,
  }
}

interface BooleanFilterOptions<TItem> {
  key: string
  label: string
  value: boolean | "all"
  onChange: (value: boolean | "all") => void
  getField: (item: TItem) => unknown
  allLabel?: string
  trueLabel?: string
  falseLabel?: string
  width?: number
  asyncFilterFn?: (item: TItem, value: boolean | "all") => Promise<boolean>
}

export function createBooleanFilter<TItem>({
  key,
  label,
  value,
  onChange,
  getField,
  allLabel = "Tất cả",
  trueLabel = "Có",
  falseLabel = "Không",
  width = 150,
  asyncFilterFn,
}: BooleanFilterOptions<TItem>): FilterDef<TItem, boolean | "all"> {
  const renderControl = (
    val: boolean | "all",
    onChg: (val: boolean | "all") => void,
  ) => (
    <Select
      style={{ minWidth: width }}
      value={val}
      onChange={onChg}
      options={[
        { label: allLabel, value: "all" },
        { label: trueLabel, value: true },
        { label: falseLabel, value: false },
      ]}
    />
  )

  return {
    key,
    label,
    value,
    onChange,
    reset: () => onChange("all"),
    isActive: (val?: unknown) =>
      val !== undefined ? val !== "all" : value !== "all",
    renderControl,
    render: (close) =>
      renderControl(value, (next) => {
        onChange(next)
        close()
      }),
    filterFn: (item, val) =>
      val === "all" || (val ? Boolean(getField(item)) : !getField(item)),
    asyncFilterFn,
  }
}

export const applyOperator = (
  fieldVal: number,
  op: NumberOperator,
  target: number,
): boolean => {
  switch (op) {
    case "gt":
      return fieldVal > target
    case "gte":
      return fieldVal >= target
    case "lt":
      return fieldVal < target
    case "lte":
      return fieldVal <= target
    case "eq":
      return fieldVal === target
  }
}

interface NumberCompareFilterOptions<TItem> {
  key: string
  label: string
  value: NumberCompareValue
  onChange: (value: NumberCompareValue) => void
  getField: (item: TItem) => number
  placeholder?: string
  min?: number
  max?: number
  asyncFilterFn?: (item: TItem, value: NumberCompareValue) => Promise<boolean>
}

export function createNumberCompareFilter<TItem>({
  key,
  label,
  value,
  onChange,
  getField,
  placeholder = "Nhập số...",
  min,
  max,
  asyncFilterFn,
}: NumberCompareFilterOptions<TItem>): FilterDef<TItem, NumberCompareValue> {
  const renderControl = (
    val: NumberCompareValue,
    onChg: (val: NumberCompareValue) => void,
  ) => (
    <Space.Compact>
      <Select
        value={val.operator}
        onChange={(op) => onChg({ ...val, operator: op })}
        style={{ width: 64 }}
        options={(Object.keys(OPERATOR_LABELS) as NumberOperator[]).map(
          (op) => ({
            label: OPERATOR_LABELS[op],
            value: op,
          }),
        )}
      />
      <InputNumber
        value={val.number}
        onChange={(n) => onChg({ ...val, number: n })}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{ width: 120 }}
      />
    </Space.Compact>
  )

  return {
    key,
    label,
    value,
    onChange,
    reset: () => onChange(DEFAULT_NUMBER_COMPARE),
    isActive: (val?: unknown) =>
      val !== undefined
        ? (val as NumberCompareValue).number !== null
        : value.number !== null,
    renderControl,
    render: (close) =>
      renderControl(value, (next) => {
        onChange(next)
        close()
      }),
    filterFn: (item, val) => {
      if (val.number === null) return true
      return applyOperator(getField(item), val.operator, val.number)
    },
    asyncFilterFn,
  }
}

interface DateRangeFilterOptions<TItem> {
  key: string
  label: string
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  getField: (item: TItem) => string | undefined
  placeholder?: [string, string]
  asyncFilterFn?: (item: TItem, value: DateRangeValue) => Promise<boolean>
}

export function createDateRangeFilter<TItem>({
  key,
  label,
  value,
  onChange,
  getField,
  placeholder = ["Từ ngày", "Đến ngày"],
  asyncFilterFn,
}: DateRangeFilterOptions<TItem>): FilterDef<TItem, DateRangeValue> {
  const renderControl = (
    val: DateRangeValue,
    onChg: (val: DateRangeValue) => void,
  ) => (
    <DatePicker.RangePicker
      placeholder={placeholder}
      value={[val.from ? dayjs(val.from) : null, val.to ? dayjs(val.to) : null]}
      onChange={(dates) =>
        onChg({
          from: dates?.[0]?.toDate() ?? null,
          to: dates?.[1]?.toDate() ?? null,
        })
      }
    />
  )

  return {
    key,
    label,
    value,
    onChange,
    reset: () => onChange(DEFAULT_DATE_RANGE),
    isActive: (val?: unknown) =>
      val !== undefined
        ? (val as DateRangeValue).from !== null ||
          (val as DateRangeValue).to !== null
        : value.from !== null || value.to !== null,
    renderControl,
    render: (close) =>
      renderControl(value, (next) => {
        onChange(next)
        close()
      }),
    filterFn: (item, val) => {
      if (!val.from && !val.to) return true
      const date = new Date(getField(item) ?? "")
      if (val.from && date < val.from) return false
      if (val.to && date > val.to) return false
      return true
    },
    asyncFilterFn,
  }
}

export function createCreatedAtFilter<TItem extends { createdAt?: string }>(
  value: DateRangeValue,
  onChange: (v: DateRangeValue) => void,
) {
  return createDateRangeFilter<TItem>({
    key: "createdAt",
    label: "Ngày tạo",
    value,
    onChange,
    getField: (item) => item.createdAt,
    placeholder: ["Tạo từ ngày", "Đến ngày"],
  })
}

export function createUpdatedAtFilter<TItem extends { updatedAt?: string }>(
  value: DateRangeValue,
  onChange: (v: DateRangeValue) => void,
) {
  return createDateRangeFilter<TItem>({
    key: "updatedAt",
    label: "Ngày cập nhật",
    value,
    onChange,
    getField: (item) => item.updatedAt,
    placeholder: ["Cập nhật từ ngày", "Đến ngày"],
  })
}

interface TimeRangeFilterOptions<TItem> {
  key: string
  label: string
  value: TimeRangeValue
  onChange: (value: TimeRangeValue) => void
  getField: (item: TItem) => string | undefined
  placeholder?: [string, string]
}

export function createTimeRangeFilter<TItem>({
  key,
  label,
  value,
  onChange,
  getField,
  placeholder = ["Từ giờ", "Đến giờ"],
}: TimeRangeFilterOptions<TItem>): FilterDef<TItem, TimeRangeValue> {
  const renderControl = (
    val: TimeRangeValue,
    onChg: (val: TimeRangeValue) => void,
  ) => (
    <TimePicker.RangePicker
      value={[val.from, val.to]}
      onChange={(times) =>
        onChg({ from: times?.[0] ?? null, to: times?.[1] ?? null })
      }
      format="HH:mm"
      placeholder={placeholder}
    />
  )

  return {
    key,
    label,
    value,
    onChange,
    reset: () => onChange(DEFAULT_TIME_RANGE),
    isActive: (val?: unknown) =>
      val !== undefined
        ? (val as TimeRangeValue).from !== null ||
          (val as TimeRangeValue).to !== null
        : value.from !== null || value.to !== null,
    renderControl,
    render: (close) =>
      renderControl(value, (next) => {
        onChange(next)
        close()
      }),
    filterFn: (item, val) => {
      if (!val.from && !val.to) return true
      const raw = getField(item)
      if (!raw) return true
      const timePart = raw.split(" ")[1]?.substring(0, 8) ?? ""
      if (!timePart) return true
      if (val.from && timePart < val.from.format("HH:mm:ss")) return false
      if (val.to && timePart > val.to.format("HH:mm:ss")) return false
      return true
    },
  }
}
