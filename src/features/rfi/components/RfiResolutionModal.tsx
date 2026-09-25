import React, { useState } from "react"
import {
  Modal,
  Form,
  Input,
  Radio,
  Row,
  Col,
  Card,
  Tag,
  Typography,
  message,
} from "antd"
import { Wrench, CheckCircle2, RotateCcw, FileCheck2 } from "lucide-react"
import { RFIItem, RFIStatus } from "../types"

interface RfiResolutionModalProps {
  open: boolean
  onClose: () => void
  rfi: RFIItem | null
  onSuccess: (rfiId: string, status: RFIStatus, solution: string, newRevCode?: string) => void
  onOpenChangeReport: (rfi: RFIItem) => void
}

export const RfiResolutionModal: React.FC<RfiResolutionModalProps> = ({
  open,
  onClose,
  rfi,
  onSuccess,
  onOpenChangeReport,
}) => {
  const [form] = Form.useForm()
  const [resolutionType, setResolutionType] = useState<string>("REVISION")

  if (!rfi) return null

  const handleFinish = (values: any) => {
    if (resolutionType === "CHANGE_REPORT") {
      onClose()
      onOpenChangeReport(rfi)
      return
    }

    const newStatus: RFIStatus =
      resolutionType === "REVISION"
        ? "RESOLVED_REVISION"
        : "RESOLVED_CLARIFICATION"

    onSuccess(rfi.id, newStatus, values.solutionSummary, values.newRevisionCode)
    message.success(`Đã cập nhật phương án xử lý cho ${rfi.rfiCode}`)
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Wrench size={18} className="text-primary" />
          <span>Xử Lý Phương Án Kỹ Thuật Cho RFI Hiện Trường</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={resolutionType === "CHANGE_REPORT" ? "Chuyển Sang Lập Form F08" : "Ban Hành Giải Pháp Cho PCD"}
      cancelText="Hủy Bỏ"
      width={650}
      destroyOnClose
    >
      <Card size="small" className="border-border bg-muted/20 my-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-primary">
            {rfi.rfiCode}
          </span>
          <Tag color={rfi.priority === "HIGH" ? "red" : "gold"}>
            {rfi.priority} ({rfi.slaHours}h)
          </Tag>
        </div>
        <div className="font-semibold text-xs text-foreground mt-1">
          {rfi.subject}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          Gửi từ: <strong className="text-foreground">{rfi.sentFrom}</strong> ({rfi.sentFromRole}) • Khu vực: {rfi.zoneName}
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          resolutionType: "REVISION",
          newRevisionCode: "Rev 01A",
          consultantAffirmation: "Tư vấn thiết kế đã thống nhất phương án xử lý",
        }}
      >
        <Form.Item label="Hướng Xử Lý Kỹ Thuật" required>
          <Radio.Group
            value={resolutionType}
            onChange={(e) => setResolutionType(e.target.value)}
            className="w-full space-y-2"
          >
            <Radio value="REVISION" className="text-xs">
              <span className="font-semibold text-foreground">1. Ban hành Bản vẽ Sửa đổi Cục bộ (Minor Revision)</span>
              <div className="text-[11px] text-muted-foreground pl-6">
                Áp dụng khi điều chỉnh tuyến ống, dầm phụ, kích thước lỗ mở mà không làm thay đổi kết cấu chịu lực chính hay vượt ngân sách.
              </div>
            </Radio>

            <Radio value="CLARIFICATION" className="text-xs">
              <span className="font-semibold text-foreground">2. Phát hành Văn bản Giải trình Kỹ thuật (Technical Clarification)</span>
              <div className="text-[11px] text-muted-foreground pl-6">
                Áp dụng khi bản vẽ đã đủ điều kiện, chỉ cần làm rõ chỉ dẫn kỹ thuật SPEC hoặc hướng dẫn biện pháp thi công.
              </div>
            </Radio>

            <Radio value="CHANGE_REPORT" className="text-xs">
              <span className="font-semibold text-purple-600">3. Lập Báo cáo Thay đổi Thiết kế nội bộ (Form F08 - Major Change)</span>
              <div className="text-[11px] text-muted-foreground pl-6">
                Bắt buộc áp dụng khi thay đổi kết cấu chịu lực, công năng hoặc làm tăng chi phí xây dựng cần BOM phê duyệt theo AM.
              </div>
            </Radio>
          </Radio.Group>
        </Form.Item>

        {resolutionType === "REVISION" && (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="newRevisionCode"
                label="Mã Phiên Bản Bản Vẽ Mới"
                rules={[{ required: true }]}
              >
                <Input placeholder="Rev 01A, Rev 01B..." className="font-mono font-bold" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="consultantAffirmation" label="Xác Nhận Từ Đơn Vị TVTK">
                <Input placeholder="Ý kiến chấp thuận của TVTK" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item
          name="solutionSummary"
          label="Nội Dung Giải Pháp Kỹ Thuật Chi Tiết Của DMD"
          rules={[{ required: true, message: "Vui lòng nhập nội dung giải pháp kỹ thuật" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nêu rõ phương án xử lý giao cắt, gia cường cốt thép, thay thế vật tư tương đương hoặc điều chỉnh độ dốc..."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
