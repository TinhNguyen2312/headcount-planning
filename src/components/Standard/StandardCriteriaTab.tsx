"use client"

import {
  Alert,
  Button,
  Card,
  Form,
  type FormInstance,
  Input,
  Select,
  Tag,
} from "antd"
import { Plus, Trash2 } from "lucide-react"
import React, { useMemo } from "react"
import { propertyQueries } from "@/hooks/server/properties"
import { CriteriaValueField } from "./CriteriaValueField"
import {
  getDefaultOperatorForDataType,
  getOperatorsForDataType,
} from "./criteriaRules"

export interface StandardCriteriaTabProps {
  form: FormInstance
  readOnly?: boolean
}

export const StandardCriteriaTab: React.FC<StandardCriteriaTabProps> = ({
  form,
  readOnly = false,
}) => {
  const { data: properties = [] } = propertyQueries.useList({ limit: 500 })

  const propertyMap = useMemo(
    () => new Map(properties.map((p) => [p.id, p])),
    [properties],
  )

  const propertyOptions = useMemo(
    () =>
      properties.map((p) => ({
        value: p.id,
        label: `${p.name}${p.unit ? ` [${p.unit}]` : ""}`,
        dataType: p.dataType,
      })),
    [properties],
  )

  return (
    <div className="pt-2">
      <Alert
        type="info"
        showIcon
        className="mb-3 text-xs"
        title="Quy tắc lọc AND"
        description="Định biên này sẽ được áp dụng cho dự án nếu thỏa mãn tất cả các điều kiện bên dưới. Phép toán so sánh và kiểu giá trị tự động điều chỉnh theo Cơ sở định biên."
      />

      <Form.List name="criteria">
        {(fields, { add, remove }) => (
          <div className="space-y-3">
            {fields.map(({ key, name, ...restField }) => {
              return (
                <Card
                  key={key}
                  size="small"
                  className="bg-slate-50/50 dark:bg-slate-900/30 border-border shadow-none"
                >
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) =>
                      prev.criteria?.[name]?.propertyId !==
                        curr.criteria?.[name]?.propertyId ||
                      prev.criteria?.[name]?.conditionOperator !==
                        curr.criteria?.[name]?.conditionOperator
                    }
                  >
                    {() => {
                      const propertyId = form.getFieldValue([
                        "criteria",
                        name,
                        "propertyId",
                      ])
                      const operator =
                        form.getFieldValue([
                          "criteria",
                          name,
                          "conditionOperator",
                        ]) || "BETWEEN"

                      const selectedProperty = propertyMap.get(propertyId)
                      const availableOperators = getOperatorsForDataType(
                        selectedProperty?.dataType,
                      )

                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-foreground">
                                Điều kiện #{name + 1}
                              </span>
                              {selectedProperty && (
                                <Tag color="blue" className="text-[10px]">
                                  {selectedProperty.dataType}
                                </Tag>
                              )}
                            </div>
                            {!readOnly && (
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<Trash2 className="size-3.5" />}
                                onClick={() => remove(name)}
                              >
                                Xóa
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Form.Item
                              {...restField}
                              name={[name, "propertyId"]}
                              label="Cơ sở định biên"
                              rules={[
                                { required: true, message: "Chọn cơ sở" },
                              ]}
                              className="mb-2 col-span-2"
                            >
                              <Select
                                placeholder="Chọn cơ sở định biên..."
                                options={propertyOptions}
                                showSearch
                                optionFilterProp="label"
                                onChange={(newPropId) => {
                                  const newProp = propertyMap.get(newPropId)
                                  const defaultOp =
                                    getDefaultOperatorForDataType(
                                      newProp?.dataType,
                                    )
                                  form.setFieldValue(
                                    ["criteria", name, "conditionOperator"],
                                    defaultOp,
                                  )
                                  form.setFieldValue(
                                    ["criteria", name, "minValue"],
                                    undefined,
                                  )
                                  form.setFieldValue(
                                    ["criteria", name, "maxValue"],
                                    undefined,
                                  )
                                  form.setFieldValue(
                                    ["criteria", name, "valueText"],
                                    undefined,
                                  )
                                }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "conditionOperator"]}
                              label="Toán tử so sánh"
                              rules={[
                                {
                                  required: true,
                                  message: "Chọn phép so sánh",
                                },
                              ]}
                              className="mb-2"
                            >
                              <Select
                                options={availableOperators}
                                onChange={() => {
                                  form.setFieldValue(
                                    ["criteria", name, "minValue"],
                                    undefined,
                                  )
                                  form.setFieldValue(
                                    ["criteria", name, "maxValue"],
                                    undefined,
                                  )
                                  form.setFieldValue(
                                    ["criteria", name, "valueText"],
                                    undefined,
                                  )
                                }}
                              />
                            </Form.Item>

                            <CriteriaValueField
                              fieldName={name}
                              restField={restField}
                              property={selectedProperty}
                              operator={operator}
                            />
                          </div>

                          <Form.Item
                            {...restField}
                            name={[name, "note"]}
                            label="Ghi chú điều kiện"
                            className="mb-0 mt-1"
                          >
                            <Input placeholder="Ví dụ: Áp dụng cho các dự án diện tích từ 50ha trở lên" />
                          </Form.Item>
                        </>
                      )
                    }}
                  </Form.Item>
                </Card>
              )
            })}

            {fields.length === 0 && readOnly && (
              <div className="text-center py-6 text-muted-foreground text-xs border border-dashed rounded-lg">
                Không có điều kiện lọc bổ sung (Áp dụng cho mọi quy mô dự án).
              </div>
            )}

            {!readOnly && (
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    conditionOperator: "BETWEEN",
                  })
                }
                block
                icon={<Plus className="size-4" />}
              >
                Thêm điều kiện lọc
              </Button>
            )}
          </div>
        )}
      </Form.List>
    </div>
  )
}

export default StandardCriteriaTab
