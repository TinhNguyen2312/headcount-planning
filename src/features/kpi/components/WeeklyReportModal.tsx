import React, { useState } from "react"
import {
  Modal,
  Card,
  Row,
  Col,
  Input,
  Typography,
  Tag,
  Button,
  Divider,
  message,
} from "antd"
import { FileText, Send, CheckCircle2, AlertTriangle, Calendar } from "lucide-react"
import { WeeklyReportData } from "../types"

interface WeeklyReportModalProps {
  open: boolean
  onClose: () => void
  report: WeeklyReportData
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  open,
  onClose,
  report,
}) => {
  const [reportData, setReportData] = useState<WeeklyReportData>(report)

  const handleExport = () => {
    message.success("Đã xuất báo cáo tuần gửi GMD thành công (Định dạng PDF/Docx)!")
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-emerald-600" />
          <span>Báo Cáo Tổng Hợp Tuần Gửi GMD (Quy Định RACI 3.3.6)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<Send size={14} />}
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Phát Hành Báo Cáo Cho GMD
        </Button>,
      ]}
      width={780}
      destroyOnClose
    >
      <Card size="small" className="border-emerald-500/30 bg-emerald-500/5 my-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-muted-foreground">
              Chu Kỳ Báo Cáo:
            </div>
            <div className="font-bold text-sm text-foreground mt-0.5">
              {reportData.reportWeek} • Dự án: {reportData.projectCode}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground">Tiến độ thiết kế lũy kế:</span>
            <div className="font-mono text-base font-bold text-primary">
              {reportData.overallProgressRate}% MTL
            </div>
          </div>
        </div>

        <Divider className="my-2" />

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            Người lập: <strong className="text-foreground">{reportData.author}</strong>
          </div>
          <div>
            Kiểm soát: <strong className="text-foreground">{reportData.reviewer}</strong>
          </div>
        </div>
      </Card>

      <div className="space-y-4 text-xs">
        {/* Mục 1: Đánh giá hoàn thành trong tuần */}
        <div>
          <div className="font-semibold text-foreground uppercase mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            1. Đánh Giá Công Việc Hoàn Thành Trong Tuần Theo Kế Hoạch (AOP/MTL):
          </div>
          <Input.TextArea
            rows={3}
            value={reportData.completedSummary}
            onChange={(e) =>
              setReportData({ ...reportData, completedSummary: e.target.value })
            }
            className="text-xs"
          />
        </div>

        {/* Mục 2: Vấn đề tồn đọng tiến độ & đề xuất xử lý */}
        <div>
          <div className="font-semibold text-foreground uppercase mb-1.5 flex items-center gap-1.5 text-amber-600">
            <AlertTriangle size={15} />
            2. Các Vấn Đề Tồn Đọng Về Tiến Độ, Chất Lượng & Đề Xuất Phương Án Xử Lý:
          </div>
          <Input.TextArea
            rows={3}
            value={reportData.riskAndBlockers}
            onChange={(e) =>
              setReportData({ ...reportData, riskAndBlockers: e.target.value })
            }
            className="text-xs"
          />
        </div>

        {/* Mục 3: Kế hoạch công việc tuần tiếp theo */}
        <div>
          <div className="font-semibold text-foreground uppercase mb-1.5 flex items-center gap-1.5 text-primary">
            <Calendar size={15} />
            3. Kế Hoạch Công Việc Trọng Tâm Cho Tuần Tiếp Theo:
          </div>
          <Input.TextArea
            rows={3}
            value={reportData.nextWeekActionPlan}
            onChange={(e) =>
              setReportData({ ...reportData, nextWeekActionPlan: e.target.value })
            }
            className="text-xs"
          />
        </div>
      </div>
    </Modal>
  )
}
