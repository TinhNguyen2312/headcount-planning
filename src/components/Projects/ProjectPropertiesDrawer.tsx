/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  Alert,
  Badge,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Switch,
  Tag,
} from "antd"
import {
  Building,
  Building2,
  Home,
  Save,
  SlidersHorizontal,
} from "lucide-react"
import React, { useEffect, useMemo } from "react"

import { propertyQueries } from "@/hooks/server/properties"
import type {
  DevelopmentType,
  PropertyResponse,
  PropertyValueItem,
} from "@/types"

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

  const projectTypes: DevelopmentType[] = useMemo(() => {
    const raw = matrixData?.result?.projectTypes
    if (Array.isArray(raw) && raw.length > 0) return raw
    return ["HIGH_RISE"]
  }, [matrixData])

  const hasLowRise = projectTypes.includes("LOW_RISE")
  const hasHighRise = projectTypes.includes("HIGH_RISE")
  const isMixedUse = hasLowRise && hasHighRise

  const commonProperties = useMemo(
    () => properties.filter((p) => !p.scope || p.scope === "COMMON"),
    [properties],
  )

  const lowRiseProperties = useMemo(
    () =>
      properties.filter(
        (p) => p.scope === "PER_TYPE" || p.scope === "LOW_RISE_ONLY",
      ),
    [properties],
  )

  const highRiseProperties = useMemo(
    () =>
      properties.filter(
        (p) => p.scope === "PER_TYPE" || p.scope === "HIGH_RISE_ONLY",
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
          {isMixedUse && (
            <Tag color="purple" className="text-[11px] font-normal ml-2">
              Mixed-use
            </Tag>
          )}
        </div>
      }
      placement="right"
      width={620}
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
        <Form form={form} layout="vertical" className="w-full space-y-5">
          {/* SECTION 1: COMMON */}
          {commonProperties.length > 0 && (
            <Card
              size="small"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Building className="size-3.5 text-blue-600" />
                    <span>Thông số chung toàn dự án</span>
                  </div>
                  <Badge count="Chung" style={{ backgroundColor: "#1890ff" }} />
                </div>
              }
              className="border-border/80"
            >
              <div className="flex flex-col gap-3 py-1">
                {commonProperties.map((prop) => (
                  <Form.Item
                    key={prop.id}
                    name={`prop_${prop.id}_COMMON`}
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
                    className="mb-0"
                  >
                    {renderFieldInput(prop)}
                  </Form.Item>
                ))}
              </div>
            </Card>
          )}

          {/* SECTION 2: LOW-RISE */}
          {hasLowRise && (
            <Card
              size="small"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <Home className="size-3.5 text-emerald-600" />
                    <span>Hạng mục Thấp tầng (Low-rise)</span>
                  </div>
                  <Tag color="green" className="m-0 text-[11px]">
                    🏠 Thấp tầng
                  </Tag>
                </div>
              }
              className="border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
            >
              {lowRiseProperties.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có thuộc tính cho Thấp tầng"
                />
              ) : (
                <div className="flex flex-col gap-3 py-1">
                  {lowRiseProperties.map((prop) => (
                    <Form.Item
                      key={prop.id}
                      name={`prop_${prop.id}_LOW_RISE`}
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
                      className="mb-0"
                    >
                      {renderFieldInput(prop)}
                    </Form.Item>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* SECTION 3: HIGH-RISE */}
          {hasHighRise && (
            <Card
              size="small"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                    <Building2 className="size-3.5 text-indigo-600" />
                    <span>Hạng mục Cao tầng (High-rise)</span>
                  </div>
                  <Tag color="purple" className="m-0 text-[11px]">
                    🏢 Cao tầng
                  </Tag>
                </div>
              }
              className="border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10"
            >
              {highRiseProperties.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có thuộc tính cho Cao tầng"
                />
              ) : (
                <div className="flex flex-col gap-3 py-1">
                  {highRiseProperties.map((prop) => (
                    <Form.Item
                      key={prop.id}
                      name={`prop_${prop.id}_HIGH_RISE`}
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
      )}
    </Drawer>
  )
}

export default ProjectPropertiesDrawer
