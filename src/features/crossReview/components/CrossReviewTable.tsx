import React from "react"
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  Badge,
  message,
} from "antd"
import {
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  FileText,
  UserCheck,
  Send,
  Building,
} from "lucide-react"
import { CrossReviewTicket, ReviewDepartment, TicketStatus } from "../types"

const { Paragraph, Text } = Typography

interface CrossReviewTableProps {
  data: CrossReviewTicket[]
  onViewTicket: (ticket: CrossReviewTicket) => void
  onSendReminder: (ticket: CrossReviewTicket) => void
}

export const CrossReviewTable: React.FC<CrossReviewTableProps> = ({
  data,
  onViewTicket,
  onSendReminder,
}) => {
  // Bộ màu cho từng phòng ban
  const getDeptTag = (dept: ReviewDepartment, deptName: string) => {
    const map: Record<ReviewDepartment, { color: string; label: string; sla: string }> = {
      PLP: { color: "blue", label: "Pháp Lý (PLP)", sla: "48h" },
      QSB: { color: "cyan", label: "Ngân Sách (QSB)", sla: "72h" },
      CQA: { color: "orange", label: "Thẩm Định (CQA)", sla: "72h" },
      SAC: { color: "green", label: "Kinh Doanh (SAC)", sla: "48h" },
      INC: { color: "purple", label: "Đầu Tư (INC)", sla: "48h" },
      GMS: { color: "magenta", label: "Điều Hành (GMS)", sla: "72h" },
      PTC: { color: "volcano", label: "Cung Ứng (PTC)", sla: "72h" },
    }

    const conf = map[dept] || { color: "default", label: dept, sla: "48h" }
    return (
      <Tooltip title={`${deptName} - Cam kết SLA theo SOP09: ${conf.sla}`}>
        <Tag color={conf.color} className="font-semibold text-xs py-0.5">
          {conf.label} ({conf.sla})
        </Tag>
      </Tooltip>
    )
  }

  // Render trạng thái SLA
  const renderSLA = (ticket: CrossReviewTicket) => {
    if (ticket.status === "COMPLETED") {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
          <CheckCircle2 size={14} />
          <span>Đã phản hồi đúng hạn</span>
        </div>
      )
    }

    if (ticket.slaSeverity === "OVERDUE" || ticket.status === "OVERDUE") {
      return (
        <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold animate-pulse">
          <AlertTriangle size={14} />
          <span>Quá hạn: {Math.abs(ticket.slaHoursRemaining)}h (Escalate)</span>
        </div>
      )
    }

    if (ticket.slaSeverity === "WARNING") {
      return (
        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
          <Clock size={14} />
          <span>Sắp đến hạn: còn {ticket.slaHoursRemaining}h</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <Clock size={14} className="text-primary" />
        <span>Còn lại: {ticket.slaHoursRemaining}h</span>
      </div>
    )
  }

  const columns = [
    {
      title: "Mã Phiếu",
      dataIndex: "ticketNo",
      key: "ticketNo",
      width: 130,
      render: (no: string) => (
        <span className="font-mono text-primary font-bold text-xs">{no}</span>
      ),
    },
    {
      title: "Hạng Mục Lấy Ý Kiến",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: CrossReviewTicket) => (
        <div className="space-y-0.5">
          <div
            className="font-medium text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => onViewTicket(record)}
          >
            {title}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>Giai đoạn: <strong className="text-foreground">{record.stageCode}</strong></span>
            <span>•</span>
            <span>Gói thầu: {record.packageCode}</span>
            {record.drawingCodeRef && (
              <>
                <span>•</span>
                <span className="font-mono text-primary">{record.drawingCodeRef}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phòng Ban Tiếp Nhận",
      dataIndex: "targetDept",
      key: "targetDept",
      width: 170,
      render: (dept: ReviewDepartment, record: CrossReviewTicket) =>
        getDeptTag(dept, record.targetDeptName),
    },
    {
      title: "Thời Hạn & SLA",
      key: "sla",
      width: 180,
      render: (_: any, record: CrossReviewTicket) => (
        <div>
          {renderSLA(record)}
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Hạn chót: {record.deadlineDate}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: TicketStatus) => {
        switch (status) {
          case "COMPLETED":
            return <Tag color="success">Đã phản hồi</Tag>
          case "PROCESSING":
            return <Tag color="processing">Đang thụ lý</Tag>
          case "OVERDUE":
            return <Tag color="error">Quá hạn SLA</Tag>
          default:
            return <Tag>{status}</Tag>
        }
      },
    },
    {
      title: "Kết Quả / Góp Ý Chuyên Môn",
      key: "feedback",
      render: (_: any, record: CrossReviewTicket) => {
        if (record.feedbacks.length === 0) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Đang chờ phản hồi từ chuyên viên phụ trách...
            </span>
          )
        }

        const latestFb = record.feedbacks[0]
        return (
          <div className="text-xs">
            <Paragraph ellipsis={{ rows: 2 }} className="!mb-0 text-foreground">
              {latestFb.commentSummary}
            </Paragraph>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Phản hồi bởi: <strong className="text-foreground">{latestFb.respondentName}</strong> ({latestFb.responseDate})
            </div>
          </div>
        )
      },
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 110,
      render: (_: any, record: CrossReviewTicket) => (
        <Space size={2}>
          <Tooltip title="Xem chi tiết trao đổi & văn bản">
            <Button
              size="small"
              type="text"
              icon={<Eye size={15} />}
              onClick={() => onViewTicket(record)}
            />
          </Tooltip>

          {record.status !== "COMPLETED" && (
            <Tooltip title="Gửi nhắc nhở tiến độ / Escalate">
              <Button
                size="small"
                type="text"
                icon={<BellRing size={15} className="text-amber-500" />}
                onClick={() => onSendReminder(record)}
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
          pageSize: 6,
          size: "small",
          showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} phiếu PYC`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-3 bg-muted/20 border-y border-border text-xs space-y-2">
              <div>
                <span className="font-semibold text-muted-foreground uppercase">Mục đích yêu cầu:</span>
                <p className="text-foreground mt-0.5 mb-1">{record.purpose}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                <div>
                  Người lập PYC: <strong className="text-foreground">{record.initiatorName}</strong> ({record.initiatorRole})
                </div>
                <div>
                  Thời gian gửi: <span className="font-mono text-foreground">{record.sentDate}</span>
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
