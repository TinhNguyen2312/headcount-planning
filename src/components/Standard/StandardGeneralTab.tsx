"use client"

import { Form, Input, InputNumber, Select } from "antd"
import React from "react"
import MilestoneSelect from "@/components/Common/MilestoneSelect"
import RoleSelect from "@/components/Common/RoleSelect"
import { STANDARD_PROJECT_TYPE_OPTIONS } from "@/types"

interface StandardGeneralTabProps {}

export const StandardGeneralTab: React.FC<StandardGeneralTabProps> = () => {
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Form.Item
            name="roleId"
            label="Chức danh chạy định biên"
            rules={[{ required: true, message: "Vui lòng chọn chức danh" }]}
            className="mb-0"
          >
            <RoleSelect placeholder="Chọn chức danh..." />
          </Form.Item>
        </div>

        <div className="md:col-span-1">
          <Form.Item
            name="projectType"
            label="Loại dự án áp dụng"
            rules={[{ required: true, message: "Chọn loại dự án áp dụng" }]}
            tooltip="Phạm vi công trình mà chức danh này được kích hoạt đánh giá định biên"
            className="mb-0"
          >
            <Select
              placeholder="Chọn loại dự án..."
              options={STANDARD_PROJECT_TYPE_OPTIONS}
            />
          </Form.Item>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-3">
          <Form.Item
            name="fromMilestoneId"
            label={
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                Mốc bắt đầu
              </span>
            }
            rules={[{ required: true, message: "Vui lòng chọn mốc bắt đầu" }]}
            className="mb-0"
          >
            <MilestoneSelect placeholder="Chọn mốc bắt đầu..." />
          </Form.Item>

          <Form.Item
            name="fromLeadTimeMonths"
            label="Dung sai"
            tooltip="Số tháng nhân sự cần có mặt trước khi mốc bắt đầu khởi công (ví dụ: cần trước A 1 tháng)"
            className="mb-0"
          >
            <InputNumber
              min={0}
              step={1}
              addonAfter="tháng"
              className="w-full"
              placeholder="0"
            />
          </Form.Item>
        </div>

        <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-3">
          <Form.Item
            name="toMilestoneId"
            label={
              <span className="font-medium text-blue-700 dark:text-blue-300">
                Mốc kết thúc
              </span>
            }
            tooltip="Để trống nếu áp dụng xuyên suốt đến hết vòng đời dự án"
            className="mb-0"
          >
            <MilestoneSelect
              placeholder="Chọn mốc kết thúc (hoặc để trống)..."
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="toLeadTimeMonths"
            label="Dung sai"
            tooltip="Số tháng giữ nhân sự sau khi mốc kết thúc để hoàn công, nghiệm thu, quyết toán (ví dụ: giữ lại sau B 3 tháng)"
            className="mb-0"
          >
            <InputNumber
              min={0}
              step={1}
              addonAfter="tháng"
              className="w-full"
              placeholder="0"
            />
          </Form.Item>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Form.Item
          name="headcount"
          label="Baseline"
          rules={[{ required: true, message: "Nhập định biên chuẩn" }]}
        >
          <InputNumber
            min={0}
            step={0.1}
            className="w-full"
            placeholder="1.0"
          />
        </Form.Item>

        <Form.Item
          name="headcountMin"
          label="Min"
          tooltip="Số nhân sự tối thiểu cho phép khi điều chỉnh"
        >
          <InputNumber
            min={0}
            step={0.1}
            className="w-full"
            placeholder="Không giới hạn"
          />
        </Form.Item>

        <Form.Item
          name="headcountMax"
          label="Max"
          tooltip="Số nhân sự tối đa cho phép khi điều chỉnh"
        >
          <InputNumber
            min={0}
            step={0.1}
            className="w-full"
            placeholder="Không giới hạn"
          />
        </Form.Item>
      </div>

      <Form.Item name="note" label="Ghi chú nghiệp vụ">
        <Input.TextArea
          rows={3}
          placeholder="Ghi chú chi tiết về quy tắc áp dụng định biên này..."
        />
      </Form.Item>
    </div>
  )
}

export default StandardGeneralTab
