/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Switch,
} from "antd"
import { Save, SlidersHorizontal } from "lucide-react"
import React, { useEffect, useMemo } from "react"

import { propertyQueries } from "@/hooks/server/properties"
import type { PropertyResponse, PropertyValueItem } from "@/types"

interface ProjectPropertiesDrawerProps {
  projectId: number
  open: boolean
  onClose: () => void
  viewOnly?: boolean
}

export const ProjectPropertiesDrawer: React.FC<
  ProjectPropertiesDrawerProps
> = ({ projectId, open, onClose, viewOnly = false }) => {
  const [form] = Form.useForm()

  const { data: matrixData, isLoading } =
    propertyQueries.useProjectProperties(projectId)
  const saveMutation = propertyQueries.useSaveProjectProperties(projectId)

  const properties: PropertyResponse[] = useMemo(() => {
    return matrixData?.result?.properties || []
  }, [matrixData])
  const values: PropertyValueItem[] = useMemo(() => {
    return matrixData?.result?.values || []
  }, [matrixData])

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
      onClose()
    } catch (err) {
      console.error("Form validation error:", err)
    }
  }

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

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <span className="font-semibold text-base">
            Quy mô & Cơ sở định biên
          </span>
        </div>
      }
      placement="right"
      size={500}
      open={open}
      onClose={onClose}
      destroyOnHidden={false}
      footer={
        <div className="flex items-center justify-end gap-2 py-1">
          <Button onClick={onClose}>Đóng</Button>
          {!viewOnly && (
            <Button
              type="primary"
              icon={<Save className="size-4" />}
              onClick={handleSave}
              loading={saveMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="p-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="p-8 text-center">
          <Empty description="Chưa có thuộc tính cơ sở định biên nào được khai báo trong hệ thống." />
        </div>
      ) : (
        <Form form={form} layout="vertical" className="w-full">
          <div className="flex flex-col gap-4 py-2">
            {properties.map((prop) => (
              <Form.Item
                key={prop.id}
                name={`prop_${prop.id}`}
                label={
                  <div className="flex items-baseline justify-between w-full gap-2">
                    <span className="font-medium text-base text-foreground">
                      {prop.name}
                    </span>
                    {/* <span className="text-muted-foreground font-mono text-[11px] shrink-0">
                      ({prop.code})
                    </span> */}
                  </div>
                }
                tooltip={prop.description || undefined}
                valuePropName={
                  prop.dataType === "BOOLEAN" ? "checked" : "value"
                }
                className="mb-0"
              >
                {renderFieldInput(prop)}
              </Form.Item>
            ))}
          </div>
        </Form>
      )}
    </Drawer>
  )
}

export default ProjectPropertiesDrawer
