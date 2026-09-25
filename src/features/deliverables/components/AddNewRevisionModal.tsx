import React from "react"
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
  message,
} from "antd"
import { RotateCcw, AlertTriangle, FileCode, CheckCircle } from "lucide-react"
import { DeliverableItem, DrawingRevision } from "../types"

interface AddNewRevisionModalProps {
  open: boolean
  onClose: () => void
  deliverable: DeliverableItem | null
  onSuccess: (deliverableId: string, newRevision: DrawingRevision) => void
}

export const AddNewRevisionModal: React.FC<AddNewRevisionModalProps> = ({
  open,
  onClose,
  deliverable,
  onSuccess,
}) => {
  const [form] = Form.useForm()

  if (!deliverable) return null

  // Gợi ý mã revision tiếp theo
  const currentRev = deliverable.currentRevision
  let suggestedRev = "Rev 1"
  if (currentRev.includes("AFC")) {
    suggestedRev = "Rev 01A"
  } else if (currentRev === "Rev 0") {
    suggestedRev = "Rev 1"
  } else if (currentRev === "Rev 1") {
    suggestedRev = "Rev 2"
  } else if (currentRev === "Rev A") {
    suggestedRev = "Rev B"
  }

  const handleFinish = (values: any) => {
    const isAFC = values.isAFC || values.revisionCode.includes("AFC")

    const newRev: DrawingRevision = {
      revisionCode: values.revisionCode,
      versionNumber: deliverable.revisions.length + 1,
      isCurrent: true,
      isAFC: isAFC,
      releaseDate: new Date().toLocaleDateString("vi-VN"),
      author: values.author || deliverable.leadConsultant,
      reviewer: values.reviewer || deliverable.dmdPic,
      approver: isAFC ? "Dương Văn Bắc (BOM)" : undefined,
      changeReason: values.changeReason,
      changeCategory: values.changeCategory,
      attachedForm: values.attachedForm,
      rfiRefCode: values.rfiRefCode,
      fileName: `${deliverable.drawingCode}_${values.revisionCode.replace(/[^a-zA-Z0-9]/g, "_")}.${values.fileFormat.toLowerCase()}`,
      fileSize: values.fileSize || "48.5 MB",
      fileFormat: values.fileFormat || "DWG",
    }

    onSuccess(deliverable.id, newRev)
    message.success(`Đã ban hành phiên bản mới ${values.revisionCode} cho hồ sơ ${deliverable.drawingCode}`)
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <RotateCcw size={18} className="text-primary" />
          <span>Ban Hành Phiên Bản Bản Vẽ Mới (Issue Revision)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Ban Hành Phiên Bản"
      cancelText="Hủy Bỏ"
      width={640}
      destroyOnClose
    >
      <Card size="small" className="border-border bg-muted/20 my-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-mono text-xs font-bold text-primary">
              {deliverable.drawingCode}
            </span>
            <div className="font-medium text-xs text-foreground mt-0.5">
              {deliverable.drawingName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase">Phiên bản hiện tại</div>
            <Tag color="geekblue" className="font-mono font-bold mt-0.5">
              {deliverable.currentRevision}
            </Tag>
          </div>
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          revisionCode: suggestedRev,
          changeCategory: "VE_OPTIMIZATION",
          attachedForm: "NVLG-DMD-SOP09.F08",
          fileFormat: "DWG",
          author: deliverable.leadConsultant,
          reviewer: deliverable.dmdPic,
          fileSize: "52.0 MB",
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="revisionCode"
              label="Mã Phiên Bản Mới (Revision Code)"
              rules={[{ required: true, message: "Vui lòng nhập mã phiên bản" }]}
            >
              <Input placeholder="Rev 1, Rev 01A, Rev 02 (AFC)..." className="font-mono font-bold" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="changeCategory"
              label="Lý Do Thay Đổi (Category)"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "VE_OPTIMIZATION", label: "Tối ưu hóa Chi phí / CQA Thẩm định" },
                  { value: "SITE_RFI", label: "Xử lý xung đột hiện trường (RFI từ PCD)" },
                  { value: "CQNN_REQUIREMENT", label: "Yêu cầu từ Cơ quan Nhà nước / PCCC" },
                  { value: "SALES_MOD", label: "Điều chỉnh theo Yêu cầu Bán hàng (SAC)" },
                  { value: "INITIAL", label: "Hoàn thiện hồ sơ theo giai đoạn" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="changeReason"
          label="Chi Tiết Nội Dung Thay Đổi & Căn Cứ"
          rules={[{ required: true, message: "Vui lòng nhập nội dung thay đổi" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Mô tả cụ thể các điểm sửa đổi trên bản vẽ (ví dụ: Thay đổi dầm trục C3, dịch chuyển lỗ kỹ thuật, cập nhật vật liệu...)"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="attachedForm" label="Biểu Mẫu Thay Đổi Đính Kèm">
              <Select
                options={[
                  { value: "NVLG-DMD-SOP09.F08", label: "F08 - Báo cáo thay đổi Thiết kế nội bộ" },
                  { value: "NVLG-DMD-SOP09.F02", label: "F02 - Báo cáo thay đổi Thiết kế ý tưởng" },
                  { value: "NVLG-DMD-SOP09.F07", label: "F07 - Phê duyệt Thiết kế thi công (AFC)" },
                  { value: "NONE", label: "Không có biểu mẫu riêng" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="rfiRefCode" label="Mã Số RFI Liên Quan (nếu có)">
              <Input placeholder="Ví dụ: RFI-PCD-PHX-012" className="font-mono" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="fileFormat" label="Định Dạng Tệp">
              <Select
                options={[
                  { value: "DWG", label: "Bản vẽ CAD (.DWG)" },
                  { value: "PDF", label: "Tài liệu đóng dấu (.PDF)" },
                  { value: "BIM_RVT", label: "Mô hình Revit (.RVT)" },
                  { value: "ZIP", label: "Tập hợp nén (.ZIP)" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="author" label="Đơn Vị / Người Lập">
              <Input placeholder="Tên TVTK hoặc KTS" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="reviewer" label="DMD Kiểm Soát">
              <Input placeholder="Chuyên gia DMD" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
