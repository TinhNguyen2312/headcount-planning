"use client"

import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Switch,
} from "antd"
import { Layers, Save, SlidersHorizontal } from "lucide-react"
import React, { useEffect } from "react"

import { propertyQueries } from "@/hooks/server/properties"
import type { PropertyResponse, PropertyValueItem } from "@/types"

interface ProjectPropertiesTabProps {
  projectId: number
  viewOnly?: boolean
}

export const ProjectPropertiesTab: React.FC<ProjectPropertiesTabProps> = ({
  projectId,
  viewOnly = false,
}) => {
  const [form] = Form.useForm()

  const { data: matrixData, isLoading } =
    propertyQueries.useProjectProperties(projectId)
  const saveMutation = propertyQueries.useSaveProjectProperties(projectId)

  const properties: PropertyResponse[] = matrixData?.result?.properties || []
  const values: PropertyValueItem[] = matrixData?.result?.values || []

  // Map existing values into form fields
  useEffect(() => {
    if (!properties || properties.length === 0) return

    const formFields: Record<string, any> = {}

    for (const prop of properties) {
      const match = values.find((v) => v.propertyId === prop.id)
      if (match) {
        if (prop.dataType === "NUMBER") {
          formFields[`prop_${prop.id}`] = match.valueNumber
        } else if (prop.dataType === "BOOLEAN") {
          formFields[`prop_${prop.id}`] = match.valueText === "true"
        } else {
          formFields[`prop_${prop.id}`] = match.valueText
        }
      } else {
        formFields[`prop_${prop.id}`] = undefined
      }
    }

    form.setFieldsValue(formFields)
  }, [properties, values, form])

  const handleSave = async () => {
    try {
      const formVals = await form.validateFields()
      const payloadValues: Array<{
        propertyId: number
        valueNumber?: number | null
        valueText?: string | null
      }> = []

      for (const prop of properties) {
        const rawVal = formVals[`prop_${prop.id}`]
        if (rawVal === undefined || rawVal === null || rawVal === "") continue

        if (prop.dataType === "NUMBER") {
          payloadValues.push({
            propertyId: prop.id,
            valueNumber: Number(rawVal),
            valueText: null,
          })
        } else if (prop.dataType === "BOOLEAN") {
          payloadValues.push({
            propertyId: prop.id,
            valueNumber: null,
            valueText: rawVal ? "true" : "false",
          })
        } else {
          payloadValues.push({
            propertyId: prop.id,
            valueNumber: null,
            valueText: String(rawVal),
          })
        }
      }

      await saveMutation.mutateAsync({ values: payloadValues })
    } catch (err) {
      console.error("Form validation error:", err)
    }
  }

  // Helper renderer for dynamic inputs
  const renderFieldInput = (prop: PropertyResponse) => {
    switch (prop.dataType) {
      case "NUMBER":
        return (
          <InputNumber
            min={0}
            step="any"
            addonAfter={prop.unit || undefined}
            placeholder={`Nhập ${prop.name.toLowerCase()}...`}
            className="w-full"
            disabled={viewOnly}
          />
        )
      case "SELECT": {
        const opts = (prop.options || []).map((opt) => ({
          value: opt,
          label: opt,
        }))
        return (
          <Select
            allowClear
            options={opts}
            placeholder={`Chọn ${prop.name.toLowerCase()}...`}
            className="w-full"
            disabled={viewOnly}
          />
        )
      }
      case "BOOLEAN":
        return (
          <Switch
            checkedChildren="Có"
            unCheckedChildren="Không"
            disabled={viewOnly}
          />
        )
      case "STRING":
      default:
        return (
          <Input
            placeholder={`Nhập ${prop.name.toLowerCase()}...`}
            className="w-full"
            disabled={viewOnly}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Empty description="Chưa có thuộc tính cơ sở định biên nào được khai báo trong hệ thống." />
      </Card>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-4xl pb-10">
      <Form form={form} layout="vertical" className="space-y-6">
        <Card
          title={
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>Khai báo giá trị quy mô & cơ sở định biên của dự án</span>
            </div>
          }
          className="shadow-xs border-border/80"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {properties.map((prop) => (
              <Form.Item
                key={prop.id}
                name={`prop_${prop.id}`}
                label={
                  <span className="font-medium text-xs">
                    {prop.name}
                    <span className="ml-1 text-muted-foreground font-mono text-[11px]">
                      ({prop.code})
                    </span>
                  </span>
                }
                tooltip={prop.description || undefined}
                valuePropName={
                  prop.dataType === "BOOLEAN" ? "checked" : "value"
                }
              >
                {renderFieldInput(prop)}
              </Form.Item>
            ))}
          </div>
        </Card>

        {/* Save Button Bar */}
        {!viewOnly && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="primary"
              icon={<Save className="size-4" />}
              onClick={handleSave}
              loading={saveMutation.isPending}
              size="large"
              className="px-6"
            >
              Lưu cơ sở định biên dự án
            </Button>
          </div>
        )}
      </Form>
    </div>
  )
}

export default ProjectPropertiesTab
