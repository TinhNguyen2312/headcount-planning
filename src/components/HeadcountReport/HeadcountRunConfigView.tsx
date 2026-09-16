"use client"

import {
  Button,
  Card,
  DatePicker,
  Divider,
  Radio,
  Select,
  Tag,
  Tooltip,
} from "antd"
import dayjs, { type Dayjs } from "dayjs"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Layers,
  MapPin,
  Play,
  RefreshCw,
} from "lucide-react"
import { useState } from "react"
import { MOCK_SCOPE_OPTIONS } from "@/mocks/headcountReportMock"

interface HeadcountRunConfigViewProps {
  onRun: (params: {
    scopeType: "BY_SECTOR" | "BY_REGION" | "BY_PROJECT"
    scopeId: string
    fromMonth: string
    toMonth: string
  }) => void
}

const SCOPE_TYPE_INFO = {
  BY_SECTOR: {
    label: "Theo Khu vực",
    icon: <Layers className="size-4 text-violet-500" />,
    color: "purple",
    description:
      "Tính định biên tổng hợp cho toàn bộ các Vùng và Dự án thuộc một Khu vực. Phù hợp để lập kế hoạch nhân sự cấp cao.",
  },
  BY_REGION: {
    label: "Theo Vùng",
    icon: <MapPin className="size-4 text-blue-500" />,
    color: "blue",
    description:
      "Tính định biên cho tất cả dự án trong một Vùng địa lý. Đây là phạm vi thường dùng nhất, phản ánh rõ nhu cầu nhân sự BY_REGION và BY_PROJECT trong cùng một khu vực.",
  },
  BY_PROJECT: {
    label: "Theo Dự án",
    icon: <Building2 className="size-4 text-emerald-500" />,
    color: "green",
    description:
      "Tính định biên riêng cho một Dự án cụ thể. Dùng khi cần phân tích chuyên sâu hoặc dự án có đặc thù riêng biệt.",
  },
} as const

