import {
  Col,
  DatePicker,
  Form,
  type FormInstance,
  Input,
  Radio,
  Row,
  Segmented,
} from "antd"
import dayjs from "dayjs"
import { CheckCircle, ShieldCheck, UserCheck } from "lucide-react"
import { TaskTreeSelect } from "@/components/Common/TaskTreeSelect"
import type { CreateAdhocTaskFormValues } from "@/views/pcd/CreateAdhocTaskPage"

const APPROVAL_LEVELS: {
  level: 0 | 1 | 2
  title: string
  icon: typeof UserCheck
}[] = [
  {
    level: 0,
    title: "Tự đánh giá",
    icon: UserCheck,
  },
  {
    level: 1,
    title: "Quản lý trực tiếp (QLTT)",
    icon: CheckCircle,
  },
  {
    level: 2,
    title: "QLTT + 1 (2 Cấp duyệt)",
    icon: ShieldCheck,
  },
]

const SLA_PRESETS = [2, 4, 8, 12, 24, 48]

interface TaskDetailsSectionProps {
  form?: FormInstance<CreateAdhocTaskFormValues>
}

export const TaskDetailsSection = ({
  form: propForm,
}: TaskDetailsSectionProps = {}) => {
  const contextForm = Form.useFormInstance<CreateAdhocTaskFormValues>()
  const form = propForm ?? contextForm

  return (
    <div className="border-t border-border pt-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        2. Nội dung công việc & Nghiệp vụ
      </h2>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            label="Danh mục nghiệp vụ"
            name="taskItemId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn danh mục nghiệp vụ",
              },
            ]}
          >
            <TaskTreeSelect
              placeholder="Chọn nghiệp vụ từ danh mục (Tự động gợi ý tiêu đề, SLA, cấp duyệt)..."
              allowClear
              leafOnly={true}
              maxHeight={300}
              onChange={(val, node) => {
                form.setFieldValue("taskItemId", val)
                if (node) {
                  if (!form.getFieldValue("title")) {
                    form.setFieldValue("title", node.title)
                  }
                  if (node.slaHours) {
                    form.setFieldValue("slaHours", node.slaHours)
                  }
                  if (
                    node.approvalLevel !== undefined &&
                    node.approvalLevel !== null
                  ) {
                    form.setFieldValue("approvalLevel", node.approvalLevel)
                  }
                  if (node.description && !form.getFieldValue("description")) {
                    form.setFieldValue("description", node.description)
                  }
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Ngày thực hiện"
            name="workDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày thực hiện" },
            ]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              presets={[
                { label: "Hôm nay", value: dayjs() },
                { label: "Ngày mai", value: dayjs().add(1, "day") },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={10}>
          <Form.Item
            label="Tiêu đề công việc"
            name="title"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tiêu đề công việc",
              },
              { min: 3, message: "Tiêu đề tối thiểu 3 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Xử lý sự cố rò rỉ nước hầm B1" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item label="Thời gian SLA" name="slaHours">
            <Segmented
              block
              options={SLA_PRESETS.map((h) => ({
                value: h,
                label: `${h}h`,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Mô tả chi tiết hiện trạng & yêu cầu"
            name="description"
          >
            <Input.TextArea
              rows={6}
              placeholder="Mô tả cụ thể vị trí, mức độ nghiêm trọng và yêu cầu xử lý..."
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Cấp độ phê duyệt nghiệm thu" name="approvalLevel">
            <Radio.Group className="w-full">
              <div className="flex flex-col gap-2">
                {APPROVAL_LEVELS.map((item) => (
                  <Radio
                    key={item.level}
                    value={item.level}
                    className="w-full items-start! rounded-lg border border-border bg-background p-2.5! hover:border-primary"
                  >
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </div>
  )
}

export default TaskDetailsSection
