"use client"

import { Form, Input, InputNumber, Select } from "antd"
import React from "react"
import type { ConditionOperator, PropertyResponse } from "@/types"
import { BOOLEAN_OPTIONS } from "./criteriaRules"

export interface CriteriaValueFieldProps {
  fieldName: number
  restField: Record<string, any>
  property?: PropertyResponse
  operator: ConditionOperator
}

export const CriteriaValueField: React.FC<CriteriaValueFieldProps> = ({
  fieldName,
  restField,
  property,
  operator,
}) => {
  const dataType = property?.dataType || "NUMBER"
  const unit = property?.unit || undefined

  if (dataType === "SELECT") {
    const selectOptions = (property?.options || []).map((opt) => ({
      value: opt,
      label: opt,
    }))

    return (
      <Form.Item
        {...restField}
        name={[fieldName, "valueText"]}
        label="Giá trị lựa chọn"
        rules={[{ required: true, message: "Vui lòng chọn giá trị" }]}
        className="mb-2"
      >
        <Select
          placeholder="Chọn giá trị áp dụng..."
          options={selectOptions}
          allowClear
        />
      </Form.Item>
    )
  }

  if (dataType === "BOOLEAN") {
    return (
      <Form.Item
        {...restField}
        name={[fieldName, "valueText"]}
        label="Giá trị điều kiện"
        rules={[{ required: true, message: "Vui lòng chọn giá trị" }]}
        className="mb-2"
      >
        <Select
          placeholder="Chọn Có hoặc Không..."
          options={BOOLEAN_OPTIONS}
          allowClear
        />
      </Form.Item>
    )
  }

  if (dataType === "STRING") {
    return (
      <Form.Item
        {...restField}
        name={[fieldName, "valueText"]}
        label="Giá trị văn bản"
        rules={[{ required: true, message: "Vui lòng nhập giá trị văn bản" }]}
        className="mb-2"
      >
        <Input placeholder="Nhập chuỗi giá trị áp dụng..." />
      </Form.Item>
    )
  }

  // dataType === 'NUMBER'
  if (operator === "BETWEEN") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Form.Item
          {...restField}
          name={[fieldName, "minValue"]}
          label="Giá trị Min"
          rules={[{ required: true, message: "Nhập Min" }]}
          className="mb-2"
        >
          <InputNumber className="w-full" placeholder="Từ" addonAfter={unit} />
        </Form.Item>

        <Form.Item
          {...restField}
          name={[fieldName, "maxValue"]}
          label="Giá trị Max"
          rules={[{ required: true, message: "Nhập Max" }]}
          className="mb-2"
        >
          <InputNumber className="w-full" placeholder="Đến" addonAfter={unit} />
        </Form.Item>
      </div>
    )
  }

  if (operator === ">" || operator === ">=" || operator === "=") {
    return (
      <Form.Item
        {...restField}
        name={[fieldName, "minValue"]}
        label={operator === "=" ? "Giá trị (=)" : `Ngưỡng (${operator})`}
        rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
        className="mb-2"
      >
        <InputNumber
          className="w-full"
          placeholder="Nhập giá trị..."
          addonAfter={unit}
        />
      </Form.Item>
    )
  }

  if (operator === "<" || operator === "<=") {
    return (
      <Form.Item
        {...restField}
        name={[fieldName, "maxValue"]}
        label={`Ngưỡng (${operator})`}
        rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
        className="mb-2"
      >
        <InputNumber
          className="w-full"
          placeholder="Nhập giá trị..."
          addonAfter={unit}
        />
      </Form.Item>
    )
  }

  return null
}

export default CriteriaValueField
