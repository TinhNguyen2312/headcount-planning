"use client"

import { message, Tabs } from "antd"
import { FileSpreadsheet, History, Settings2, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import {
  HeadcountRecommendationsView,
  HeadcountReportDetailDrawer,
  HeadcountReportFilterCard,
  HeadcountReportHistoryTable,
  HeadcountReportMatrixTable,
  HeadcountReportStatCards,
  HeadcountRunConfigView,
  HeadcountSaveReportModal,
} from "@/components/HeadcountReport"
import {
  buildMatrixWithSubTotals,
  type MatrixRowItem,
  MOCK_MATRIX_ROWS,
  MOCK_SAVED_REPORTS,
  MOCK_SCOPE_OPTIONS,
  type SavedReportItem,
} from "@/mocks/headcountReportMock"

export default function HeadcountReportsPage() {
  const [activeTab, setActiveTab] = useState("setup")
  const [scopeType, setScopeType] = useState<
    "BY_SECTOR" | "BY_REGION" | "BY_PROJECT"
  >("BY_REGION")
  const [scopeId, setScopeId] = useState("DN1")
  const [fromMonth, setFromMonth] = useState("01/2026")
  const [toMonth, setToMonth] = useState("06/2026")
  const [selectedDepartment, setSelectedDepartment] = useState("ALL")
  const [searchKeyword, setSearchKeyword] = useState("")

  // State cho Drawer chi tiết
  const [selectedRow, setSelectedRow] = useState<MatrixRowItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // State cho Modal lưu báo cáo
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [savedReports, setSavedReports] =
    useState<SavedReportItem[]>(MOCK_SAVED_REPORTS)
  const [currentReportCode, setCurrentReportCode] = useState("BC_202609_001")

  // Tên phạm vi hiển thị
  const scopeName = useMemo(() => {
    if (scopeType === "BY_SECTOR") {
      return (
        MOCK_SCOPE_OPTIONS.sectors.find((s) => s.value === scopeId)?.label ||
        "Khu vực 2"
      )
    }
    if (scopeType === "BY_REGION") {
      return (
        MOCK_SCOPE_OPTIONS.regions.find((r) => r.value === scopeId)?.label ||
        "Vùng Đồng Nai 1"
      )
    }
    return (
      MOCK_SCOPE_OPTIONS.projects.find((p) => p.value === scopeId)?.label ||
      "Aqua - 112Ha"
    )
  }, [scopeType, scopeId])

  // Lọc dữ liệu ma trận theo Department và Search Keyword và sinh dòng SubTotal
  const filteredMatrixRows = useMemo(() => {
    const base = MOCK_MATRIX_ROWS.filter((row) => {
      const matchDept =
        selectedDepartment === "ALL" ||
        row.departmentCode === selectedDepartment ||
        row.departmentCode.startsWith(selectedDepartment)

      const matchKeyword =
        !searchKeyword ||
        row.roleName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        row.roleCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        row.departmentName.toLowerCase().includes(searchKeyword.toLowerCase())

      return matchDept && matchKeyword
    })

    return buildMatrixWithSubTotals(base)
  }, [selectedDepartment, searchKeyword])

  // Tính tổng để truyền cho Modal lưu báo cáo
  const { totalStandard, totalActual } = useMemo(() => {
    let std = 0
    let act = 0
    for (const r of filteredMatrixRows) {
      if (r.isSubTotal) continue
      for (const m of r.months) {
        std += m.standardHeadcount
        act += m.actualHeadcount
      }
    }
    return { totalStandard: std, totalActual: act }
  }, [filteredMatrixRows])

  const handleRunReport = () => {
    message.loading({
      content: "Đang tính toán lại ma trận định biên...",
      key: "run-report",
    })
    setTimeout(() => {
      message.success({
        content: `Đã cập nhật dữ liệu phân tích cho ${scopeName} (${fromMonth} -> ${toMonth})!`,
        key: "run-report",
      })
    }, 600)
  }

  const handleExportExcel = () => {
    message.success(
      "Đang xuất bảng ma trận định biên ra tệp Excel (.xlsx)... Tải xuống hoàn tất!",
    )
  }

  const handleSelectRow = (row: MatrixRowItem) => {
    setSelectedRow(row)
    setIsDrawerOpen(true)
  }

  const handleSaveSuccess = (newReport: SavedReportItem) => {
    setSavedReports((prev) => [newReport, ...prev])
    setCurrentReportCode(newReport.reportCode)
  }

  const tabItems = [
    {
      key: "setup",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Settings2 className="size-4" />
          Thiết lập &amp; Chạy Định biên
        </span>
      ),
      children: (
        <div className="pt-1">
          <HeadcountRunConfigView
            onRun={({
              scopeType: st,
              scopeId: sid,
              fromMonth: fm,
              toMonth: tm,
            }) => {
              // Cập nhật phạm vi & kỳ sang tab Báo cáo
              setScopeType(st)
              setScopeId(sid)
              setFromMonth(fm)
              setToMonth(tm)
              // Chuyển sang tab Báo cáo
              setActiveTab("matrix")
              message.success(
                "Đã tính toán xong! Xem kết quả tại tab Báo cáo Định biên.",
              )
            }}
          />
        </div>
      ),
    },
    {
      key: "matrix",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileSpreadsheet className="size-4" />
          Báo cáo Định biên
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 pt-1">
          <HeadcountReportFilterCard
            scopeType={scopeType}
            scopeId={scopeId}
            fromMonth={fromMonth}
            toMonth={toMonth}
            selectedDepartment={selectedDepartment}
            searchKeyword={searchKeyword}
            onScopeTypeChange={setScopeType}
            onScopeIdChange={setScopeId}
            onDateRangeChange={(from, to) => {
              setFromMonth(from)
              setToMonth(to)
            }}
            onDepartmentChange={setSelectedDepartment}
            onSearchChange={setSearchKeyword}
            onRunReport={handleRunReport}
            onSaveReport={() => setIsSaveModalOpen(true)}
            onExportExcel={handleExportExcel}
            onNavigateToRecommendations={() => setActiveTab("recommendations")}
          />

          <HeadcountReportStatCards matrixRows={filteredMatrixRows} />

          <HeadcountReportMatrixTable
            matrixRows={filteredMatrixRows}
            onSelectRow={handleSelectRow}
          />
        </div>
      ),
    },
    {
      key: "recommendations",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="size-4 text-amber-500" />
          Khuyến nghị & Đề xuất Nhân sự
        </span>
      ),
      children: (
        <div className="pt-1">
          <HeadcountRecommendationsView
            reportCode={currentReportCode}
            scopeName={scopeName}
          />
        </div>
      ),
    },
    {
      key: "history",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <History className="size-4" />
          Lịch sử Báo cáo đã lưu ({savedReports.length})
        </span>
      ),
      children: (
        <div className="pt-1">
          <HeadcountReportHistoryTable
            reports={savedReports}
            onViewReport={(rep) => {
              setCurrentReportCode(rep.reportCode)
              setActiveTab("matrix")
              message.info(`Đang xem lại ${rep.title}`)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <PageContainer title="Báo cáo Định biên Nhân sự">
      <div className="pt-1">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          className="headcount-reports-tabs"
        />
      </div>

      <HeadcountReportDetailDrawer
        open={isDrawerOpen}
        row={selectedRow}
        onClose={() => setIsDrawerOpen(false)}
      />

      <HeadcountSaveReportModal
        open={isSaveModalOpen}
        scopeName={scopeName}
        fromMonth={fromMonth}
        toMonth={toMonth}
        totalStandard={totalStandard}
        totalActual={totalActual}
        onCancel={() => setIsSaveModalOpen(false)}
        onSuccess={handleSaveSuccess}
      />
    </PageContainer>
  )
}
