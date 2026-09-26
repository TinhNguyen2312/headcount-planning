import { useNavigate } from "@/lib/routerAdapter"
import type { TableColumnsType } from "antd"
import { Tag } from "antd"
import { Eye, Trash2 } from "lucide-react"
import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import { DataTable } from "@/components/Common/DataTable"
import { checklistQueries } from "@/hooks/server/checklists"
import { createTextColumn } from "@/lib/tableHelpers"
import type { ChecklistResponse } from "@/types"

interface ChecklistTableProps {
  checklists: ChecklistResponse[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
}

const ChecklistTable = ({
  checklists,
  loading,
  pagination,
}: ChecklistTableProps) => {
  const navigate = useNavigate()
  const deleteMutation = checklistQueries.useDelete()

  const actionItems: ActionMenuItem<ChecklistResponse>[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <Eye className="size-4" />,
      onClick: (rec) =>
        navigate({
          to: "/checklists/$id/edits",
          params: { id: String(rec.id) },
        }),
    },
    {
      key: "delete",
      label: "Xóa mẫu",
      icon: <Trash2 className="size-4" />,
      danger: true,
      confirm: (rec) => ({
        title: "Xóa checklist",
        content: `Bạn có chắc chắn muốn xóa checklist ${rec.name}?`,
        okText: "Xóa",
        okType: "danger",
      }),
      onClick: (rec) => deleteMutation.mutate(rec.id),
      systemRoles: ["SUPER_ADMIN"],
    },
  ]

  const columns: TableColumnsType<ChecklistResponse> = [
    {
      ...createTextColumn<ChecklistResponse>("code", "Mã Checklist", {
        sortable: true,
        width: "18%",
      }),
      render: (code: string) => (
        <span className="font-mono text-base font-medium text-primary">
          {code}
        </span>
      ),
    },
    {
      ...createTextColumn<ChecklistResponse>("name", "Tên Checklist", {
        sortable: true,
        width: "32%",
      }),
      render: (name: string) => {
        return <span className="font-semibold text-sm">{name}</span>
      },
    },
    {
      title: "Nghiệp vụ áp dụng",
      key: "taskItemTitle",
      width: "22%",
      render: (_, record) => {
        if (record.taskItemTitle) {
          return (
            <Tag
              color="blue"
              className="text-base max-w-full truncate"
              title={record.taskItemTitle}
            >
              {record.taskItemTitle}
            </Tag>
          )
        }
        return <span className="text-muted-foreground text-base"></span>
      },
    },
    {
      title: "Phòng ban lưu bản gốc",
      dataIndex: "custodianDepartment",
      key: "custodianDepartment",
      width: "18%",
      render: (dept: string) => {
        return (
          <span className="text-base text-muted-foreground">{dept || ""}</span>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      width: "10%",
      render: (_, record) => {
        return (
          <div className="flex justify-end">
            <ActionMenu record={record} items={actionItems} mode="inline" />
          </div>
        )
      },
    },
  ]

  return (
    <DataTable<ChecklistResponse>
      columns={columns}
      dataSource={checklists}
      loading={loading}
      totalItemLabel="mẫu checklist"
      pagination={
        pagination
          ? {
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: pagination.onChange,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }
          : undefined
      }
      scroll={{ y: "calc(100vh - 320px)" }}
    />
  )
}

export default ChecklistTable
