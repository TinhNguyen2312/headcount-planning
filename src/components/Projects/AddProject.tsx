import { Button, DatePicker, Form, Input, Modal, Select } from "antd"
import type { Dayjs } from "dayjs"
import { Plus } from "lucide-react"
import { useState } from "react"

import { projectQueries } from "@/hooks/server/projects"
import {
  PROJECT_REGION_OPTIONS,
  PROJECT_SECTOR_OPTIONS,
  type ProjectRegion,
  type ProjectSector,
  type ProjectStatus,
} from "@/types"

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "PLANNING", label: "Lên kế hoạch" },
  { value: "ACTIVE", label: "Đang triển khai" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn thành" },
]

interface AddProjectFormValues {
  name: string
  address?: string
  generalInfo?: string
  region?: ProjectRegion
  sector?: ProjectSector
  status: ProjectStatus
  startDate?: Dayjs | null
  endDate?: Dayjs | null
}

const AddProject = () => {
  const [isOpen, setIsOpen] = useState(false)
  const mutation = projectQueries.useCreate()
  const [form] = Form.useForm<AddProjectFormValues>()

  const onSubmit = async (values: AddProjectFormValues) => {
    try {
      await mutation.mutateAsync({
        name: values.name.trim(),
        address: values.address?.trim() || undefined,
        generalInfo: values.generalInfo?.trim() || undefined,
        region: values.region || undefined,
        sector: values.sector || undefined,
        status: values.status,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : undefined,
        endDate: values.endDate
          ? values.endDate.format("YYYY-MM-DD")
          : undefined,
      })
      handleClose()
    } catch {
      // Handled by mutation onError toast
    }
  }

  const handleClose = () => {
    form.resetFields()
    setIsOpen(false)
  }

  return (
    <>
      <Button type="primary" icon={<Plus />} onClick={() => setIsOpen(true)}>
        Thêm dự án
      </Button>
      <Modal
        open={isOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        confirmLoading={mutation.isPending}
        okText="Lưu"
        cancelText="Hủy"
        title="Thêm dự án"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className="flex flex-col"
          initialValues={{
            name: "",
            address: "",
            generalInfo: "",
            region: "VUNG_TPHCM_1",
            sector: undefined,
            status: "PLANNING",
            startDate: "",
            endDate: "",
          }}
        >
          <Form.Item
            label="Tên dự án"
            name="name"
            className="mb-0"
            rules={[
              { required: true, message: "Vui lòng nhập tên dự án" },
              { whitespace: true, message: "Vui lòng nhập tên dự án" },
              {
                validator(_, value) {
                  if (value && value.trim().length < 2) {
                    return Promise.reject(
                      new Error("Tên dự án tối thiểu 2 ký tự"),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input placeholder="Tên dự án" />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address" className="mb-0">
            <Input placeholder="Địa chỉ" />
          </Form.Item>

          <Form.Item
            label="Trang thông tin chung (Link)"
            name="generalInfo"
            className="mb-0"
            rules={[{ type: "url", message: "Đường dẫn không hợp lệ" }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Vùng" name="region" className="mb-0">
              <Select
                className="w-full"
                options={PROJECT_REGION_OPTIONS}
                placeholder="Chọn vùng miền"
                allowClear
              />
            </Form.Item>

            <Form.Item label="Khu vực" name="sector" className="mb-0">
              <Select
                className="w-full"
                options={PROJECT_SECTOR_OPTIONS}
                placeholder="Chọn khu vực"
                allowClear
              />
            </Form.Item>
          </div>

          <Form.Item label="Trạng thái" name="status" className="mb-0">
            <Select className="w-full" options={statusOptions} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Ngày bắt đầu" name="startDate" className="mb-0">
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="DD/MM/YYYY"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Ngày kết thúc"
              name="endDate"
              className="mb-0"
              dependencies={["startDate"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate")
                    if (
                      !value ||
                      !startDate ||
                      !value.isBefore(startDate, "day")
                    ) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
                      ),
                    )
                  },
                }),
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="DD/MM/YYYY"
                className="w-full"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default AddProject
