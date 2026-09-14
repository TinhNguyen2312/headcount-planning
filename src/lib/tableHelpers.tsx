import type { TableColumnType } from "antd"
import { Button, Input } from "antd"
import dayjs from "dayjs"
import { Search } from "lucide-react"
import type { ReactNode } from "react"

import {
  ActionMenu,
  type ActionMenuItem,
  type ActionMenuProps,
} from "@/components/Common/ActionMenu"

export interface TextColumnOptions {
  sortable?: boolean
  searchable?: boolean
  filters?: { text: string; value: string | number }[]
  filterSearch?: boolean
  width?: string | number
  align?: "left" | "center" | "right"
}

export interface StatusConfigItem<S extends string = string> {
  label: string
  render?: (val: S) => ReactNode
}

export type StatusConfigMap<S extends string = string> = Record<
  S,
  StatusConfigItem<S>
>

export interface DateColumnOptions {
  format?: string
  sortable?: boolean
  width?: string | number
  align?: "left" | "center" | "right"
}

export interface NumberColumnOptions {
  sortable?: boolean
  width?: string | number
  align?: "left" | "center" | "right"
  formatter?: (value: number) => string
}

export function createTextColumn<T>(
  dataIndex: keyof T & string,
  title: string,
  options?: TextColumnOptions,
): TableColumnType<T> {
  const column: TableColumnType<T> = {
    title,
    dataIndex,
    key: dataIndex,
    width: options?.width,
    align: options?.align ?? "left",
    sorter: options?.sortable
      ? (a, b) => {
          const valA = String(a[dataIndex] ?? "")
          const valB = String(b[dataIndex] ?? "")
          return valA.localeCompare(valB, "vi", { sensitivity: "base" })
        }
      : undefined,
  }

  if (options?.filters) {
    column.filters = options.filters
    column.filterSearch = options?.filterSearch ?? true
    column.onFilter = (value, record) =>
      String(record[dataIndex]) === String(value)
  } else if (options?.searchable) {
    column.filterDropdown = ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2.5 w-60 flex flex-col gap-2 bg-popover rounded-md border border-border shadow-lg">
        <Input
          placeholder={`Tìm ${title.toLowerCase()}...`}
          value={selectedKeys[0] ? String(selectedKeys[0]) : ""}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          size="small"
          allowClear
        />
        <div className="flex justify-between items-center gap-2">
          <Button
            size="small"
            onClick={() => {
              if (clearFilters) clearFilters()
              confirm()
            }}
            className="text-base"
          >
            Đặt lại
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => confirm()}
            className="text-base"
          >
            Tìm
          </Button>
        </div>
      </div>
    )
    column.filterIcon = (filtered: boolean) => (
      <Search
        className={`size-3.5 ${
          filtered ? "text-primary font-bold" : "text-muted-foreground"
        }`}
      />
    )
    column.onFilter = (value, record) => {
      const recordVal = record[dataIndex]
      if (recordVal === null || recordVal === undefined) return false
      return String(recordVal)
        .toLowerCase()
        .includes(String(value).toLowerCase().trim())
    }
  }

  return column
}

export function createStatusColumn<T, S extends string>(
  dataIndex: keyof T & string,
  title: string,
  statusMap: StatusConfigMap<S>,
  options?: { width?: string | number },
): TableColumnType<T> {
  const filterList = Object.entries<StatusConfigItem<S>>(statusMap).map(
    ([key, config]) => ({
      text: config.label,
      value: key,
    }),
  )

  return {
    title,
    dataIndex,
    key: dataIndex,
    width: options?.width,
    align: "center",
    filters: filterList,
    onFilter: (value, record) => String(record[dataIndex]) === String(value),
    render: (val: S) => {
      if (!val || !statusMap[val]) return "—"
      return statusMap[val].render
        ? statusMap[val].render(val)
        : statusMap[val].label
    },
  }
}

export function createDateColumn<T>(
  dataIndex: keyof T & string,
  title: string,
  options?: DateColumnOptions,
): TableColumnType<T> {
  const dateFormat = options?.format ?? "DD/MM/YYYY HH:mm"

  return {
    title,
    dataIndex,
    key: dataIndex,
    width: options?.width,
    align: options?.align ?? "left",
    sorter: options?.sortable
      ? (a, b) => {
          const timeA = a[dataIndex]
            ? dayjs(a[dataIndex] as string).valueOf()
            : 0
          const timeB = b[dataIndex]
            ? dayjs(b[dataIndex] as string).valueOf()
            : 0
          return timeA - timeB
        }
      : undefined,
    render: (val: string | null | undefined) =>
      val ? dayjs(val).format(dateFormat) : "—",
  }
}

export function createNumberColumn<T>(
  dataIndex: keyof T & string,
  title: string,
  options?: NumberColumnOptions,
): TableColumnType<T> {
  return {
    title,
    dataIndex,
    key: dataIndex,
    width: options?.width,
    align: options?.align ?? "right",
    sorter: options?.sortable
      ? (a, b) => {
          const numA = Number(a[dataIndex] ?? 0)
          const numB = Number(b[dataIndex] ?? 0)
          return numA - numB
        }
      : undefined,
    render: (val: number | null | undefined) => {
      if (val === null || val === undefined) return "—"
      return options?.formatter ? options.formatter(val) : String(val)
    },
  }
}

export interface ActionColumnOptions<T> {
  title?: string
  width?: string | number
  align?: "left" | "center" | "right"
  mode?: ActionMenuProps<T>["mode"]
  fixed?: "left" | "right" | boolean
  size?: ActionMenuProps<T>["size"]
  className?: string
}

export function createActionColumn<T>(
  items: ActionMenuItem<T>[] | ((record: T) => ActionMenuItem<T>[]),
  options?: ActionColumnOptions<T>,
): TableColumnType<T> {
  return {
    title: options?.title ?? "Thao tác",
    key: "actions",
    width: options?.width ?? "6%",
    align: options?.align ?? "right",
    fixed: options?.fixed,
    render: (_, record) => {
      const resolvedItems = typeof items === "function" ? items(record) : items
      return (
        <div className="flex justify-end">
          <ActionMenu
            record={record}
            items={resolvedItems}
            mode={options?.mode ?? "dropdown"}
            size={options?.size ?? "small"}
            className={options?.className}
          />
        </div>
      )
    },
  }
}
