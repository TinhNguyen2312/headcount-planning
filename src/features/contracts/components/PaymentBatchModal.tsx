import React, { useState } from "react"
import {
  Modal,
  Card,
  Row,
  Col,
  Checkbox,
  Input,
  Tag,
  Typography,
  Button,
  Select,
  message,
  Divider,
} from "antd"
import { DollarSign, FileCheck2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { ConsultantContract, PaymentMilestone } from "../types"

interface PaymentBatchModalProps {
  open: boolean
  onClose: () => void
  contract: ConsultantContract | null
  onConfirmPayment: (contractId: string, milestoneId: string, invoiceNo: string) => void
}

export const PaymentBatchModal: React.FC<PaymentBatchModalProps> = ({
  open,
  onClose,
  contract,
  onConfirmPayment,
}) => {
  if (!contract) return null

  // Tìm các đợt chưa thanh toán
  const pendingMilestones = contract.milestones.filter((m) => m.status !== "PAID")
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    pendingMilestones[0]?.id || contract.milestones[0]?.id || ""
  )
  const [invoiceNo, setInvoiceNo] = useState("")

  const [check1, setCheck1] = useState(true)
  const [check2, setCheck2] = useState(true)
  const [check3, setCheck3] = useState(true)
  const [check4, setCheck4] = useState(true)

  const activeMilestone = contract.milestones.find((m) => m.id === selectedMilestoneId)

  const handleConfirm = () => {
    if (!activeMilestone) return

    if (!check1 || !check2 || !check3 || !check4) {
      message.error("Vui lòng xác nhận đủ 4 điều kiện hồ sơ theo quy định RACI 2.5.1")
      return
    }

    onConfirmPayment(contract.id, activeMilestone.id, invoiceNo || "INV-DMD-APPROVED")
    message.success(
      `Đã xác nhận thanh toán Đợt ${activeMilestone.milestoneNo} (${activeMilestone.amountVnd.toLocaleString("vi-VN")} tr) cho ${contract.consultantName}`
    )
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-600" />
          <span>Kiểm Tra & Xác Nhận Hồ Sơ Thanh Toán Đợt (RACI 2.5.1 / 2.5.2)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Xác Nhận Đủ Điều Kiện Thanh Toán"
      cancelText="Hủy Bỏ"
      width={680}
      destroyOnClose
    >
      <Card size="small" className="border-border bg-muted/20 my-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-primary">
            {contract.contractNo}
          </span>
          <Tag color="blue">{contract.consultantName}</Tag>
        </div>
        <div className="font-semibold text-xs text-foreground mt-1">
          {contract.contractTitle}
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Chọn Đợt Thanh Toán Cần Xác Nhận:
          </div>
          <Select
            value={selectedMilestoneId}
            onChange={setSelectedMilestoneId}
            className="w-full"
            options={contract.milestones.map((m) => ({
              value: m.id,
              label: `${m.milestoneName} - ${m.amountVnd.toLocaleString("vi-VN")} tr (${m.status === "PAID" ? "Đã thanh toán" : "Chờ xác nhận"})`,
            }))}
          />
        </div>

        {activeMilestone && (
          <div className="p-3 bg-muted/10 rounded-lg border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">
                Giá trị giải ngân đợt này:
              </span>
              <span className="font-mono text-base font-bold text-emerald-600">
                {activeMilestone.amountVnd.toLocaleString("vi-VN")} triệu VNĐ ({activeMilestone.percentage}%)
              </span>
            </div>
            <div className="text-muted-foreground">
              Tiêu chí nghiệm thu hợp đồng: <strong className="text-foreground">{activeMilestone.deliverableCriteria}</strong>
            </div>
          </div>
        )}

        {/* 4 Điều kiện kiểm tra hồ sơ thanh toán RACI 2.5.1 */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-600" />
            Kiểm tra 4 thành phần hồ sơ bắt buộc theo RACI 2.5.1:
          </div>

          <div className="space-y-2 border border-border rounded-lg p-3 bg-card text-xs">
            <Checkbox checked={check1} onChange={(e) => setCheck1(e.target.checked)}>
              <span className="font-medium text-foreground">1. Sản phẩm bản vẽ & hồ sơ thiết kế đã hoàn thành đủ số lượng theo hợp đồng</span>
            </Checkbox>
            <Checkbox checked={check2} onChange={(e) => setCheck2(e.target.checked)}>
              <span className="font-medium text-foreground">2. Có Biên bản nghiệm thu thiết kế đạt yêu cầu (Biểu mẫu NVLG-DMD-SOP09.F11)</span>
            </Checkbox>
            <Checkbox checked={check3} onChange={(e) => setCheck3(e.target.checked)}>
              <span className="font-medium text-foreground">3. Có Báo cáo thẩm tra độc lập từ TVTT (hoặc thẩm định CQA nếu là TKCS)</span>
            </Checkbox>
            <Checkbox checked={check4} onChange={(e) => setCheck4(e.target.checked)}>
              <span className="font-medium text-foreground">4. Có Giấy đề nghị thanh toán và Hóa đơn tài chính hợp lệ từ Đơn vị tư vấn</span>
            </Checkbox>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Số Hóa Đơn VAT / Giấy Đề Nghị Thanh Toán:
          </div>
          <Input
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="Ví dụ: INV-AEDAS-2026-088"
            className="font-mono"
          />
        </div>
      </div>
    </Modal>
  )
}
