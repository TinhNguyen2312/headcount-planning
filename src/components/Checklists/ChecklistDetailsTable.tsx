import {
  Form,
  Input,
  Select,
  Skeleton,
  Table,
  type TableColumnsType,
} from "antd"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"

import { REQUIREMENT_TYPE_LABEL } from "@/constants"
import { checklistQueries } from "@/hooks/server/checklists"
import { cn } from "@/lib/utils"
import type { ChecklistItemTreeNodeResponse, RequirementType } from "@/types"
import { ActionMenu, type ActionMenuItem } from "../Common/ActionMenu"
import ProtectedButton from "../Common/ProtectedButton"

export const NONE = "none"
export type ChecklistRequirementType = RequirementType | typeof NONE

export interface ChecklistFormValues {
  title: string
  checkingMethod: string
  requirementType: ChecklistRequirementType
}

const REQUIREMENT_TYPE_OPTIONS = [
  { value: NONE, label: "Không yêu cầu" },
  ...Object.entries(REQUIREMENT_TYPE_LABEL).map(([val, label]) => ({
    value: val as ChecklistRequirementType,
    label,
  })),
]

const countAll = (nodes: ChecklistItemTreeNodeResponse[]): number =>
  nodes.reduce((sum, n) => sum + 1 + countAll(n.children ?? []), 0)

