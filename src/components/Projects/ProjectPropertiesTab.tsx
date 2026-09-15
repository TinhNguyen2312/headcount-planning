/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Tag,
} from "antd"
import { Building2, Home, Save, SlidersHorizontal } from "lucide-react"
import React, { useEffect, useMemo } from "react"

import { propertyQueries } from "@/hooks/server/properties"
import type {
  DevelopmentType,
  PropertyDataType,
  PropertyResponse,
  PropertyValueItem,
} from "@/types"

interface ProjectPropertiesTabProps {
  projectId: number
  viewOnly?: boolean
}

const DATA_TYPE_SORT_ORDER: Record<PropertyDataType, number> = {
  NUMBER: 1,
  SELECT: 2,
  STRING: 3,
  BOOLEAN: 4,
}

const sortPropertiesByType = (list: PropertyResponse[]): PropertyResponse[] => {
  return [...list].sort((a, b) => {
    const orderA = DATA_TYPE_SORT_ORDER[a.dataType] ?? 99
    const orderB = DATA_TYPE_SORT_ORDER[b.dataType] ?? 99
    if (orderA !== orderB) {
      return orderA - orderB
    }
    return a.name.localeCompare(b.name, "vi")
  })
}

export const ProjectPropertiesTab: React.FC<ProjectPropertiesTabProps> = ({
  projectId,
  viewOnly = false,
}) => {
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

  const projectTypes: DevelopmentType[] = useMemo(() => {
    const raw = matrixData?.result?.projectTypes
    if (Array.isArray(raw) && raw.length > 0) return raw
    return ["HIGH_RISE"]
  }, [matrixData])

  const hasLowRise = projectTypes.includes("LOW_RISE")
  const hasHighRise = projectTypes.includes("HIGH_RISE")
  const isMixedUse = hasLowRise && hasHighRise

  const commonProperties = useMemo(
    () =>
      sortPropertiesByType(
        properties.filter((p) => !p.scope || p.scope === "COMMON"),
      ),
    [properties],
  )

  const lowRiseProperties = useMemo(
    () =>
      sortPropertiesByType(
        properties.filter(
          (p) => p.scope === "PER_TYPE" || p.scope === "LOW_RISE_ONLY",
        ),
      ),
    [properties],
  )

  const highRiseProperties = useMemo(
    () =>
      sortPropertiesByType(
        properties.filter(
          (p) => p.scope === "PER_TYPE" || p.scope === "HIGH_RISE_ONLY",
        ),
      ),
    [properties],
  )

  useEffect(() => {
    if (!properties || properties.length === 0) return

    const formFields: Record<string, any> = {}

    const getVal = (prop: PropertyResponse, val: PropertyValueItem) => {
      if (prop.dataType === "NUMBER") {
        return val.valueNumber !== null && val.valueNumber !== undefined
          ? Number(val.valueNumber)
          : undefined
      }
      if (prop.dataType === "BOOLEAN") {
        return val.valueText === "true"
      }
      return val.valueText ?? undefined
    }

    for (const prop of properties) {
      const commonMatch = values.find(
        (v) =>
          v.propertyId === prop.id &&
          (v.projectType === "COMMON" || !v.projectType),
      )
      if (commonMatch) {
        formFields[`prop_${prop.id}_COMMON`] = getVal(prop, commonMatch)
      }

      const lowMatch = values.find(
        (v) => v.propertyId === prop.id && v.projectType === "LOW_RISE",
      )
      if (lowMatch) {
        formFields[`prop_${prop.id}_LOW_RISE`] = getVal(prop, lowMatch)
      } else if (!hasHighRise && commonMatch && prop.scope === "PER_TYPE") {
        formFields[`prop_${prop.id}_LOW_RISE`] = getVal(prop, commonMatch)
      }

      const highMatch = values.find(
        (v) => v.propertyId === prop.id && v.projectType === "HIGH_RISE",
      )
      if (highMatch) {
        formFields[`prop_${prop.id}_HIGH_RISE`] = getVal(prop, highMatch)
      } else if (!hasLowRise && commonMatch && prop.scope === "PER_TYPE") {
        formFields[`prop_${prop.id}_HIGH_RISE`] = getVal(prop, commonMatch)
      }
    }

    form.setFieldsValue(formFields)
  }, [properties, values, form, hasLowRise, hasHighRise])

  const handleSave = async () => {
    try {
      const formVals = await form.validateFields()
      const payloadValues: Array<{
        propertyId: number
        projectType: string
        valueNumber?: number | null
        valueText?: string | null
      }> = []

      for (const [key, rawVal] of Object.entries(formVals)) {
        if (rawVal === undefined || rawVal === null || rawVal === "") continue

        const match = key.match(/^prop_(\d+)_(COMMON|LOW_RISE|HIGH_RISE)$/)
        if (!match) continue

        const propertyId = parseInt(match[1], 10)
        const projectType = match[2]
        const prop = properties.find((p) => p.id === propertyId)
        if (!prop) continue

        if (prop.dataType === "NUMBER") {
          payloadValues.push({
            propertyId,
            projectType,
            valueNumber: Number(rawVal),
            valueText: null,
          })
        } else if (prop.dataType === "BOOLEAN") {
          payloadValues.push({
            propertyId,
            projectType,
            valueNumber: null,
            valueText: rawVal ? "true" : "false",
          })
        } else {
          payloadValues.push({
            propertyId,
            projectType,
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
          <div className="flex items-center h-8">
            <Switch
              checkedChildren="Có"
              unCheckedChildren="Không"
              disabled={viewOnly}
            />
          </div>
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
      <Card size="small" className="shadow-xs">
        <div className="p-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </Card>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <Card size="small" className="shadow-xs">
        <div className="p-8 text-center">
          <Empty description="Chưa có thuộc tính cơ sở định biên nào được khai báo trong hệ thống." />
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card size="small" className="shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base text-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="size-4 text-primary" />
              Quy mô & Cơ sở định biên
            </span>
            {isMixedUse && (
              <Tag color="purple" className="text-[11px] font-normal">
                Thấp tầng và Cao tầng
              </Tag>
            )}
            {hasLowRise && !isMixedUse && (
              <Tag color="green" className="text-[11px] font-normal">
                Thấp tầng
              </Tag>
            )}
            {hasHighRise && !isMixedUse && (
              <Tag color="purple" className="text-[11px] font-normal">
                Cao tầng
              </Tag>
            )}
          </div>

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
      </Card>

      <Form form={form} layout="vertical" className="w-full space-y-4">
        {commonProperties.length > 0 && (
          <Card
            size="small"
            title={
              <div className="flex items-center gap-2 justify-start">
                <Building2 className="size-3.5 text-blue-600" />
                <Tag color="blue" className="m-0 text-base">
                  Thông số chung toàn dự án
                </Tag>
              </div>
            }
            className="border-border/80 shadow-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 py-2">
              {commonProperties.map((prop) => (
                <Form.Item
                  key={prop.id}
                  name={`prop_${prop.id}_COMMON`}
                  label={prop.name}
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
          </Card>
        )}

        {hasLowRise && (
          <Card
            size="small"
            title={
              <div className="flex items-center gap-2 justify-start">
                <Home className="size-3.5 text-emerald-600" />
                <Tag color="green" className="m-0 text-base">
                  Hạng mục Thấp tầng
                </Tag>
              </div>
            }
          >
            {lowRiseProperties.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thuộc tính cho Thấp tầng"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-4 py-2">
                {lowRiseProperties.map((prop) => (
                  <Form.Item
                    key={prop.id}
                    name={`prop_${prop.id}_LOW_RISE`}
                    label={prop.name}
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
            )}
          </Card>
        )}

        {hasHighRise && (
          <Card
            size="small"
            title={
              <div className="flex items-center  gap-2 justify-start">
                <Building2 className="size-3.5 text-indigo-600" />
                <Tag color="purple" className="m-0 text-base">
                  Hạng mục Cao tầng
                </Tag>
              </div>
            }
            className="border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-xs"
          >
            {highRiseProperties.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thuộc tính cho Cao tầng"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-4 py-2">
                {highRiseProperties.map((prop) => (
                  <Form.Item
                    key={prop.id}
                    name={`prop_${prop.id}_HIGH_RISE`}
                    label={prop.name}
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
            )}
          </Card>
        )}
      </Form>
    </div>
  )
}

export default ProjectPropertiesTab
