import React, { useState } from "react"
import {
  Modal,
  Card,
  Row,
  Col,
  Slider,
  Input,
  Tag,
  Typography,
  Button,
  message,
} from "antd"
import { Award, CheckCircle2 } from "lucide-react"
import { ConsultantContract, ConsultantEvaluation } from "../types"

interface ConsultantEvalModalProps {
  open: boolean
  onClose: () => void
  contract: ConsultantContract | null
  onSuccess: (contractId: string, evaluation: ConsultantEvaluation) => void
}

export const ConsultantEvalModal: React.FC<ConsultantEvalModalProps> = ({
  open,
  onClose,
  contract,
  onSuccess,
}) => {
  const [quality, setQuality] = useState(9)
  const [timeline, setTimeline] = useState(9)
  const [coop, setCoop] = useState(9)
  const [bim, setBim] = useState(9)
  const [notes, setNotes] = useState(
    "Đơn vị tư vấn phối hợp chuyên nghiệp, hồ sơ bản vẽ rõ ràng và xử lý RFI đúng tiến độ."
  )

  if (!contract) return null

  const average = Number(((quality + timeline + coop + bim) / 4).toFixed(1))
  const ratingLevel =
    average >= 9.0 ? "EXCELLENT" : average >= 8.0 ? "GOOD" : average >= 7.0 ? "AVERAGE" : "POOR"

  const handleSave = () => {
    const newEval: ConsultantEvaluation = {
      id: `eval-${Date.now()}`,
      evalYearQuarter: "Q3/2026",
      qualityScore: quality,
      timelineScore: timeline,
      cooperationScore: coop,
      bimComplianceScore: bim,
      averageScore: average,
      ratingLevel,
      evalNotes: notes,
      evaluatedBy: contract.dmdPic,
      evaluationDate: new Date().toLocaleDateString("vi-VN"),
    }

    onSuccess(contract.id, newEval)
    message.success(`Đã lưu kết quả đánh giá năng lực cho ${contract.consultantName}`)
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Award size={20} className="text-amber-500" />
          <span>Đánh Giá Năng Lực Đối Tác Tư Vấn (Biểu mẫu NVLG-BMD-SOP01.F1.24a)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Lưu Đánh Giá Năng Lực"
      cancelText="Hủy Bỏ"
      width={640}
      destroyOnClose
    >
      <Card size="small" className="border-border bg-muted/20 my-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-foreground">
            {contract.consultantName}
          </span>
          <Tag color="blue">{contract.consultantRole}</Tag>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Gói thầu: {contract.contractTitle}
        </div>
      </Card>

      <div className="space-y-4">
        {/* Điểm tổng kết */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Xếp Hạng Năng Lực Tổng Hợp:
            </div>
            <div className="text-lg font-bold text-primary mt-0.5">
              Hạng {ratingLevel === "EXCELLENT" ? "A (Xuất Sắc)" : ratingLevel === "GOOD" ? "B (Tốt)" : "C (Đạt)"}
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-foreground">
            {average} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
          </div>
        </div>

        {/* 4 Tiêu chí đánh giá */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
              <span>1. Chất lượng hồ sơ & bản vẽ thiết kế (SPEC01-SPEC09):</span>
              <span className="text-primary font-mono">{quality} / 10</span>
            </div>
            <Slider min={1} max={10} step={0.5} value={quality} onChange={setQuality} />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
              <span>2. Tuân thủ tiến độ cam kết theo Master Timeline (MTL):</span>
              <span className="text-primary font-mono">{timeline} / 10</span>
            </div>
            <Slider min={1} max={10} step={0.5} value={timeline} onChange={setTimeline} />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
              <span>3. Mức độ hợp tác & tốc độ xử lý RFI hiện trường:</span>
              <span className="text-primary font-mono">{coop} / 10</span>
            </div>
            <Slider min={1} max={10} step={0.5} value={coop} onChange={setCoop} />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
              <span>4. Tuân thủ chuẩn mực số hóa BIM / CAD / Novagen:</span>
              <span className="text-primary font-mono">{bim} / 10</span>
            </div>
            <Slider min={1} max={10} step={0.5} value={bim} onChange={setBim} />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Nhận Xét Chi Tiết Của Chuyên Gia DMD:
          </div>
          <Input.TextArea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập nhận xét cụ thể về năng lực..."
          />
        </div>
      </div>
    </Modal>
  )
}
