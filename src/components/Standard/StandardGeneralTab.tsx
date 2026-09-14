"use client"

import { Form, Input, InputNumber, Select } from "antd"
import React from "react"

interface OptionItem {
  value: number
  label: string
}

export interface StandardGeneralTabProps {
  roleOptions: OptionItem[]
  milestoneOptions: OptionItem[]
}

export const StandardGeneralTab: React.FC<StandardGeneralTabProps> = ({
  roleOptions,
  milestoneOptions,
}) => {
  return (
    <div className="space-y-3 pt-2">
      <Form.Item
        name="roleId"
        label="Chức danh chạy định biên"
        rules={[{ required: true, message: "Vui lòng chọn chức danh" }]}
      >
        <Select
          placeholder="Chọn chức danh..."
          options={roleOptions}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="fromMilestoneId"
          label="Mốc bắt đầu (Từ mốc)"
          rules={[{ required: true, message: "Vui lòng chọn mốc bắt đầu" }]}
        >
          <Select
            placeholder="Chọn mốc bắt đầu..."
            options={milestoneOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="toMilestoneId"
          label="Mốc kết thúc (Đến mốc)"
          tooltip="Để trống nếu áp dụng kéo dài đến khi kết thúc dự án"
        >
          <Select
            placeholder="Theo vòng đời dự án (Tùy chọn)"
            options={milestoneOptions}
            showSearch
            optionFilterProp="label"
            allowClear
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Form.Item
          name="headcount"
          label="Định biên chuẩn (Baseline)"
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
          label="Ngưỡng sàn (Min)"
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
          label="Ngưỡng trần (Max)"
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
