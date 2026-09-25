import React from "react"
import {
  Drawer,
  Timeline,
  Tag,
  Typography,
  Space,
  Button,
  Card,
  Badge,
  Descriptions,
  Divider,
  Tooltip,
} from "antd"
import {
  History,
  FileText,
  Download,
  Stamp,
  UserCheck,
  Calendar,
  AlertCircle,
  FileCode,
  ExternalLink,
  PlusCircle,
} from "lucide-react"
import { DeliverableItem, DrawingRevision } from "../types"

const { Title, Text, Paragraph } = Typography

interface RevisionHistoryDrawerProps {
  open: boolean
  onClose: () => void
  deliverable: DeliverableItem | null
  onAddNewRevision?: (deliverableId: string) => void
}

export const RevisionHistoryDrawer: React.FC<RevisionHistoryDrawerProps> = ({
  open,
  onClose,
  deliverable,
  onAddNewRevision,
}) => {
  if (!deliverable) return null

  // Sắp xếp revision mới nhất lên đầu
  const sortedRevisions = [...deliverable.revisions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  )

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-primary" />
            <span>Lịch Sử Phiên Bản (Revision Control)</span>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-primary font-bold">
            {deliverable.drawingCode}
          </span>
        </div>
      }
      placement="right"
      width={620}
      open={open}
      onClose={onClose}
      className="revision-drawer"
      extra={
        <Button
          type="primary"
          size="small"
          icon={<PlusCircle size={14} />}
          onClick={() => onAddNewRevision?.(deliverable.id)}
        >
          Ban Hành Rev Mới
        </Button>
      }
    >
      {/* Overview Card */}
      <Card size="small" className="border-border bg-muted/20 mb-5">
        <div className="font-semibold text-sm text-foreground">
          {deliverable.drawingName}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Bộ môn: <Tag color="blue">{deliverable.discipline}</Tag> • Gói thầu:{" "}
          <strong className="text-foreground">{deliverable.packageCode}</strong> • Giai đoạn:{" "}
          <span className="font-medium text-foreground">{deliverable.stageName}</span>
        </div>

        <Divider className="my-2.5" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Đơn vị TVTK:</span>{" "}
            <span className="font-medium text-foreground">{deliverable.leadConsultant}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Đơn vị TVTT:</span>{" "}
            <span className="font-medium text-foreground">{deliverable.verifierConsultant || "Chưa chỉ định"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Chuyên gia DMD:</span>{" "}
            <span className="font-medium text-foreground">{deliverable.dmdPic}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Lãnh đạo kiểm soát:</span>{" "}
            <span className="font-medium text-foreground">{deliverable.dmdManager}</span>
          </div>
        </div>
      </Card>

      {/* Visual Timeline of Revisions */}
      <div className="px-2">
        <div className="flex items-center justify-between mb-4">
          <Text strong className="text-xs uppercase tracking-wider text-muted-foreground">
            Dòng thời gian các phiên bản ({sortedRevisions.length} bản ghi)
          </Text>
          <span className="text-xs text-muted-foreground">
            Quy chuẩn <span className="font-semibold text-foreground">NVLG-DMD-REG01</span>
          </span>
        </div>

        <Timeline
          items={sortedRevisions.map((rev) => {
            const isAfc = rev.isAFC
            const isCurrent = rev.isCurrent

            return {
              color: isAfc ? "green" : isCurrent ? "blue" : "gray",
              children: (
                <div
                  className={`p-3.5 rounded-lg border transition-all mb-4 ${
                    isCurrent
                      ? "border-primary/40 bg-primary/5 shadow-xs"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Revision Header */}
                  <div className="flex items-center justify-between mb-2">
                    <Space size="small">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {rev.revisionCode}
                      </span>
                      {isCurrent && (
                        <Tag color="processing" className="text-[10px] leading-tight px-1.5 py-0.5">
                          HIỆN HÀNH
                        </Tag>
                      )}
                      {isAfc && (
                        <Tag color="success" className="text-[10px] font-semibold leading-tight px-1.5 py-0.5">
                          ĐÃ ĐÓNG DẤU AFC
                        </Tag>
                      )}
                    </Space>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={13} />
                      {rev.releaseDate}
                    </span>
                  </div>

                  {/* Change Reason */}
                  {rev.changeReason && (
                    <div className="text-xs text-foreground bg-muted/50 p-2.5 rounded mb-2.5">
                      <span className="font-semibold text-primary">Nội dung thay đổi: </span>
                      {rev.changeReason}
                    </div>
                  )}

                  {/* Linked RFI or Attached Forms */}
                  {(rev.attachedForm || rev.rfiRefCode) && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {rev.attachedForm && (
                        <Tag color="cyan" className="text-[11px]">
                          Biểu mẫu: {rev.attachedForm}
                        </Tag>
                      )}
                      {rev.rfiRefCode && (
                        <Tag color="error" className="text-[11px] font-mono">
                          Xử lý RFI: {rev.rfiRefCode}
                        </Tag>
                      )}
                    </div>
                  )}

                  {/* Authorship & Approval Hierarchy */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground border-t border-border pt-2 mt-2">
                    <div>
                      <span>Biên soạn: </span>
                      <strong className="text-foreground">{rev.author}</strong>
                    </div>
                    <div>
                      <span>Kiểm soát: </span>
                      <strong className="text-foreground">{rev.reviewer}</strong>
                    </div>
                    {rev.approver && (
                      <div className="col-span-2 text-emerald-600 font-medium">
                        <span>Phê duyệt AM: </span>
                        <strong>{rev.approver}</strong>
                      </div>
                    )}
                  </div>

                  {/* File Download Action */}
                  <div className="flex items-center justify-between bg-muted/30 px-2.5 py-1.5 rounded mt-2.5 border border-border">
                    <Space size={6}>
                      <FileCode size={14} className="text-primary" />
                      <span className="text-xs font-mono font-medium truncate max-w-[280px]">
                        {rev.fileName}
                      </span>
                      <Tag className="text-[10px] uppercase font-mono">{rev.fileFormat}</Tag>
                      <span className="text-[11px] text-muted-foreground">({rev.fileSize})</span>
                    </Space>
                    <Tooltip title="Tải xuống tệp tin đính kèm">
                      <Button
                        size="small"
                        type="text"
                        icon={<Download size={14} className="text-primary" />}
                        className="hover:bg-primary/10"
                      />
                    </Tooltip>
                  </div>
                </div>
              ),
            }
          })}
        />
      </div>
    </Drawer>
  )
}