const ChecklistDetailsTable = ({ checklistId }: { checklistId: number }) => {
  const { data: tree = [], isLoading } = checklistQueries.useItems(checklistId)
  const addMutation = checklistQueries.useAddItem(checklistId)
  const updateMutation = checklistQueries.useUpdateItem(checklistId)
  const deleteMutation = checklistQueries.useDeleteItem(checklistId)

  const [form] = Form.useForm<ChecklistFormValues>()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddRoot = () => {
    addMutation.mutate({
      parentId: null,
      title: "Nhóm công việc mới",
      orderIndex: tree.length,
    })
  }

  const handleEdit = (node: ChecklistItemTreeNodeResponse) => {
    form.setFieldsValue({
      title: node.title,
      checkingMethod: node.checkingMethod ?? "",
      requirementType: node.requirementType ?? NONE,
    })
    setEditingId(node.id)
  }

  const handleCancel = () => {
    setEditingId(null)
    form.resetFields()
  }

  const handleSave = async (node: ChecklistItemTreeNodeResponse) => {
    try {
      setIsSaving(true)
      const values = await form.validateFields()
      const isLeaf = !node.children || node.children.length === 0

      const payload = isLeaf
        ? {
            title: values.title.trim(),
            checkingMethod: values.checkingMethod.trim() || null,
            requirementType:
              values.requirementType === NONE ? null : values.requirementType,
          }
        : {
            title: values.title.trim(),
          }

      await updateMutation.mutateAsync({ id: node.id, data: payload })
      setEditingId(null)
      form.resetFields()
    } catch (error) {
      console.error("Lỗi khi lưu mục kiểm tra:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // const handleAddChild = (node: ChecklistItemTreeNodeResponse) => {
  //   addMutation.mutate({
  //     parentId: node.id,
  //     title: "Mục kiểm tra mới",
  //     orderIndex: node.children?.length ?? 0,
  //   })
  // }

  const actionItems: ActionMenuItem<ChecklistItemTreeNodeResponse>[] = [
    {
      key: "edit",
      label: "Sửa",
      icon: <Pencil className="size-4" />,
      onClick: (rec) => handleEdit(rec),
    },
    // {
    //   key: "add-child",
    //   label: "Thêm mục con",
    //   icon: <Plus className="size-4" />,
    //   onClick: (rec) => handleAddChild(rec),
    // },
    // { type: "divider" },
    {
      key: "delete",
      label: "Xóa mục",
      icon: <Trash2 className="size-4" />,
      danger: true,
      confirm: (rec) => {
        const childCount = countAll(rec.children ?? [])
        return {
          title: "Xóa mục kiểm tra",
          content:
            childCount > 0
              ? `Xóa "${rec.title}" sẽ xóa luôn ${childCount} mục con bên trong. Tiếp tục?`
              : `Xóa "${rec.title}"?`,
          okText: "Xóa",
          okType: "danger",
          cancelText: "Hủy",
        }
      },
      onClick: (rec) => deleteMutation.mutate(rec.id),
    },
  ]

  const columns: TableColumnsType<ChecklistItemTreeNodeResponse> = [
    {
      title: "Công việc",
      dataIndex: "title",
      key: "title",
      width: "15%",
      render: (text: string, record) => {
        const isEditing = editingId === record.id
        const isParent = Boolean(record.children && record.children.length > 0)
        if (isEditing) {
          return (
            <Form.Item
              name="title"
              className="m-0"
              rules={[{ required: true, message: "Nhập tên mục" }]}
            >
              <Input.TextArea
                rows={2}
                className={cn(
                  "min-h-9 resize-none",
                  isParent && "font-bold text-sm",
                )}
              />
            </Form.Item>
          )
        }
        return (
          <span className={cn(isParent && "font-bold text-sm")}>{text}</span>
        )
      },
    },
    {
      title: "Mô tả chi tiết",
      dataIndex: "checkingMethod",
      key: "checkingMethod",
      width: "30%",
      render: (_: unknown, record) => {
        const isEditing = editingId === record.id
        const isParent = Boolean(record.children && record.children.length > 0)
        if (isParent) return null
        if (isEditing) {
          return (
            <Form.Item name="checkingMethod" className="m-0">
              <Input.TextArea placeholder="Phương pháp kiểm tra..." rows={3} />
            </Form.Item>
          )
        }
        return (
          <span className="text-base text-muted-foreground">
            {record.checkingMethod || "—"}
          </span>
        )
      },
    },
    {
      title: "Minh chứng yêu cầu",
      dataIndex: "requirementType",
      key: "requirementType",
      width: "10%",
      render: (_: unknown, record) => {
        const isEditing = editingId === record.id
        const isParent = Boolean(record.children && record.children.length > 0)
        if (isParent) return null
        if (isEditing) {
          return (
            <Form.Item name="requirementType" className="m-0">
              <Select<ChecklistRequirementType>
                options={REQUIREMENT_TYPE_OPTIONS}
                size="small"
              />
            </Form.Item>
          )
        }
        return (
          <span className="text-base text-muted-foreground">
            {record.requirementType
              ? REQUIREMENT_TYPE_LABEL[record.requirementType]
              : "—"}
          </span>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_: unknown, record) => {
        const isEditing = editingId === record.id
        if (isEditing) {
          return (
            <Form.Item>
              <ProtectedButton
                type="primary"
                size="small"
                icon={<Check className="size-4" />}
                loading={isSaving}
                onClick={() => handleSave(record)}
                title="Lưu"
              />
              <ProtectedButton
                size="small"
                icon={<X className="size-4" />}
                disabled={isSaving}
                onClick={handleCancel}
                title="Hủy"
                className="ml-2"
              />
            </Form.Item>
          )
        }
        return (
          <div className="flex items-center justify-end">
            <ActionMenu record={record} items={actionItems} mode="inline" />
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton active key={i} paragraph={{ rows: 1 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Danh mục các mục</h2>
        <ProtectedButton
          type="primary"
          size="small"
          icon={<Plus className="size-4" />}
          onClick={handleAddRoot}
        >
          Thêm mục
        </ProtectedButton>
      </div>

      <Form form={form} component={false}>
        <Table<ChecklistItemTreeNodeResponse>
          columns={columns}
          dataSource={tree}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{
            emptyText:
              "Chưa có mục kiểm tra nào. Bấm 'Thêm nhóm công việc' để tạo mục đầu tiên.",
          }}
          defaultExpandAllRows
        />
      </Form>
    </div>
  )
}

export default ChecklistDetailsTable
