"use client"

import { Button, Card, Input, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Download, ExternalLink, FileSpreadsheet, Search } from "lucide-react"
import { useState } from "react"
import {
  MOCK_SAVED_REPORTS,
  type SavedReportItem,
} from "@/mocks/headcountReportMock"

interface HeadcountReportHistoryTableProps {
  reports?: SavedReportItem[]
  onViewReport: (report: SavedReportItem) => void
}

export const HeadcountReportHistoryTable = ({
  reports = MOCK_SAVED_REPORTS,
  onViewReport,
}: HeadcountReportHistoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredReports = reports.filter(
    (r) =>
      r.reportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.scopeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const columns: ColumnsType<SavedReportItem> = [
    {
      title: "Mã Báo cáo",
      dataIndex: "reportCode",
      key: "reportCode",
      width: 150,
      render: (code) => (
        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
          {code}
        </span>
      ),
    },
    {
      title: "Tên Báo cáo",
      dataIndex: "title",
      key: "title",
      render: (title, r) => (
        <div>
          <div className="font-semibold text-xs text-foreground">{title}</div>
          <div className="text-[11px] text-muted-foreground">
            Phạm vi: <strong>{r.scopeName}</strong>
          </div>
        </div>
      ),
    },
    {
      title: "Kỳ phân tích",
      key: "period",
      width: 140,
      align: "center",
      render: (_, r) => (
        <Tag color="cyan" className="text-xs">
          {r.fromMonth} $\to$ {r.toMonth}
        </Tag>
      ),
    },
    {
      title: "Tổng ĐB",
      dataIndex: "totalStandard",
      key: "totalStandard",
      width: 90,
      align: "center",
      render: (val) => (
        <span className="font-bold text-xs text-blue-600">
          {val.toFixed(1)}
        </span>
      ),
    },
    {
      title: "Tổng Thực tế",
      dataIndex: "totalActual",
      key: "totalActual",
      width: 100,
      align: "center",
      render: (val) => (
        <span className="font-bold text-xs text-emerald-600">
          {val.toFixed(1)}
        </span>
      ),
    },
    {
      title: "Thừa / Thiếu",
      key: "diff",
      width: 120,
      align: "center",
      render: (_, r) => (
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
          <span className="text-amber-600">+{r.totalSurplus.toFixed(1)}</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-rose-600">-{r.totalShortage.toFixed(1)}</span>
        </div>
      ),
    },
    {
      title: "Tỷ lệ đáp ứng",
      dataIndex: "fulfillmentRate",
      key: "fulfillmentRate",
      width: 110,
      align: "center",
      render: (rate) => (
        <Tag color={rate >= 90 ? "success" : "warning"} className="font-bold">
          {rate.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (st) => {
        if (st === "APPROVED") return <Tag color="green">Đã phê duyệt</Tag>
        if (st === "SUBMITTED") return <Tag color="blue">Chờ duyệt</Tag>
        return <Tag color="default">Bản nháp</Tag>
      },
    },
    {
      title: "Người tạo / Ngày tạo",
      key: "creator",
      width: 160,
      render: (_, r) => (
        <div>
          <div className="text-xs text-foreground font-medium">
            {r.createdBy}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {r.createdAt}
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      align: "center",
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          icon={<ExternalLink className="size-3.5" />}
          onClick={() => onViewReport(r)}
        >
          Xem lại
        </Button>
      ),
    },
  ]

  return (
    <Card
      className="border border-border/70 shadow-xs rounded-xl overflow-hidden bg-card"
      styles={{ body: { padding: "16px 20px" } }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">
              Lịch sử các Báo cáo Định biên đã lưu
            </span>
            <Tag color="blue">{filteredReports.length} báo cáo</Tag>
          </div>

          <Input
            prefix={<Search className="size-3.5 text-muted-foreground" />}
            placeholder="Tìm theo mã hoặc tên báo cáo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
            allowClear
          />
        </div>

        <Table<SavedReportItem>
          columns={columns}
          dataSource={filteredReports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          size="small"
          className="border border-border/70 rounded-xl overflow-hidden"
        />
      </div>
    </Card>
  )
}
