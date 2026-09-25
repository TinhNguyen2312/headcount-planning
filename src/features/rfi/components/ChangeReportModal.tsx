import React from "react"
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Radio,
  Typography,
  Card,
  Tag,
  Divider,
  message,
} from "antd"
import { FileCheck2, DollarSign, Calendar, ShieldCheck } from "lucide-react"
import { RFIItem, DesignChangeReport } from "../types"
import { DisciplineType } from "../../deliverables/types"

const { Title, Text } = Typography

interface ChangeReportModalProps {
  open: boolean
  onClose: () => void
  rfi: RFIItem | null
  onSuccess: (report: DesignChangeReport) => void
}

export const ChangeReportModal: React.FC<ChangeReportModalProps> = ({
  open,
  onClose,
  rfi,
  onSuccess,
}) => {
  const [form] = Form.useForm()

  const handleFinish = (values: any) => {
    const reportNo = `F08-2026-${values.projectCode || "AQ"}-${Date.now().toString().slice(-3)}`

    const newReport: DesignChangeReport = {
      id: `rep-${Date.now()}`,
      reportNo,
      formCode: values.formCode,
      formTitle:
        values.formCode === "NVLG-DMD-SOP09.F08"
          ? "Báo cáo thay đổi Thiết kế nội bộ"
          : "Báo cáo thay đổi Thiết kế ý tưởng",
      projectCode: values.projectCode || "AQ",
      zoneCode: values.zoneCode || "PHX1",
      relatedRfiCode: values.relatedRfiCode || (rfi ? rfi.rfiCode : ""),
      discipline: values.discipline || "STR",
      title: values.title,
      reasonDescription: values.reasonDescription,
      originalDesignSummary: values.originalDesignSummary,
      proposedDesignSummary: values.proposedDesignSummary,
      costVarianceEstimate: values.costVarianceEstimate || 0,
      costImpactType: values.costImpactType || "INCREASE",
      scheduleImpactDays: values.scheduleImpactDays || 0,
      dmdCreator: "KS. Vũ Đình Hùng (Chuyên gia DMD)",
      dmdManager: "ThS.KTS. Nguyễn Phùng Hoàng An (Phó GĐ Bộ phận TCTK)",
      pmdReviewer: "Đoàn Hải Hà (Giám đốc PMD)",
      bomApprover: "Dương Văn Bắc (Tổng Giám Đốc theo AM)",
      status: "SUBMITTED",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    }

    onSuccess(newReport)
    message.success(`Đã khởi tạo và trình duyệt ${newReport.formCode} (Số: ${reportNo})`)
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileCheck2 size={20} className="text-purple-600" />
          <span>Lập Báo Cáo Thay Đổi Thiết Kế (Chuẩn NVLG-DMD-SOP09.F08 / F02)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Trình Phê Duyệt Theo AM"
      cancelText="Hủy Bỏ"
      width={720}
      destroyOnClose
    >
      <Card size="small" className="border-purple-500/40 bg-purple-500/5 my-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-muted-foreground">
              Quy Trình Kiểm Soát Thay Đổi (Change Management):
            </div>
            <div className="text-xs text-foreground mt-0.5">
              Báo cáo bắt buộc khi có điều chỉnh thiết kế ảnh hưởng kết cấu, công năng hoặc làm biến động chi phí xây dựng.
            </div>
          </div>
          <Tag color="purple" className="font-mono text-xs font-bold">
            Theo SOP09 Bảng 12
          </Tag>
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          formCode: "NVLG-DMD-SOP09.F08",
          projectCode: rfi?.projectCode || "AQ",
          zoneCode: rfi?.zoneCode || "PHX1",
          relatedRfiCode: rfi?.rfiCode || "",
          discipline: rfi?.discipline || "STR",
          title: rfi ? `Xử lý thay đổi thiết kế theo ${rfi.rfiCode}: ${rfi.subject}` : "",
          costImpactType: "INCREASE",
          costVarianceEstimate: 45.0,
          scheduleImpactDays: 2,
        }}
      >
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="formCode"
              label="Loại Biểu Mẫu Thay Đổi"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  {
                    value: "NVLG-DMD-SOP09.F08",
                    label: "NVLG-DMD-SOP09.F08: Báo cáo thay đổi Thiết kế nội bộ (Thi công)",
                  },
                  {
                    value: "NVLG-DMD-SOP09.F02",
                    label: "NVLG-DMD-SOP09.F02: Báo cáo thay đổi Thiết kế ý tưởng",
                  },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item name="relatedRfiCode" label="Mã RFI Hiện Trường Liên Quan">
              <Input placeholder="RFI-PCD-PHX-012" className="font-mono" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="Tiêu Đề Báo Cáo Thay Đổi"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
        >
          <Input placeholder="Ví dụ: Bổ sung hệ dầm thép hình gia cường sàn tầng 3..." />
        </Form.Item>

        <Form.Item
          name="reasonDescription"
          label="Căn Cứ & Lý Do Đề Xuất Thay Đổi"
          rules={[{ required: true, message: "Vui lòng nhập căn cứ thay đổi" }]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Nêu rõ lý do (yêu cầu từ PCD, yêu cầu bán hàng của SAC, tối ưu chi phí CQA...)"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="originalDesignSummary"
              label="Giải Pháp Thiết Kế Ban Đầu (Trước Thay Đổi)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả kết cấu, vật liệu, kích thước ban đầu..." />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="proposedDesignSummary"
              label="Giải Pháp Đề Xuất Mới (Sau Thay Đổi)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả phương án kỹ thuật mới được TVTK đồng thuận..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" className="!text-xs !text-muted-foreground !my-2">
          Đánh Giá Tác Động Chi Phí & Tiến Độ (SOP09)
        </Divider>

        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="costImpactType" label="Chiều Biến Động Ngân Sách">
              <Select
                options={[
                  { value: "INCREASE", label: "Tăng chi phí xây dựng" },
                  { value: "DECREASE", label: "Tiết giảm chi phí (VE)" },
                  { value: "NO_IMPACT", label: "Không phát sinh chi phí" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="costVarianceEstimate" label="Giá Trị Dự Kiến (Triệu VNĐ)">
              <InputNumber min={0} step={1} className="w-full" prefix="₫" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="scheduleImpactDays" label="Tác Động Tiến Độ (Số ngày MTL)">
              <InputNumber min={0} max={60} className="w-full" suffix="ngày" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
