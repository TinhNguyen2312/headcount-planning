import React from "react"
import {
  Drawer,
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Divider,
  Descriptions,
} from "antd"
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck2,
  Building,
  UserCheck,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react"
import { RFIItem } from "../types"

const { Text, Paragraph } = Typography

interface RfiDetailDrawerProps {
  open: boolean
  onClose: () => void
  rfi: RFIItem | null
  onOpenResolve: (rfi: RFIItem) => void
  onOpenChangeReport: (rfi: RFIItem) => void
}

export const RfiDetailDrawer: React.FC<RfiDetailDrawerProps> = ({
  open,
  onClose,
  rfi,
  onOpenResolve,
  onOpenChangeReport,
}) => {
  if (!rfi) return null

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <span>Chi Tiết Yêu Cầu Làm Rõ (PCD RFI)</span>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-primary font-bold">
            {rfi.rfiCode}
          </span>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          <Button size="small" onClick={() => onOpenResolve(rfi)}>
            Xử Lý Giải Pháp
          </Button>
          <Button
            size="small"
            type="primary"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => onOpenChangeReport(rfi)}
          >
            Lập Form F08
          </Button>
        </Space>
      }
    >
      {/* Overview Card */}
      <Card size="small" className="border-border bg-muted/20 mb-4">
        <div className="flex items-center justify-between mb-1">
          <Space>
            <Tag color={rfi.priority === "HIGH" ? "red" : "gold"}>
              {rfi.priority} ({rfi.slaHours}h SLA)
            </Tag>
            <Tag color="blue">{rfi.discipline}</Tag>
            <Tag>{rfi.zoneName}</Tag>
          </Space>
          <span className="font-mono text-xs text-muted-foreground">{rfi.sentDate}</span>
        </div>

        <div className="font-semibold text-sm text-foreground mt-2">
          {rfi.subject}
        </div>

        <Divider className="my-2.5" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Người gửi từ công trường:</span>{" "}
            <div className="font-medium text-foreground mt-0.5">
              {rfi.sentFrom} ({rfi.sentFromRole})
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Bản vẽ bị ảnh hưởng:</span>{" "}
            <div className="font-mono text-primary font-medium mt-0.5">
              {rfi.affectedDrawingCode || "Chưa xác định"}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Chuyên gia DMD phụ trách:</span>{" "}
            <div className="font-medium text-foreground mt-0.5">{rfi.assignedDmdPic}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Đơn vị TVTK chịu trách nhiệm:</span>{" "}
            <div className="font-medium text-foreground mt-0.5">{rfi.leadConsultant}</div>
          </div>
        </div>
      </Card>

      {/* Mô tả vướng mắc tại công trường */}
      <div className="mb-5">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-red-500" />
          Vấn Đề Kỹ Thuật Hiện Trường Phản Ánh Từ PCD:
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-xs text-foreground leading-relaxed">
          {rfi.siteIssueDescription}
        </div>
      </div>

      {/* Giải pháp kỹ thuật của DMD */}
      {rfi.dmdSolutionSummary && (
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Phương Án Xử Lý Của Phòng Quản Lý Thiết Kế (DMD):
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs text-foreground leading-relaxed">
            {rfi.dmdSolutionSummary}
          </div>
          {rfi.newRevisionCode && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <span>Bản vẽ sửa đổi phát hành thi công:</span>
              <Tag color="success" className="font-mono font-bold">
                {rfi.newRevisionCode}
              </Tag>
            </div>
          )}
        </div>
      )}

      {/* Báo cáo thay đổi thiết kế Form F08 đính kèm */}
      {rfi.linkedChangeReport && (
        <div className="border border-purple-500/30 rounded-lg p-3 bg-purple-500/5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
              <FileCheck2 size={15} />
              Đã Lập {rfi.linkedChangeReport.formTitle} ({rfi.linkedChangeReport.formCode})
            </span>
            <Tag color="purple" className="font-mono text-xs">
              {rfi.linkedChangeReport.reportNo}
            </Tag>
          </div>

          <div className="text-xs font-medium text-foreground mb-2">
            {rfi.linkedChangeReport.title}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-card p-2.5 rounded border border-border">
            <div>
              <span className="text-muted-foreground">Tác động ngân sách:</span>{" "}
              <strong className="text-red-500">
                +{rfi.linkedChangeReport.costVarianceEstimate} triệu VNĐ
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Ảnh hưởng tiến độ MTL:</span>{" "}
              <strong className="text-foreground">
                +{rfi.linkedChangeReport.scheduleImpactDays} ngày
              </strong>
            </div>
            <div className="col-span-2 text-muted-foreground">
              Phê duyệt AM: <strong className="text-foreground">{rfi.linkedChangeReport.bomApprover}</strong> (Đã ký duyệt)
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