export const HeadcountRunConfigView = ({
  onRun,
}: HeadcountRunConfigViewProps) => {
  const [scopeType, setScopeType] = useState<
    "BY_SECTOR" | "BY_REGION" | "BY_PROJECT"
  >("BY_REGION")
  const [scopeId, setScopeId] = useState("DN1")
  // Chỉ chọn tháng bắt đầu — kỳ phân tích cố định 6 tháng
  const [startMonth, setStartMonth] = useState<Dayjs>(
    dayjs("01/2026", "MM/YYYY"),
  )
  const [isRunning, setIsRunning] = useState(false)
  const [lastRunResult, setLastRunResult] = useState<{
    scopeLabel: string
    period: string
    totalRoles: number
    shortageCount: number
    surplusCount: number
  } | null>(null)

  // Tháng kết thúc = tháng bắt đầu + 5 (cố định 6 tháng)
  const endMonth = startMonth.add(5, "month")

  // Danh sách lựa chọn theo loại phạm vi
  const scopeOptions = {
    BY_SECTOR: MOCK_SCOPE_OPTIONS.sectors,
    BY_REGION: MOCK_SCOPE_OPTIONS.regions,
    BY_PROJECT: MOCK_SCOPE_OPTIONS.projects.map((p) => ({
      value: p.value,
      label: p.label,
    })),
  }

  // Tên phạm vi đang chọn
  const currentScopeLabel =
    scopeOptions[scopeType].find((o) => o.value === scopeId)?.label ?? scopeId

  // Validation: chỉ cần có scopeId là đủ (kỳ luôn hợp lệ vì cố định 6 tháng)
  const isValid = !!scopeId

  const handleScopeTypeChange = (
    newType: "BY_SECTOR" | "BY_REGION" | "BY_PROJECT",
  ) => {
    setScopeType(newType)
    // Đặt lại scopeId về giá trị mặc định của loại mới
    if (newType === "BY_SECTOR") setScopeId("KV2")
    else if (newType === "BY_REGION") setScopeId("DN1")
    else setScopeId("1")
  }

  const handleRun = () => {
    if (!isValid) return
    setIsRunning(true)

    // Giả lập tính toán (mock: 800ms)
    setTimeout(() => {
      setIsRunning(false)
      setLastRunResult({
        scopeLabel: currentScopeLabel,
        period: `${startMonth.format("MM/YYYY")} → ${endMonth.format("MM/YYYY")}`,
        totalRoles: 3,
        shortageCount: 1,
        surplusCount: 1,
      })
      onRun({
        scopeType,
        scopeId,
        fromMonth: startMonth.format("MM/YYYY"),
        toMonth: endMonth.format("MM/YYYY"),
      })
    }, 800)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          className="border border-border/70 shadow-xs rounded-xl"
          styles={{ body: { padding: "20px 24px" } }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                1
              </div>
              <span className="font-semibold text-base">
                Chọn loại định biên
              </span>
            </div>

            <Radio.Group
              value={scopeType}
              onChange={(e) => handleScopeTypeChange(e.target.value)}
              className="flex flex-wrap gap-2"
            >
              {(
                Object.entries(SCOPE_TYPE_INFO) as [
                  keyof typeof SCOPE_TYPE_INFO,
                  (typeof SCOPE_TYPE_INFO)[keyof typeof SCOPE_TYPE_INFO],
                ][]
              ).map(([key, info]) => (
                <Radio.Button
                  key={key}
                  value={key}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg"
                >
                  <span className="flex items-center gap-1.5">
                    {info.label}
                  </span>
                </Radio.Button>
              ))}
            </Radio.Group>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {scopeType === "BY_SECTOR"
                  ? "Chọn Khu vực"
                  : scopeType === "BY_REGION"
                    ? "Chọn Vùng"
                    : "Chọn Dự án"}
              </label>
              <Select
                className="w-full"
                value={scopeId}
                onChange={setScopeId}
                options={scopeOptions[scopeType]}
                placeholder="Chọn đối tượng phân tích..."
                size="large"
              />
            </div>
          </div>
        </Card>

        <Card
          className="border border-border/70 shadow-xs rounded-xl"
          styles={{ body: { padding: "20px 24px" } }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                2
              </div>
              <span className="font-semibold text-base">
                Chọn tháng chạy định biện
              </span>
              <Tag color="blue" className="ml-1 text-xs">
                Cố định 6 tháng
              </Tag>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tháng bắt đầu
                </label>
                <DatePicker
                  picker="month"
                  format="MM/YYYY"
                  value={startMonth}
                  onChange={(val) => {
                    if (val) setStartMonth(val)
                  }}
                  allowClear={false}
                  size="large"
                  className="w-full"
                  placeholder="Chọn tháng bắt đầu..."
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <div className="flex text-base items-center">
                  Tháng chạy định biên:{"    "}
                  <span className=" ml-2 font-semibold text-foreground">
                    {startMonth.format("MM/YYYY")}
                  </span>
                  <ArrowRight className="size-4 mx-1 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {endMonth.format("MM/YYYY")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Tooltip title={!isValid ? "Vui lòng chọn phạm vi phân tích" : ""}>
          <Button
            type="primary"
            size="large"
            icon={
              isRunning ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )
            }
            onClick={handleRun}
            loading={isRunning}
            disabled={!isValid}
            className="font-semibold px-8 shadow-sm"
          >
            {isRunning ? "Đang tính toán..." : "Chạy Định biên"}
          </Button>
        </Tooltip>
      </div>

      {lastRunResult && (
        <>
          <Divider className="my-0" />
          <Card
            className="border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl shadow-xs"
            styles={{ body: { padding: "16px 20px" } }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                    Đã chạy xong! Kết quả đã cập nhật ở tab Báo cáo.
                  </span>
                </div>
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">
                    {lastRunResult.scopeLabel}
                  </span>{" "}
                  · {lastRunResult.period} · {lastRunResult.totalRoles} chức
                  danh
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {lastRunResult.shortageCount > 0 && (
                  <Tag color="red" className="text-xs">
                    {lastRunResult.shortageCount} chức danh thiếu
                  </Tag>
                )}
                {lastRunResult.surplusCount > 0 && (
                  <Tag color="orange" className="text-xs">
                    {lastRunResult.surplusCount} chức danh thừa
                  </Tag>
                )}
                <Button
                  type="primary"
                  size="small"
                  icon={<ChevronRight className="size-3.5" />}
                  iconPosition="end"
                  onClick={() =>
                    onRun({
                      scopeType,
                      scopeId,
                      fromMonth: startMonth.format("MM/YYYY"),
                      toMonth: endMonth.format("MM/YYYY"),
                    })
                  }
                  className="text-xs"
                >
                  Xem Báo cáo
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
