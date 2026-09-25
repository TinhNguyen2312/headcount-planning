import React from "react"
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  Badge,
  Card,
} from "antd"
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  Flame,
  FileCheck2,
  Wrench,
  Building,
  RotateCcw,
} from "lucide-react"
import { RFIItem, RFIPriority, RFIStatus } from "../types"
import { DisciplineType } from "../../deliverables/types"

const { Paragraph, Text } = Typography

interface RfiTableProps {
  data: RFIItem[]
  onViewRfi: (rfi: RFIItem) => void
  onResolveRfi: (rfi: RFIItem) => void
  onCreateChangeReport: (rfi: RFIItem) => void
}

export const RfiTable: React.FC<RfiTableProps> = ({
  data,
  onViewRfi,
  onResolveRfi,
  onCreateChangeReport,
}) => {
  const renderPriority = (priority: RFIPriority, slaHours: number) => {
    switch (priority) {
      case "HIGH":
        return (
          <Tooltip title="Chặn thi công (Critical path) - SLA xử lý trong vòng 24 giờ">
            <Tag color="red" className="font-bold flex items-center gap-1 w-fit">
              <Flame size={12} />
              HIGH ({slaHours}h)
            </Tag>
          </Tooltip>
        )
      case "MEDIUM":
        return (
          <Tooltip title="Ảnh hưởng cục bộ - SLA xử lý trong vòng 48 giờ">
            <Tag color="gold" className="font-semibold flex items-center gap-1 w-fit">
              <Clock size={12} />
              MEDIUM ({slaHours}h)
            </Tag>
          </Tooltip>
        )
      case "LOW":
        return (
          <Tooltip title="Làm rõ thông tin chung - SLA xử lý trong vòng 72 giờ">
            <Tag color="blue" className="w-fit">
              LOW ({slaHours}h)
            </Tag>
          </Tooltip>
        )
    }
  }

  const renderStatus = (status: RFIStatus, rfi: RFIItem) => {
    switch (status) {
      case "RESOLVED_REVISION":
        return (
          <div>
            <Tag color="success" className="font-medium">
              ĐÃ BAN HÀNH BẢN VẼ
            </Tag>
            {rfi.newRevisionCode && (
              <div className="font-mono text-xs font-bold text-primary mt-0.5">
                {rfi.newRevisionCode}
              </div>
            )}
          </div>
        )
      case "RESOLVED_CLARIFICATION":
        return (
          <Tag color="green" className="font-medium">
            ĐÃ GIẢI TRÌNH KỸ THUẬT
          </Tag>
        )
      case "CHANGE_REPORT_ISSUED":
        return (
          <div>
            <Tag color="purple" className="font-medium">
              ĐÃ LẬP FORM F08
            </Tag>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {rfi.linkedChangeReport?.reportNo}
            </div>
          </div>
        )
      case "WAITING_CONSULTANT":
        return (
          <Tag color="warning" className="font-medium">
            ĐANG LÀM VIỆC VỚI TVTK
          </Tag>
        )
      case "NEW":
        return <Tag color="error">MỚI TIẾP NHẬN</Tag>
    }
  }

  const columns = [
    {
      title: "Mã RFI",
      dataIndex: "rfiCode",
      key: "rfiCode",
      width: 150,
      render: (code: string) => (
        <span className="font-mono text-primary font-bold text-xs">{code}</span>
      ),
    },
    {
      title: "Vướng Mắc Hiện Trường / Vị Trí",
      dataIndex: "subject",
      key: "subject",
      render: (subj: string, record: RFIItem) => (
        <div className="space-y-0.5">
          <div
            className="font-medium text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => onViewRfi(record)}
          >
            {subj}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>Khu vực: <strong className="text-foreground">{record.zoneName}</strong></span>
            {record.affectedDrawingCode && (
              <>
                <span>•</span>
                <span>Bản vẽ: <span className="font-mono text-primary">{record.affectedDrawingCode}</span></span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Bộ Môn",
      dataIndex: "discipline",
      key: "discipline",
      width: 100,
      render: (disc: DisciplineType) => {
        const colors: Record<DisciplineType, string> = {
          STR: "cyan",
          MEP: "orange",
          ARC: "blue",
          INF: "purple",
          LND: "green",
          PLN: "magenta",
          INT: "gold",
        }
        return <Tag color={colors[disc] || "default"}>{disc}</Tag>
      },
    },
    {
      title: "Mức Độ & SLA",
      dataIndex: "priority",
      key: "priority",
      width: 140,
      render: (priority: RFIPriority, record: RFIItem) =>
        renderPriority(priority, record.slaHours),
    },
    {
      title: "Từ Công Trường (PCD)",
      dataIndex: "sentFrom",
      key: "sentFrom",
      width: 170,
      render: (sender: string, record: RFIItem) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{sender}</div>
          <div className="text-[11px] text-muted-foreground">{record.sentFromRole}</div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5 font-mono">{record.sentDate}</div>
        </div>
      ),
    },
    {
      title: "Hiện Trạng Xử Lý",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: RFIStatus, record: RFIItem) => renderStatus(status, record),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 110,
      render: (_: any, record: RFIItem) => (
        <Space size={2}>
          <Tooltip title="Xem chi tiết hồ sơ RFI">
            <Button
              size="small"
              type="text"
              icon={<Eye size={15} />}
              onClick={() => onViewRfi(record)}
            />
          </Tooltip>

          <Tooltip title="Xử lý giải pháp kỹ thuật">
            <Button
              size="small"
              type="text"
              icon={<Wrench size={15} className="text-primary" />}
              onClick={() => onResolveRfi(record)}
            />
          </Tooltip>

          {record.status !== "CHANGE_REPORT_ISSUED" && (
            <Tooltip title="Lập Báo cáo thay đổi Form F08">
              <Button
                size="small"
                type="text"
                icon={<FileCheck2 size={15} className="text-purple-600" />}
                onClick={() => onCreateChangeReport(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          pageSize: 5,
          size: "small",
          showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} yêu cầu RFI`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-3 bg-muted/20 border-y border-border text-xs space-y-2">
              <div>
                <span className="font-semibold text-muted-foreground uppercase">Mô tả hiện trường thi công:</span>
                <p className="text-foreground mt-0.5 mb-2">{record.siteIssueDescription}</p>
              </div>

              {record.dmdSolutionSummary && (
                <div className="bg-primary/5 p-2.5 rounded border border-primary/20">
                  <span className="font-semibold text-primary">Giải pháp kỹ thuật của DMD: </span>
                  <span className="text-foreground">{record.dmdSolutionSummary}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                <div>
                  Chuyên gia DMD phụ trách: <strong className="text-foreground">{record.assignedDmdPic}</strong> • Đơn vị TVTK: <strong className="text-foreground">{record.leadConsultant}</strong>
                </div>
                <div>
                  Hạn xử lý cam kết: <span className="font-semibold text-foreground">{record.deadlineDate}</span>
                </div>
              </div>
            </div>
          ),
        }}
        size="middle"
      />
    </div>
  )
}
