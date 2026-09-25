import React from "react"
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Tag,
  Typography,
  message,
} from "antd"
import { AlertCircle, DollarSign, FileCheck2 } from "lucide-react"
import { ConsultantContract, ContractVariation } from "../types"

interface ContractVariationModalProps {
  open: boolean
  onClose: () => void
  contracts: ConsultantContract[]
  onSuccess: (contractId: string, variation: ContractVariation) => void
}

export const ContractVariationModal: React.FC<ContractVariationModalProps> = ({
  open,
  onClose,
  contracts,
  onSuccess,
}) => {
  const [form] = Form.useForm()

  const handleFinish = (values: any) => {
    const newVariation: ContractVariation = {
      id: `var-${Date.now()}`,
      variationNo: `PS-DMD-${Date.now().toString().slice(-3)}`,
      variationType: values.variationType,
      title: values.title,
      reasonDescription: values.reasonDescription,
      amountVnd: values.amountVnd || 0,
      relatedRfiCode: values.relatedRfiCode,
      relatedFormF08: values.relatedFormF08,
      dmdConfirm: true,
      managerConfirm: true,
      amApprovalStatus: "APPROVED",
      approvedDate: new Date().toLocaleDateString("vi-VN"),
      createdAt: new Date().toLocaleDateString("vi-VN"),
    }

    onSuccess(values.contractId, newVariation)
    message.success(`Đã lập hồ sơ phát sinh hợp đồng ${newVariation.variationNo} thành công!`)
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileCheck2 size={18} className="text-amber-600" />
          <span>Kiểm Tra & Xác Nhận Hồ Sơ Phát Sinh Hợp Đồng (RACI 2.5.3)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Xác Nhận Phát Sinh Hợp Đồng"
      cancelText="Hủy Bỏ"
      width={650}
      destroyOnClose
    >
      <Card size="small" className="border-amber-500/40 bg-amber-500/5 my-3">
        <div className="text-xs text-muted-foreground uppercase font-semibold">
          Quy chuẩn Kiểm soát Phát sinh (RACI 2.5.3):
        </div>
        <div className="text-xs text-foreground mt-0.5">
          Chuyên gia DMD kiểm tra $\rightarrow$ Trưởng phòng kiểm soát $\rightarrow$ Giám đốc/PGĐ chỉ đạo xác nhận hồ sơ phát sinh (PYC Phát sinh, Giảm trừ phát sinh GTPS).
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          contractId: contracts[0]?.id,
          variationType: "ADDITION",
          amountVnd: 50.0,
        }}
      >
        <Form.Item
          name="contractId"
          label="Chọn Hợp Đồng Tư Vấn"
          rules={[{ required: true }]}
        >
          <Select
            options={contracts.map((c) => ({
              value: c.id,
              label: `${c.contractNo} - ${c.consultantName} (${c.discipline})`,
            }))}
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="variationType"
              label="Loại Phát Sinh"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "ADDITION", label: "Phát sinh tăng chi phí (PYC Phát sinh)" },
                  { value: "DEDUCTION", label: "Giảm trừ phát sinh (GTPS - Cắt giảm phạm vi)" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="amountVnd"
              label="Giá Trị Phát Sinh (Triệu VNĐ)"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} step={1} className="w-full" prefix="₫" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="Tên Hạng Mục Phát Sinh"
          rules={[{ required: true, message: "Vui lòng nhập tên hạng mục" }]}
        >
          <Input placeholder="Ví dụ: Bổ sung thiết kế chi tiết cảnh quan khu thể thao ngoài trời..." />
        </Form.Item>

        <Form.Item
          name="reasonDescription"
          label="Căn Cứ & Lý Do Phát Sinh"
          rules={[{ required: true, message: "Vui lòng nhập lý do phát sinh" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Nêu rõ văn bản chỉ đạo của Ban TGĐ, yêu cầu kinh doanh SAC hoặc Báo cáo thay đổi Form F08..."
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="relatedFormF08" label="Mã Biểu Mẫu Thay Đổi Đính Kèm">
              <Input placeholder="NVLG-DMD-SOP09.F08" className="font-mono" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="relatedRfiCode" label="Mã RFI Hiện Trường (nếu có)">
              <Input placeholder="RFI-PCD-PHX-012" className="font-mono" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
