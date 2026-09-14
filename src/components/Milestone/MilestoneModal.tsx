import { Form, Input, Modal, Select, Switch } from "antd"
import React, { useEffect, useMemo } from "react"
import { milestoneQueries } from "@/hooks/server/milestones"
import { applyApiFieldErrors } from "@/lib/errors"
import type {
  MilestoneCreate,
  MilestoneResponse,
  MilestoneUpdate,
} from "@/types"

export interface MilestoneModalProps {
  open: boolean
  onCancel: () => void
  milestone?: MilestoneResponse | null
}

interface MilestoneFormValues {
  code: string
  name: string
  description?: string | null
  isActive: boolean
  predecessorIds?: number[]
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  open,
  onCancel,
  milestone,
}) => {
  const isEdit = Boolean(milestone)
  const { data: allMilestones = [] } = milestoneQueries.useList()
  const createMutation = milestoneQueries.useCreate()
  const updateMutation = milestoneQueries.useUpdate()
  const [form] = Form.useForm<MilestoneFormValues>()

  // Cycle detection: Find all descendants/successors of this milestone to prevent selecting them as predecessors
  const invalidPredecessorIds = useMemo(() => {
    if (!isEdit || !milestone || !allMilestones || allMilestones.length === 0) {
      return new Set<number>()
    }

    // Build successors map
    const successorsMap = new Map<number, number[]>()
    for (const m of allMilestones) {
      if (m.predecessorIds && m.predecessorIds.length > 0) {
        for (const predId of m.predecessorIds) {
          const succs = successorsMap.get(predId) ?? []
          succs.push(m.id)
          successorsMap.set(predId, succs)
        }
      }
    }

    // Traverse all successors of milestone.id
    const invalidIds = new Set<number>([milestone.id])
    const queue = [...(successorsMap.get(milestone.id) ?? [])]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (invalidIds.has(current)) continue
      invalidIds.add(current)
      queue.push(...(successorsMap.get(current) ?? []))
    }

    return invalidIds
  }, [isEdit, milestone, allMilestones])

  const predecessorOptions = useMemo(() => {
    return (allMilestones || [])
      .filter((m) => !invalidPredecessorIds.has(m.id))
      .map((m) => ({
        value: m.id,
        label: `${m.code} - ${m.name}`,
      }))
  }, [allMilestones, invalidPredecessorIds])

  useEffect(() => {
    if (open) {
      if (milestone) {
        form.setFieldsValue({
          code: milestone.code,
          name: milestone.name,
          description: milestone.description ?? "",
          isActive: milestone.isActive,
          predecessorIds: milestone.predecessorIds ?? [],
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          isActive: true,
          predecessorIds: [],
        })
      }
    }
  }, [open, milestone, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || null,
        isActive: values.isActive,
        predecessorIds: values.predecessorIds ?? [],
      }

      if (isEdit && milestone) {
        await updateMutation.mutateAsync({
          id: milestone.id,
          data: payload as MilestoneUpdate,
        })
      } else {
        await createMutation.mutateAsync(payload as MilestoneCreate)
      }

      onCancel()
    } catch (error) {
      applyApiFieldErrors(form, error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa Mốc tiến độ" : "Thêm mới Mốc tiến độ"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isPending}
      okText={isEdit ? "Lưu thay đổi" : "Tạo mới"}
      cancelText="Hủy"
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ isActive: true, predecessorIds: [] }}
      >
        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            name="code"
            label="Mã mốc tiến độ"
            rules={[
              { required: true, message: "Vui lòng nhập mã mốc" },
              { max: 50, message: "Mã mốc không vượt quá 50 ký tự" },
            ]}
          >
            <Input placeholder="VD: M01, M02..." />
          </Form.Item>

          <div className="col-span-2">
            <Form.Item
              name="name"
              label="Tên mốc tiến độ"
              rules={[
                { required: true, message: "Vui lòng nhập tên mốc tiến độ" },
                { max: 200, message: "Tên mốc không vượt quá 200 ký tự" },
              ]}
            >
              <Input placeholder="VD: Hoàn tất san lấp mặt bằng" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="predecessorIds"
          label="Mốc tiến độ tiền đề (Predecessors)"
          tooltip="Các mốc công việc bắt buộc phải hoàn thành trước khi mốc này có thể bắt đầu"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn các mốc tiến độ tiền đề..."
            options={predecessorOptions}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item name="description" label="Diễn giải / Ghi chú">
          <Input.TextArea
            rows={3}
            placeholder="Nhập mô tả hoặc điều kiện hoàn thành mốc..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái áp dụng"
          valuePropName="checked"
        >
          <Switch checkedChildren="Áp dụng" unCheckedChildren="Tạm dừng" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default MilestoneModal
