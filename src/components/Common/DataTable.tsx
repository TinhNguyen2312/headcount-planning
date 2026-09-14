import { Table, type TableProps } from "antd"
import type React from "react"

export type IdentifiableItem = object & {
  id?: string | number
  key?: string | number
}

export interface DataTableProps<T extends object>
  extends Omit<TableProps<T>, "rowKey"> {
  rowKey?: keyof T | ((record: T) => string | number)
  totalItemLabel?: string
}

export function DataTable<T extends object>({
  columns,
  dataSource,
  loading,
  rowKey,
  totalItemLabel = "bản ghi",
  pagination,
  scroll,
  locale,
  className,
  ...rest
}: DataTableProps<T>): React.ReactElement {
  const resolvedRowKey =
    rowKey ??
    ((record: T) =>
      (record as IdentifiableItem).id ??
      (record as IdentifiableItem).key ??
      (record as { _id?: string })._id ??
      "")

  const resolvedPagination =
    pagination === false
      ? false
      : {
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
          showTotal: (total: number, range: [number, number]) =>
            `Hiển thị ${range[0]}-${range[1]} của ${total} ${totalItemLabel}`,
          ...pagination,
        }

  return (
    <div className="w-full bg-card rounded-lg border border-border shadow-xs overflow-hidden">
      <Table<T>
        rowKey={resolvedRowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        scroll={scroll}
        pagination={resolvedPagination}
        locale={{
          emptyText: `Chưa có ${totalItemLabel} nào.`,
          ...locale,
        }}
        className={className}
        {...rest}
      />
    </div>
  )
}

export default DataTable
