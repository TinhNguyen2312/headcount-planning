import type { FormInstance } from "antd"
import { Button, Form, Input, InputNumber, Select, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Check, X } from "lucide-react"
import AccConditionCell from "@/components/BusinessMatrix/AccConditionCell"
import ChecklistMultiSelectCell from "@/components/BusinessMatrix/ChecklistMultiSelectCell"
import RoleMultiSelectCell from "@/components/BusinessMatrix/RoleMultiSelectCell"
import RowActionsMenu from "@/components/BusinessMatrix/RowActionsMenu"
import {
  APPROVAL_LEVEL_LABEL,
  ESCALATE_COLOR,
  ESCALATE_LABEL,
  REQUIREMENT_TYPE_COLOR,
  REQUIREMENT_TYPE_LABEL,
  // TASK_TYPE_COLOR,
  // TASK_TYPE_LABEL,
} from "@/constants"
import { NONE } from "@/hooks/useBusinessMatrixEditor"
import { cn } from "@/lib/utils"
import type {
  ApprovalLevel,
  BusinessMatrixResponse,
  EscalateLevel,
  RequirementType,
  TaskItemResponse,
  // TaskType,
} from "@/types"

interface BusinessMatrixColumnsParams {
  form: FormInstance<TaskItemResponse>
  editingId: number | null
  isSaving: boolean
  isSuperUser?: boolean
  onStartEdit: (record: BusinessMatrixResponse) => void
  onSave: (record: BusinessMatrixResponse) => Promise<void> | void
  onCancel: () => void
  onAddChild: (record: BusinessMatrixResponse) => void
  onAddSibling: (record: BusinessMatrixResponse) => void
  onDelete: (id: number) => void
}

