import React, { useState } from "react"
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Card,
  Tag,
  Divider,
  message,
} from "antd"
import { Users, Clock, Send, ShieldAlert, FileText } from "lucide-react"
import { CrossReviewTicket, ReviewDepartment } from "../types"

interface CreateTicketModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (newTicket: CrossReviewTicket) => void
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [selectedDept, setSelectedDept] = useState<ReviewDepartment>("PLP")

  // Chuẩn SLA theo SOP09
  const slaMap: Record<ReviewDepartment, { hours: number; name: string; desc: string }> = {
    PLP: { hours: 48, name: "Phòng Thủ tục Pháp lý", desc: "Rà soát ranh quy hoạch, chỉ tiêu, hành lang bảo vệ sông & điều kiện GPXD" },
    QSB: { hours: 72, name: "Phòng Khối lượng & Ngân sách", desc: "Lập khái toán chi phí hoặc đối chiếu bảng khối lượng BOQ (NVLG-QSB-SOP01)" },
    CQA: { hours: 72, name: "Phòng Thẩm định Chi phí - Chất lượng", desc: "Thẩm định độc lập Chi phí - Chất lượng (Value Engineering - VE)" },
    SAC: { hours: 48, name: "Ban Kinh doanh", desc: "Đánh giá công năng thương mại, mặt tiền shophouse & layout căn hộ" },
    INC: { hours: 48, name: "Ban Đầu tư", desc: "Đối chiếu suất đầu tư và chỉ tiêu hiệu quả tài chính dự án" },
    GMS: { hours: 72, name: "Phòng Tổ chức Điều hành Dự án", desc: "Kiểm tra tính tuân thủ quy trình kiểm soát thiết kế (NVLG-GMS.DMD-SOP02)" },
    PTC: { hours: 72, name: "Ban Cung ứng Đấu thầu", desc: "Đánh giá tính khả thi cung ứng vật tư & năng lực nhà thầu (SOP01)" },
  }

  const currentSla = slaMap[selectedDept] || { hours: 48, name: selectedDept, desc: "" }

  const handleFinish = (values: any) => {
    const now = new Date()
    const deadline = new Date(now.getTime() + currentSla.hours * 3600 * 1000)

    const newTicket: CrossReviewTicket = {
      id: `cr-${Date.now()}`,
      ticketNo: `CR-2026-${Date.now().toString().slice(-3)}`,
      title: values.title,
      projectCode: values.projectCode || "AQ",
      zoneCode: values.zoneCode || "PHX1",
      stageCode: values.stageCode || "G4",
      targetDept: selectedDept,
      targetDeptName: currentSla.name,
      packageCode: values.packageCode || "PKG-DMD-01",
      drawingCodeRef: values.drawingCodeRef,
      initiatorName: values.initiatorName || "KTS. Hoàng Minh Trí",
      initiatorRole: "Chuyên gia QLTK Chuyên môn",
      sentDate: now.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
      deadlineDate: deadline.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
      slaHoursTotal: currentSla.hours,
      slaHoursRemaining: currentSla.hours,
      slaSeverity: "NORMAL",
      status: "PROCESSING",
      purpose: values.purpose,
      feedbacks: [],
      createdAt: now.toLocaleDateString("vi-VN"),
      updatedAt: now.toLocaleDateString("vi-VN"),
    }

    onSuccess(newTicket)
    message.success(`Đã khởi tạo phiếu lấy ý kiến ${newTicket.ticketNo} chuyển ${currentSla.name} (SLA: ${currentSla.hours}h)`)
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Send size={18} className="text-primary" />
          <span>Tạo Phiếu Yêu Cầu Xin Ý Kiến Chuyên Môn (PYC theo SOP09)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Phát Hành Phiếu Lấy Ý Kiến"
      cancelText="Hủy Bỏ"
      width={680}
      destroyOnClose
    >
      <Card size="small" className="border-primary/40 bg-primary/5 my-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-muted-foreground">
              Phòng Ban Tiếp Nhận & Cam Kết Thời Hạn SLA:
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {currentSla.name}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {currentSla.desc}
            </div>
          </div>
          <Tag color="blue" className="font-mono text-sm font-bold px-3 py-1">
            SLA: {currentSla.hours} Giờ
          </Tag>
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          projectCode: "AQ",
          zoneCode: "PHX1",
          stageCode: "G4",
          packageCode: "PKG-ARC-01",
          initiatorName: "KTS. Hoàng Minh Trí",
          targetDept: "PLP",
        }}
      >
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="targetDept"
              label="Phòng Ban Cần Lấy Ý Kiến"
              rules={[{ required: true }]}
            >
              <Select
                value={selectedDept}
                onChange={(val) => setSelectedDept(val as ReviewDepartment)}
                options={[
                  { value: "PLP", label: "Phòng Thủ tục Pháp lý (PLP - 48h)" },
                  { value: "QSB", label: "Phòng Khối lượng & Ngân sách (QSB - 72h)" },
                  { value: "CQA", label: "Phòng Thẩm định Chi phí - Chất lượng (CQA - 72h)" },
                  { value: "SAC", label: "Ban Kinh doanh (SAC - 48h)" },
                  { value: "INC", label: "Ban Đầu tư (INC - 48h)" },
                  { value: "GMS", label: "Phòng Tổ chức Điều hành Dự án (GMS - 72h)" },
                  { value: "PTC", label: "Ban Cung ứng Đấu thầu (PTC - 72h)" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item name="stageCode" label="Giai Đoạn Thiết Kế (SOP09)">
              <Select
                options={[
                  { value: "G1", label: "G1. Ý tưởng Quy hoạch" },
                  { value: "G2", label: "G2. Quy hoạch 1/500" },
                  { value: "G3", label: "G3. Ý tưởng Công trình (TKYT)" },
                  { value: "G4", label: "G4. Thiết kế Cơ sở (TKCS)" },
                  { value: "G5", label: "G5. TKBVTC 2 bước" },
                  { value: "G6", label: "G6. Thiết kế Kỹ thuật (TKKT)" },
                  { value: "G7", label: "G7. TKBVTC 3 bước" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="Tiêu Đề / Hạng Mục Cần Lấy Ý Kiến"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề hạng mục" }]}
        >
          <Input placeholder="Ví dụ: Rà soát thỏa thuận quy hoạch & hành lang thoát lũ ven sông Zone 1" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="drawingCodeRef" label="Mã Bản Vẽ Tham Chiếu (nếu có)">
              <Input placeholder="Ví dụ: AQ-PHX1-ARC-DWG-001" className="font-mono" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="packageCode" label="Mã Gói Thầu">
              <Input placeholder="Ví dụ: PKG-ARC-01" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="purpose"
          label="Nội Dung Chi Tiết Cần Phòng Ban Phản Hồi / Đánh Giá"
          rules={[{ required: true, message: "Vui lòng nhập nội dung yêu cầu cụ thể" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nêu rõ các câu hỏi hoặc điểm kỹ thuật cần làm rõ (ví dụ: Xác nhận khoảng lùi xây dựng, kiểm tra định mức dự toán, đánh giá giải pháp móng thay thế...)"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
