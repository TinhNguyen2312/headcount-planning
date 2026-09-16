"use client"

import { Button, Card, DatePicker, Select, Tooltip } from "antd"
import dayjs from "dayjs"
import { Download, RotateCcw, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { MOCK_SCOPE_OPTIONS } from "@/mocks/headcountReportMock"

const { RangePicker } = DatePicker

interface HeadcountReportFilterCardProps {
  scopeType: "BY_SECTOR" | "BY_REGION" | "BY_PROJECT"
  scopeId: string
  fromMonth: string
  toMonth: string
  selectedDepartment: string
  searchKeyword: string
  onScopeTypeChange: (type: "BY_SECTOR" | "BY_REGION" | "BY_PROJECT") => void
  onScopeIdChange: (id: string) => void
  onDateRangeChange: (from: string, to: string) => void
  onDepartmentChange: (dept: string) => void
  onSearchChange: (keyword: string) => void
  onRunReport: () => void
  onSaveReport: () => void
  onExportExcel: () => void
  onNavigateToRecommendations: () => void
}

export const HeadcountReportFilterCard = ({
  scopeType,
  scopeId,
  fromMonth,
  toMonth,
  selectedDepartment,
  searchKeyword,
  onScopeTypeChange,
  onScopeIdChange,
  onDateRangeChange,
  onDepartmentChange,
  onSearchChange,
  onRunReport,
  onSaveReport,
  onExportExcel,
  onNavigateToRecommendations,
}: HeadcountReportFilterCardProps) => {
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)

  // Scope options based on scopeType
  const targetOptions = useMemo(() => {
    if (scopeType === "BY_SECTOR") return MOCK_SCOPE_OPTIONS.sectors
    if (scopeType === "BY_REGION") return MOCK_SCOPE_OPTIONS.regions
    return MOCK_SCOPE_OPTIONS.projects.map((p) => ({
      value: p.value,
      label: p.label,
    }))
  }, [scopeType])

  const handleDateChange = (_dates: any, dateStrings: [string, string]) => {
    const [start, end] = dateStrings
    if (!start || !end) return

    const startDate = dayjs(start, "MM/YYYY")
    const endDate = dayjs(end, "MM/YYYY")
    const diffMonths = endDate.diff(startDate, "month") + 1

    if (diffMonths < 6) {
      setDateRangeError(
        "Khoảng thời gian phân tích tối thiểu phải từ 6 tháng trở lên theo quy định BRD (Mục 4.4.a)!",
      )
    } else {
      setDateRangeError(null)
      onDateRangeChange(start, end)
    }
  }

  return (
    <Card
      className="border border-border/70 shadow-xs rounded-xl overflow-hidden bg-card"
      styles={{ body: { padding: "16px 20px" } }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="w-52"
              value={selectedDepartment}
              onChange={onDepartmentChange}
              options={[
                { value: "ALL", label: "Tất cả Phòng ban / Khối" },
                { value: "PCD", label: "PCD - Quản lý Xây dựng" },
                { value: "PCD_HTKT", label: "PCD_HTKT - Hạ tầng Kỹ thuật" },
                { value: "PCD_HT", label: "PCD_HT - Nhóm Hỗ trợ CT" },
                { value: "PMD", label: "PMD - Điều hành Dự án" },
                { value: "DMD", label: "DMD - Quản lý Thiết kế" },
                { value: "PLP", label: "PLP - Pháp lý Dự án" },
                { value: "GMD", label: "GMD - Ban Điều hành Vùng" },
                { value: "BTGD", label: "BTGD - Ban Tổng Giám đốc" },
              ]}
            />

            {(selectedDepartment !== "ALL" || searchKeyword) && (
              <Button
                type="text"
                size="small"
                icon={<RotateCcw className="size-3" />}
                onClick={() => {
                  onDepartmentChange("ALL")
                  onSearchChange("")
                }}
                className="text-xs text-muted-foreground"
              >
                Đặt lại
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip title="Xuất ma trận định biên ra file bảng tính Excel">
              <Button
                icon={<Download className="size-3.5" />}
                onClick={onExportExcel}
              >
                Xuất Excel
              </Button>
            </Tooltip>

            <Button
              type="dashed"
              icon={<Sparkles className="size-3.5 text-amber-500" />}
              onClick={onNavigateToRecommendations}
              className="border-amber-400 hover:border-amber-500 text-amber-600 dark:text-amber-400"
            >
              Chạy Khuyến nghị
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