export const createBusinessMatrixColumns = ({
  form,
  editingId,
  isSaving,
  isSuperUser = false,
  onStartEdit,
  onSave,
  onCancel,
  onAddChild,
  onAddSibling,
  onDelete,
}: BusinessMatrixColumnsParams): ColumnsType<BusinessMatrixResponse> => {
  const isEditingField = (record: BusinessMatrixResponse) =>
    editingId === record.id && Boolean(record.parentTaskId)
  return [
    {
      title: "TÊN NGHIỆP VỤ",
      dataIndex: "title",
      key: "title",
      width: "24%",
      render: (_, record) => {
        const isParent = !record.parentTaskId
        const isEditing = editingId === record.id

        if (isEditing && isSuperUser) {
          return (
            <Form.Item
              name="title"
              className="m-0 w-full"
              rules={[{ required: true, message: "Nhập tên nghiệp vụ" }]}
            >
              <Input.TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className={cn(
                  "resize-none border-input bg-background shadow-none",
                  isParent && "font-bold text-foreground",
                )}
              />
            </Form.Item>
          )
        }

        return (
          <b
            className={cn(
              "text-md text-foreground",
              isParent ? "font-bold" : "font-normal",
            )}
          >
            {record.stt ? `${record.stt}. ` : ""} {record.title}
          </b>
        )
      },
    },
    {
      title: "CHỨC DANH THỰC HIỆN",
      key: "roles",
      width: "11%",
      render: (_, record) => {
        if (isEditingField(record) && isSuperUser) {
          return (
            <Form.Item name="roleIds" className="m-0 w-full">
              <RoleMultiSelectCell isEditing={true} />
            </Form.Item>
          )
        }

        return <RoleMultiSelectCell roles={record.roles} isEditing={false} />
      },
    },
    {
      title: "CHECKLIST",
      key: "checklists",
      width: "11%",
      render: (_, record) => {
        if (!record.parentTaskId) {
          return null
        }

        return (
          <ChecklistMultiSelectCell
            taskId={record.id}
            checklists={record.checklists}
          />
        )
      },
    },
    {
      title: "CẤP DUYỆT BÁO CÁO",
      key: "approvalLevel",
      width: "9%",
      render: (_, record) => {
        if (isEditingField(record) && isSuperUser) {
          return (
            <Form.Item name="approvalLevel" className="m-0 w-full">
              <Select<ApprovalLevel>
                className="w-full"
                options={Object.entries(APPROVAL_LEVEL_LABEL).map(
                  ([val, label]) => ({
                    value: Number(val) as ApprovalLevel,
                    label,
                  }),
                )}
              />
            </Form.Item>
          )
        }

        return (
          <span className="text-md font-semibold">
            {record.parentTaskId
              ? APPROVAL_LEVEL_LABEL[record.approvalLevel]
              : null}
          </span>
        )
      },
    },
    {
      title: "SLA",
      key: "slaHours",
      width: "5%",
      render: (_, record) => {
        if (isEditingField(record) && isSuperUser) {
          return (
            <Form.Item
              name="slaHours"
              className="m-0 w-full"
              rules={[
                {
                  type: "number",
                  min: 1,
                  max: 8760,
                  message: "SLA từ 1 đến 8760 giờ",
                },
              ]}
            >
              <InputNumber
                min={1}
                max={8760}
                addonAfter="h"
                className="w-full"
                placeholder="1-8760"
              />
            </Form.Item>
          )
        }

        return record.slaHours != null && record.slaHours > 0 ? (
          <b className="font-mono text-md text-foreground">
            {record.slaHours}h
          </b>
        ) : (
          <span className="text-muted-foreground"></span>
        )
      },
    },
    {
      title: "MỨC LEO THANG",
      key: "escalateLevel",
      width: "8%",
      render: (_, record) => {
        if (isEditingField(record) && isSuperUser) {
          return (
            <Form.Item name="escalateLevel" className="m-0 w-full">
              <Select<EscalateLevel>
                className="w-full"
                options={Object.entries(ESCALATE_LABEL).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                )}
              />
            </Form.Item>
          )
        }

        if (record.escalateLevel) {
          const level = record.escalateLevel.toUpperCase() as EscalateLevel
          return (
            <Tag
              color={ESCALATE_COLOR[level] ?? "default"}
              className="m-0 text-[10px]"
            >
              {ESCALATE_LABEL[level] ?? level}
            </Tag>
          )
        }

        return <span className="text-muted-foreground" />
      },
    },
    {
      title: "MINH CHỨNG YÊU CẦU",
      key: "requirements",
      width: "9%",
      render: (_, record) => {
        if (isEditingField(record) && isSuperUser) {
          return (
            <Form.Item name="requirementType" className="m-0 w-full">
              <Select<RequirementType | typeof NONE>
                className="w-full"
                options={[
                  { value: NONE, label: "Không yêu cầu" },
                  ...Object.entries(REQUIREMENT_TYPE_LABEL).map(
                    ([val, label]) => ({
                      value: val as RequirementType,
                      label,
                    }),
                  ),
                ]}
              />
            </Form.Item>
          )
        }

        if (record.requirementType) {
          const reqType =
            record.requirementType.toUpperCase() as RequirementType
          return (
            <Tag
              color={REQUIREMENT_TYPE_COLOR[reqType] ?? "blue"}
              className="m-0 text-[11px] font-medium"
            >
              {REQUIREMENT_TYPE_LABEL[reqType] || reqType}
            </Tag>
          )
        }

        return <span className="text-md text-muted-foreground">—</span>
      },
    },
    {
      title: "CẤU HÌNH ACC",
      key: "accCondition",
      width: "8%",
      align: "center",
      render: (_, record) => {
        if (!record.parentTaskId || !isSuperUser) {
          return null
        }
        return (
          <AccConditionCell
            isEditing={isSuperUser}
            record={record}
            onSave={async (accCondition) => {
              form.setFieldsValue({
                ...record,
                roleIds: record.roles?.map((r) => r.roleId) ?? [],
                ...(editingId === record.id ? form.getFieldsValue(true) : {}),
                accCondition,
              })
              await onSave(record)
            }}
          />
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "6%",
      align: "center",
      render: (_, record) => {
        if (!isSuperUser) return null
        const isEditing = editingId === record.id

        if (isEditing) {
          return (
            <Form.Item>
              <Button
                type="primary"
                size="small"
                icon={<Check className="size-4" />}
                loading={isSaving}
                onClick={() => onSave(record)}
                title="Lưu"
                className="mr-2"
              />
              <Button
                type="default"
                size="small"
                icon={<X className="size-4" />}
                disabled={isSaving}
                onClick={onCancel}
                title="Hủy"
              />
            </Form.Item>
          )
        }

        return (
          <RowActionsMenu
            record={record}
            onStartEdit={() => onStartEdit(record)}
            onAddChild={() => onAddChild(record)}
            onAddSibling={() => onAddSibling(record)}
            onDelete={() => onDelete(record.id)}
          />
        )
      },
    },
  ]
}
