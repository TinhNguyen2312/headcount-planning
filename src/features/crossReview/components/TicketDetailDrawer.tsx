import React, { useState } from "react"
import {
  Drawer,
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Divider,
  Input,
  Radio,
  message,
  Timeline,
} from "antd"
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Send,
  FileText,
  UserCheck,
  MessageSquare,
} from "lucide-react"
import { CrossReviewTicket, FeedbackRecord } from "../types"

const { Text, Paragraph } = Typography

interface TicketDetailDrawerProps {
  open: boolean
  onClose: () => void
  ticket: CrossReviewTicket | null
  onAddFeedback?: (ticketId: string, feedback: FeedbackRecord) => void
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  open,
  onClose,
  ticket,
  onAddFeedback,
}) => {
  const [newComment, setNewComment] = useState("")
  const [isAccepted, setIsAccepted] = useState(true)

  if (!ticket) return null

  const handleSendFeedback = () => {
    if (!newComment.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi")
      return
    }

    const fb: FeedbackRecord = {
      id: `fb-${Date.now()}`,
      respondentName: "Lê Văn Hùng",
      respondentTitle: "Chuyên viên Phụ trách",
      department: ticket.targetDept,
      responseDate: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
      isAccepted,
      commentSummary: newComment,
      attachedDocName: "BienBanGopY_ChuyenMon.pdf",
    }

    onAddFeedback?.(ticket.id, fb)
    message.success("Đã ghi nhận phản hồi chuyên môn thành công!")
    setNewComment("")
  }

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <span>Chi Tiết Phiếu Xin Ý Kiến Chuyên Môn</span>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-primary font-bold">
            {ticket.ticketNo}
          </span>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
    >
      {/* Overview Card */}
      <Card size="small" className="border-border bg-muted/20 mb-4">
        <div className="font-semibold text-sm text-foreground">
          {ticket.title}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Phòng nhận: <Tag color="blue">{ticket.targetDeptName}</Tag> • Giai đoạn:{" "}
          <strong className="text-foreground">{ticket.stageCode}</strong> • Gói thầu:{" "}
          <span className="font-medium text-foreground">{ticket.packageCode}</span>
        </div>

        <Divider className="my-2.5" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Người lập PYC:</span>{" "}
            <span className="font-medium text-foreground">{ticket.initiatorName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Bản vẽ tham chiếu:</span>{" "}
            <span className="font-mono text-primary font-medium">{ticket.drawingCodeRef || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Thời gian gửi:</span>{" "}
            <span className="font-medium text-foreground">{ticket.sentDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Hạn chót SLA:</span>{" "}
            <span className="font-semibold text-foreground">{ticket.deadlineDate}</span>
          </div>
        </div>
      </Card>

      {/* Mục đích / Yêu cầu cụ thể */}
      <div className="mb-5">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <FileText size={14} className="text-primary" />
          Nội Dung Yêu Cầu Cụ Thể Từ DMD:
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-xs text-foreground leading-relaxed">
          {ticket.purpose}
        </div>
      </div>

      {/* Lịch sử phản hồi từ phòng ban */}
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MessageSquare size={14} className="text-primary" />
            Văn Bản Phản Hồi Từ {ticket.targetDeptName} ({ticket.feedbacks.length})
          </span>
          {ticket.status === "COMPLETED" && (
            <Tag color="success" className="text-[10px]">
              ĐÃ HOÀN TẤT TRAO ĐỔI
            </Tag>
          )}
        </div>

        {ticket.feedbacks.length > 0 ? (
          <div className="space-y-3">
            {ticket.feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 rounded-lg border border-border bg-muted/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={15} className="text-primary" />
                    <span className="font-semibold text-foreground">
                      {fb.respondentName}
                    </span>
                    <span className="text-muted-foreground">({fb.respondentTitle})</span>
                  </div>
                  <Tag color={fb.isAccepted ? "success" : "warning"} className="text-[10px]">
                    {fb.isAccepted ? "Thống Nhất" : "Có Ý Kiến Sửa Đổi"}
                  </Tag>
                </div>

                <div className="text-foreground bg-card p-2.5 rounded border border-border/60">
                  {fb.commentSummary}
                </div>

                {fb.detailedNotes && (
                  <div className="text-muted-foreground text-[11px] pl-1">
                    Ghi chú chi tiết: {fb.detailedNotes}
                  </div>
                )}

                {fb.attachedDocName && (
                  <div className="flex items-center justify-between bg-muted/40 p-2 rounded text-[11px] border border-border">
                    <span className="font-mono text-primary truncate max-w-[320px]">
                      {fb.attachedDocName}
                    </span>
                    <Button
                      size="small"
                      type="text"
                      icon={<Download size={13} className="text-primary" />}
                    >
                      Tải văn bản
                    </Button>
                  </div>
                )}

                <div className="text-right text-[10px] text-muted-foreground">
                  Thời gian phản hồi: {fb.responseDate}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg text-xs text-muted-foreground">
            Chưa có phản hồi chính thức từ phòng ban chuyên môn.
          </div>
        )}
      </div>

      {/* Ghi nhận phản hồi mới */}
      <div className="border-t border-border pt-4">
        <div className="text-xs font-semibold text-foreground mb-2">
          Ghi Nhận Phản Hồi / Ý Kiến Bổ Sung:
        </div>

        <div className="space-y-3">
          <div>
            <Radio.Group
              value={isAccepted}
              onChange={(e) => setIsAccepted(e.target.value)}
              size="small"
            >
              <Radio value={true}>Thống nhất phương án (Đồng ý)</Radio>
              <Radio value={false}>Yêu cầu điều chỉnh hồ sơ thiết kế</Radio>
            </Radio.Group>
          </div>

          <Input.TextArea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Nhập nội dung kết luận hoặc ý kiến góp ý của phòng ban..."
          />

          <Button
            type="primary"
            icon={<Send size={14} />}
            onClick={handleSendFeedback}
            className="w-full"
          >
            Lưu Ý Kiến Góp Ý
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
