"use client"

import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  type FormInstance,
  InputNumber,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
} from "antd"
import { Calendar, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import React, { useMemo, useState } from "react"
import type { HeadcountMonthlyFactorInput } from "@/types"

export interface StandardMonthlyFactorsTabProps {
  form: FormInstance
}

const COMMON_DURATIONS = [
  { value: 6, label: "6 tháng (Tối thiểu chuẩn)" },
  { value: 7, label: "7 tháng" },
  { value: 8, label: "8 tháng" },
  { value: 9, label: "9 tháng" },
  { value: 10, label: "10 tháng" },
  { value: 12, label: "12 tháng (1 năm)" },
  { value: 18, label: "18 tháng (1.5 năm)" },
  { value: 24, label: "24 tháng (2 năm)" },
  { value: 36, label: "36 tháng (3 năm)" },
  { value: 48, label: "48 tháng (4 năm)" },
  { value: 60, label: "60 tháng (5 năm - Tối đa)" },
]

export const StandardMonthlyFactorsTab: React.FC<
  StandardMonthlyFactorsTabProps
> = ({ form }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(12)
  const [customDuration, setCustomDuration] = useState<number | null>(null)
  const [, setTick] = useState(0)
  const forceUpdate = () => setTick((t) => t + 1)

  // Watch monthly factors from form
  const watchedFactors = Form.useWatch("monthlyFactors", form)
  const rawFactors: HeadcountMonthlyFactorInput[] = useMemo(
    () => watchedFactors || form.getFieldValue("monthlyFactors") || [],
    [watchedFactors, form],
  )

  // Group factors by durationMonths
  const groupedDurations = useMemo(() => {
    const map = new Map<number, HeadcountMonthlyFactorInput[]>()
    for (const f of rawFactors) {
      const list = map.get(f.durationMonths) || []
      list.push(f)
      map.set(f.durationMonths, list)
    }

    // Sort items within each duration by monthNo ascending
    for (const [dur, items] of map.entries()) {
      items.sort((a, b) => a.monthNo - b.monthNo)
    }

    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [rawFactors])

  const existingDurationSet = useMemo(() => {
    return new Set(rawFactors.map((f) => f.durationMonths))
  }, [rawFactors])

  // Add a complete curve for target duration
  const handleAddDurationCurve = (duration: number) => {
    if (duration < 6 || duration > 60) return

    const filtered = rawFactors.filter((f) => f.durationMonths !== duration)
    const newCurve: HeadcountMonthlyFactorInput[] = []
    for (let m = 1; m <= duration; m++) {
      newCurve.push({
        durationMonths: duration,
        monthNo: m,
        factor: 1.0,
      })
    }

    form.setFieldValue("monthlyFactors", [...filtered, ...newCurve])
    forceUpdate()
  }

  // Remove entire curve for a duration
  const handleRemoveDurationCurve = (duration: number) => {
    const updated = rawFactors.filter((f) => f.durationMonths !== duration)
    form.setFieldValue("monthlyFactors", updated)
    forceUpdate()
  }

  // Reset all factors in a duration to 1.0
  const handleResetCurveToOne = (duration: number) => {
    const updated = rawFactors.map((f) => {
      if (f.durationMonths === duration) {
        return { ...f, factor: 1.0 }
      }
      return f
    })
    form.setFieldValue("monthlyFactors", updated)
    forceUpdate()
  }

  // Update a single month factor
  const handleFactorChange = (
    duration: number,
    monthNo: number,
    value: number | null,
  ) => {
    const val = value !== null && value >= 0 ? value : 1.0
    const updated = rawFactors.map((f) => {
      if (f.durationMonths === duration && f.monthNo === monthNo) {
        return { ...f, factor: val }
      }
      return f
    })
    form.setFieldValue("monthlyFactors", updated)
    forceUpdate()
  }

  const effectiveAddDuration = customDuration || selectedDuration

  return (
    <div className="space-y-4 pt-1">
      {/* Business Policy Alert */}
      <Alert
        type="info"
        showIcon
        message="Quy định ràng buộc thời lượng tối thiểu:"
        description={
          <div className="text-xs space-y-1 mt-0.5">
            <div>
              • Theo quy chuẩn định biên của Tập đoàn, thời lượng phân bổ cho
              mỗi chu kỳ giai đoạn tối thiểu là <strong>6 tháng</strong>{" "}
              (duration ≥ 6 tháng) và tối đa <strong>60 tháng</strong> (5 năm).
            </div>
            <div>
              • Mỗi kịch bản chu kỳ bao gồm trọn vẹn từ mốc <strong>T1</strong>{" "}
              đến <strong>T{`{n}`}</strong>. Khi chạy định biên cho dự án, hệ
              thống sẽ tự động đối chiếu số tháng thực tế của dự án để áp dụng
              kịch bản tương ứng.
            </div>
          </div>
        }
      />

      {/* Add Curve Generator Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="size-4 text-primary" />
          Thêm kịch bản chu kỳ:
        </span>

        <Select
          size="small"
          value={selectedDuration}
          onChange={(val) => {
            setSelectedDuration(val)
            setCustomDuration(null)
          }}
          className="w-48"
          options={COMMON_DURATIONS}
        />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">hoặc nhập:</span>
          <InputNumber
            size="small"
            min={6}
            max={60}
            placeholder="Số tháng (6-60)"
            value={customDuration}
            onChange={(val) =>
              setCustomDuration(val !== null ? Number(val) : null)
            }
            className="w-24"
            addonAfter="T"
          />
        </div>

        <Button
          size="small"
          type="primary"
          icon={<Plus className="size-3.5" />}
          onClick={() => handleAddDurationCurve(effectiveAddDuration)}
          disabled={
            effectiveAddDuration < 6 ||
            effectiveAddDuration > 60 ||
            existingDurationSet.has(effectiveAddDuration)
          }
        >
          {existingDurationSet.has(effectiveAddDuration)
            ? `Đã có chu kỳ ${effectiveAddDuration}T`
            : `Tạo chu kỳ ${effectiveAddDuration} tháng (T1 → T${effectiveAddDuration})`}
        </Button>

        {rawFactors.length > 0 && (
          <Popconfirm
            title="Xóa toàn bộ kịch bản tháng?"
            description="Bạn có chắc chắn muốn xóa toàn bộ hệ số tháng đã cấu hình?"
            okText="Xóa hết"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              form.setFieldValue("monthlyFactors", [])
              forceUpdate()
            }}
          >
            <Button size="small" danger className="ml-auto">
              Xóa toàn bộ
            </Button>
          </Popconfirm>
        )}
      </div>

      {/* Curves Display */}
      {groupedDurations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có kịch bản hệ số tháng nào. Vui lòng chọn chu kỳ thời lượng (tối thiểu 6 tháng) ở trên để khởi tạo."
        >
          <div className="flex justify-center gap-2">
            <Button
              type="primary"
              size="small"
              icon={<Sparkles className="size-3.5" />}
              onClick={() => handleAddDurationCurve(6)}
            >
              Tạo chu kỳ 6 tháng (Tối thiểu)
            </Button>
            <Button
              size="small"
              icon={<Calendar className="size-3.5" />}
              onClick={() => handleAddDurationCurve(12)}
            >
              Tạo chu kỳ 12 tháng (Chuẩn 1 năm)
            </Button>
          </div>
        </Empty>
      ) : (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {groupedDurations.map(([duration, items]) => (
            <Card
              key={duration}
              size="small"
              className="bg-card border-border shadow-none"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag color="purple" className="font-semibold text-xs m-0">
                      Chu kỳ: {duration} tháng
                    </Tag>
                    <span className="text-xs text-muted-foreground font-normal">
                      ({items.length} mốc tháng: T1 → T{duration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Đặt tất cả hệ số về 1.0">
                      <Button
                        size="small"
                        type="text"
                        icon={
                          <RotateCcw className="size-3 text-muted-foreground" />
                        }
                        onClick={() => handleResetCurveToOne(duration)}
                      >
                        Mặc định 1.0
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title={`Xóa chu kỳ ${duration} tháng?`}
                      description="Hành động này sẽ xóa toàn bộ các mốc tháng trong chu kỳ này."
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleRemoveDurationCurve(duration)}
                    >
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<Trash2 className="size-3.5" />}
                      >
                        Xóa chu kỳ
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              }
            >
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {items.map((item) => (
                  <div
                    key={item.monthNo}
                    className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-border/80 text-center flex flex-col justify-between"
                  >
                    <div className="text-[11px] font-semibold text-foreground">
                      T{item.monthNo}
                    </div>
                    <div className="my-1">
                      <InputNumber
                        size="small"
                        min={0}
                        max={10}
                        step={0.1}
                        value={item.factor}
                        onChange={(val) =>
                          handleFactorChange(duration, item.monthNo, val)
                        }
                        className="w-full text-center"
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {(item.factor * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default StandardMonthlyFactorsTab
