"use client"

import {
  Alert,
  Button,
  Form,
  type FormInstance,
  InputNumber,
  Space,
  Table,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { RotateCcw } from "lucide-react"
import React, { useCallback, useMemo } from "react"

export interface StandardMonthlyFactorsTabProps {
  form: FormInstance
  readOnly?: boolean
}

export const StandardMonthlyFactorsTab: React.FC<
  StandardMonthlyFactorsTabProps
> = ({ form, readOnly = false }) => {
  const watchedDuration = Form.useWatch("durationMonths", form)
  const watchedFactors = Form.useWatch("monthlyFactors", form)

  const durationMonths =
    watchedDuration ?? form.getFieldValue("durationMonths") ?? 12

  const factors: number[] = useMemo(() => {
    const raw = watchedFactors ?? form.getFieldValue("monthlyFactors")
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(Number)
    }
    return Array(durationMonths).fill(1.0)
  }, [watchedFactors, form, durationMonths])

  // Handle duration change
  const handleDurationChange = useCallback(
    (newVal: number | null) => {
      const validDuration = newVal && newVal >= 6 && newVal <= 60 ? newVal : 12
      form.setFieldValue("durationMonths", validDuration)

      const currentFactors = form.getFieldValue("monthlyFactors") || []
      const updated = [...currentFactors]
      if (updated.length < validDuration) {
        while (updated.length < validDuration) {
          updated.push(1.0)
        }
      } else if (updated.length > validDuration) {
        updated.length = validDuration
      }
      form.setFieldValue("monthlyFactors", updated)
    },
    [form],
  )

  // Handle factor change for a single month (0-indexed)
  const handleFactorChange = useCallback(
    (index: number, val: number | null) => {
      const nextVal = val !== null && val >= 0 ? val : 1.0
      const currentFactors = [
        ...(form.getFieldValue("monthlyFactors") || factors),
      ]
      currentFactors[index] = nextVal
      form.setFieldValue("monthlyFactors", currentFactors)
    },
    [form, factors],
  )

  // Reset all factors to 1.0
  const handleResetToOne = useCallback(() => {
    const reset = Array(durationMonths).fill(1.0)
    form.setFieldValue("monthlyFactors", reset)
  }, [form, durationMonths])

  // Generate table columns for months T1..Tn
  const columns: ColumnsType<any> = useMemo(() => {
    const cols: ColumnsType<any> = []
    for (let m = 1; m <= durationMonths; m++) {
      const index = m - 1
      cols.push({
        title: `T${m}`,
        key: `m_${m}`,
        width: 68,
        align: "center",
        render: () => {
          const factorVal = factors[index] ?? 1.0
          return (
            <div className="flex flex-col items-center justify-center gap-0.5 py-0.5">
              <InputNumber
                size="small"
                min={0}
                max={10}
                step={0.1}
                precision={2}
                controls={false}
                disabled={readOnly}
                value={factorVal}
                onChange={(val) => handleFactorChange(index, val)}
                className="w-14 text-center font-mono text-xs"
              />
            </div>
          )
        },
      })
    }
    return cols
  }, [durationMonths, factors, handleFactorChange, readOnly])

  return (
    <div className="space-y-3 pt-1">
      <Alert
        type="info"
        showIcon
        className="text-xs"
        title="Hệ số phân bổ chuẩn theo tháng (T1 -> Tn) từ 6 đến 60 tháng. Hệ số 1.0 tương đương 100% định biên."
      />

      <div className="flex items-center justify-between gap-3 bg-card p-2.5 rounded-lg border border-border">
        <Space size="middle">
          <span className="text-xs font-medium text-foreground">
            Thời lượng chu kỳ (Số tháng):
          </span>
          <Form.Item name="durationMonths" noStyle>
            <InputNumber
              size="small"
              min={6}
              max={60}
              disabled={readOnly}
              onChange={handleDurationChange}
              placeholder="Từ 6 đến 60"
              addonAfter="tháng"
              className="w-36"
            />
          </Form.Item>
        </Space>

        {!readOnly && (
          <Tooltip title="Đặt lại toàn bộ hệ số các tháng về 1.0 (100%)">
            <Button
              size="small"
              type="text"
              icon={<RotateCcw className="size-3.5 text-muted-foreground" />}
              onClick={handleResetToOne}
            >
              Mặc định 1.0
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Hidden form item to register monthlyFactors in form store */}
      <Form.Item name="monthlyFactors" noStyle>
        <div className="hidden" />
      </Form.Item>

      {/* 1-Row Table Matrix */}
      <Table
        size="small"
        bordered
        pagination={false}
        dataSource={[{ key: 1 }]}
        scroll={{ x: "max-content" }}
        columns={columns}
        className="border border-border rounded-md overflow-hidden"
      />
    </div>
  )
}

export default StandardMonthlyFactorsTab
