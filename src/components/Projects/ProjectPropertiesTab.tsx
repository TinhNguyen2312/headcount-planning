"use client"

import {
  Alert,
  Badge,
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
import {
  Building,
  Building2,
  Home,
  Layers,
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

interface ProjectPropertiesTabProps {
  projectId: number
  viewOnly?: boolean
}

export const ProjectPropertiesTab: React.FC<ProjectPropertiesTabProps> = ({
  projectId,
  viewOnly = false,
}) => {
  const [form] = Form.useForm()
  Form.useWatch([], form)

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

  // Group properties
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

  const perTypeProperties = useMemo(
    () =>
      properties.filter(
        (p) => p.scope === "PER_TYPE" && p.dataType === "NUMBER",
      ),
    [properties],
  )

  // Pre-fill form values
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
      // 1. Common
      const commonMatch = values.find(
        (v) =>
          v.propertyId === prop.id &&
          (v.projectType === "COMMON" || !v.projectType),
      )
      if (commonMatch) {
        formFields[`prop_${prop.id}_COMMON`] = getVal(prop, commonMatch)
      }

      // 2. Low Rise
      const lowMatch = values.find(
        (v) => v.propertyId === prop.id && v.projectType === "LOW_RISE",
      )
      if (lowMatch) {
        formFields[`prop_${prop.id}_LOW_RISE`] = getVal(prop, lowMatch)
      } else if (!hasHighRise && commonMatch && prop.scope === "PER_TYPE") {
        // Fallback if previously saved as COMMON
        formFields[`prop_${prop.id}_LOW_RISE`] = getVal(prop, commonMatch)
      }

      // 3. High Rise
      const highMatch = values.find(
        (v) => v.propertyId === prop.id && v.projectType === "HIGH_RISE",
      )
      if (highMatch) {
        formFields[`prop_${prop.id}_HIGH_RISE`] = getVal(prop, highMatch)
      } else if (!hasLowRise && commonMatch && prop.scope === "PER_TYPE") {
        // Fallback if previously saved as COMMON
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
    <div className="space-y-6 w-full pb-10">
      {/* Mixed-use notification banner */}
      {isMixedUse ? (
        <Alert
          type="info"
          showIcon
          className="rounded-lg border-blue-200 bg-blue-50/70 dark:bg-blue-950/30"
          message={
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                Dự án hỗn hợp (Mixed-use: Thấp tầng & Cao tầng)
              </span>
              <Tag color="purple" className="m-0 text-[11px]">
                Đa phân khúc
              </Tag>
            </div>
          }
          description="Hệ thống đã tự động phân nhóm các chỉ số quy mô thành Khối Thấp tầng và Khối Cao tầng để nhập liệu độc lập, phục vụ tính toán định biên chính xác cho từng hạng mục công trình."
        />
      ) : (
        <Alert
          type="success"
          showIcon
          className="rounded-lg border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30"
          message={
            <span className="font-semibold text-sm">
              Dự án đơn loại hình:{" "}
              {hasLowRise ? "Hạng mục Thấp tầng" : "Hạng mục Cao tầng"}
            </span>
          }
          description="Chỉ số quy mô được tùy biến hiển thị tương ứng với loại hình công trình đang kích hoạt của dự án."
        />
      )}

      <Form form={form} layout="vertical" className="space-y-6">
        {/* SECTION 1: COMMON PROPERTIES */}
        {commonProperties.length > 0 && (
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <Building className="size-4 text-blue-600" />
                  <span>Thông số chung toàn dự án</span>
                </div>
                <Badge count="Chung" style={{ backgroundColor: "#1890ff" }} />
              </div>
            }
            className="shadow-xs border-border/80"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                >
                  {renderFieldInput(prop)}
                </Form.Item>
              ))}
            </div>
          </Card>
        )}

        {/* SECTION 2: LOW-RISE PROPERTIES */}
        {hasLowRise && (
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <Home className="size-4 text-emerald-600" />
                  <span>Hạng mục Thấp tầng (Low-rise)</span>
                </div>
                <Tag color="green" className="m-0 font-medium">
                  🏠 Thấp tầng
                </Tag>
              </div>
            }
            className="shadow-xs border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
          >
            {lowRiseProperties.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thuộc tính nào cho Thấp tầng"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  >
                    {renderFieldInput(prop)}
                  </Form.Item>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 3: HIGH-RISE PROPERTIES */}
        {hasHighRise && (
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                  <Building2 className="size-4 text-indigo-600" />
                  <span>Hạng mục Cao tầng (High-rise)</span>
                </div>
                <Tag color="purple" className="m-0 font-medium">
                  🏢 Cao tầng
                </Tag>
              </div>
            }
            className="shadow-xs border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10"
          >
            {highRiseProperties.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thuộc tính nào cho Cao tầng"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  >
                    {renderFieldInput(prop)}
                  </Form.Item>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 4: MIXED-USE SUMMARY (Auto-Calculated Totals) */}
        {isMixedUse && perTypeProperties.length > 0 && (
          <Card
            size="small"
            title={
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Layers className="size-3.5 text-primary" />
                <span>
                  Bảng đối soát & Tổng quy mô toàn dự án (Tự động tính)
                </span>
              </div>
            }
            className="bg-slate-50/70 dark:bg-slate-900/40 border-dashed"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {perTypeProperties.map((prop) => {
                const lowVal =
                  Number(form.getFieldValue(`prop_${prop.id}_LOW_RISE`)) || 0
                const highVal =
                  Number(form.getFieldValue(`prop_${prop.id}_HIGH_RISE`)) || 0
                const total = lowVal + highVal

                return (
                  <div
                    key={prop.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-md border border-border/70 flex flex-col justify-between"
                  >
                    <div className="text-xs text-muted-foreground font-medium truncate mb-1">
                      {prop.name}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-[11px] text-muted-foreground space-x-1">
                        <span>Thấp: {lowVal.toLocaleString()}</span>
                        <span>•</span>
                        <span>Cao: {highVal.toLocaleString()}</span>
                      </div>
                      <div className="text-sm font-bold text-primary font-mono">
                        {total.toLocaleString()} {prop.unit || ""}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

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
