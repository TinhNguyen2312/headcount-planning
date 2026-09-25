import React, { useState } from "react"
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Tooltip,
} from "antd"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  FileCheck2,
  Eye,
  Building,
  ShieldCheck,
} from "lucide-react"
import { MaterialSampleApproval } from "../types"

const { Text, Title } = Typography

interface MaterialApprovalTabProps {
  materials: MaterialSampleApproval[]
  onAddMaterial?: (item: MaterialSampleApproval) => void
}

export const MaterialApprovalTab: React.FC<MaterialApprovalTabProps> = ({
  materials: initialMaterials,
  onAddMaterial,
}) => {
  const [materialList, setMaterialList] = useState<MaterialSampleApproval[]>(initialMaterials)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialSampleApproval | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [form] = Form.useForm()

  const handleOpenAdd = () => {
    form.resetFields()
    setModalOpen(true)
  }

  const handleOpenView = (item: MaterialSampleApproval) => {
    setSelectedMaterial(item)
    setViewModalOpen(true)
  }

  const handleSubmit = (values: any) => {
    const newItem: MaterialSampleApproval = {
      id: `mtr-${Date.now()}`,
      sampleCode: `MTR-2026-${String(materialList.length + 42).padStart(3, "0")}`,
      materialCategory: values.materialCategory,
      materialName: values.materialName,
      brandName: values.brandName,
      specCodeRef: values.specCodeRef,
      applicationArea: values.applicationArea,
      mockupLocation: values.mockupLocation,
      approvalStatus: "PENDING_MOCKUP",
      dmdReviewer: "KTS. Hoàng Minh Trí",
      bomApprover: "Giám Đốc Quản Lý Thiết Kế (DMD Head)",
      approvalDate: undefined,
      attachedForm: "NVLG-DMD-SOP08.F01",
    }

    setMaterialList([newItem, ...materialList])
    if (onAddMaterial) onAddMaterial(newItem)
    message.success(`Đã khởi tạo hồ sơ trình duyệt mẫu vật tư ${newItem.sampleCode} (Form F01) thành công!`)
    setModalOpen(false)
  }

  const columns = [
    {
      title: "Mã Hồ Sơ Mẫu",
      dataIndex: "sampleCode",
      key: "sampleCode",
      width: 150,
      render: (code: string, record: MaterialSampleApproval) => (
        <Space direction="vertical" size={2}>
          <span className="font-bold text-foreground">{code}</span>
          <span className="text-[11px] text-muted-foreground">{record.attachedForm}</span>
        </Space>
      ),
    },
    {
      title: "Chủng Loại & Tên Vật Tư",
      key: "materialName",
      render: (_: any, record: MaterialSampleApproval) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag color="blue" className="text-[11px]">
              {record.materialCategory}
            </Tag>
            <span className="text-[11px] text-muted-foreground">Chuẩn: {record.specCodeRef}</span>
          </div>
          <div className="font-semibold text-foreground text-sm">{record.materialName}</div>
          <div className="text-xs text-primary font-medium mt-0.5">
            Thương hiệu: {record.brandName}
          </div>
        </div>
      ),
    },
    {
      title: "Vị Trí Ứng Dụng & Mockup Hiện Trường",
      key: "applicationArea",
      render: (_: any, record: MaterialSampleApproval) => (
        <div className="text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">Ứng dụng:</span>{" "}
            <span className="font-medium text-foreground">{record.applicationArea}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Vị trí Mockup:</span>{" "}
            <span className="font-medium text-foreground">{record.mockupLocation}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng Thái Phê Duyệt",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 170,
      render: (status: string) => {
        switch (status) {
          case "APPROVED":
            return (
              <Tag color="green" className="flex items-center gap-1 w-fit">
                <CheckCircle2 size={12} />
                Đã Phê Duyệt Mockup
              </Tag>
            )
          case "PENDING_MOCKUP":
            return (
              <Tag color="orange" className="flex items-center gap-1 w-fit">
                <Clock size={12} />
                Chờ Nghiệm Thu Mockup
              </Tag>
            )
          case "REVISE_REQUIRED":
            return (
              <Tag color="red" className="flex items-center gap-1 w-fit">
                <AlertCircle size={12} />
                Yêu Cầu Đổi Mẫu
              </Tag>
            )
          default:
            return <Tag>{status}</Tag>
        }
      },
    },
    {
      title: "Thẩm Định & Duyệt (SOP08)",
      key: "approver",
      width: 210,
      render: (_: any, record: MaterialSampleApproval) => (
        <div className="text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">DMD Thẩm tra:</span>{" "}
            <span className="font-medium text-foreground">{record.dmdReviewer}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cấp phê duyệt:</span>{" "}
            <span className="font-medium text-foreground">{record.bomApprover}</span>
          </div>
          {record.approvalDate && (
            <div className="text-[11px] text-muted-foreground">
              Ngày duyệt: <span className="font-semibold text-emerald-600">{record.approvalDate}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: MaterialSampleApproval) => (
        <Button
          type="text"
          size="small"
          icon={<Eye size={15} />}
          onClick={() => handleOpenView(record)}
        >
          Xem
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Top Banner and Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 border border-border rounded-lg">
        <div className="space-y-1">
          <div className="font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Quy Trình Trình Duyệt & Nghiệm Thu Mẫu Vật Tư (NVLG-DMD-SOP08)
          </div>
          <div className="text-xs text-muted-foreground">
            Áp dụng nghiệm thu mẫu thực tế (Mockup 1:1) tại hiện trường trước khi ký nghiệm thu vật liệu đầu vào và cho phép thi công đại trà
          </div>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleOpenAdd}
        >
          Trình Duyệt Mẫu Mới (Form F01)
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={materialList}
        rowKey="id"
        pagination={false}
        size="middle"
        bordered
      />

      {/* Modal Trình Duyệt Mẫu Vật Tư Mới */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileCheck2 size={18} className="text-primary" />
            <span>Trình Duyệt Mẫu Vật Tư Mới (NVLG-DMD-SOP08.F01)</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-3">
          <Form.Item
            name="materialCategory"
            label="Phân Loại Nhóm Vật Liệu"
            rules={[{ required: true, message: "Vui lòng chọn nhóm vật liệu!" }]}
          >
            <Select
              placeholder="Chọn nhóm vật tư hoàn thiện"
              options={[
                { value: "GẠCH ỐP LÁT", label: "Gạch Ốp Lát (Porcelain, Granite, Ceramic)" },
                { value: "ĐÁ TỰ NHIÊN", label: "Đá Tự Nhiên (Marble, Granite, Bazan)" },
                { value: "NHÔM KÍNH", label: "Hệ Nhôm Kính & Phụ Kiện (Cửa sổ, Vách kính)" },
                { value: "SƠN HIỆU ỨNG", label: "Sơn Nước & Sơn Hiệu Ứng Ngoại Thất" },
                { value: "THIẾT BỊ VỆ SINH", label: "Thiết Bị Vệ Sinh & Sen Vòi" },
                { value: "THIẾT BỊ ĐIỆN", label: "Thiết Bị Điện & Chiếu Sáng Mỹ Thuật" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="materialName"
            label="Tên Chi Tiết & Quy Cách Vật Tư"
            rules={[{ required: true, message: "Vui lòng nhập tên và quy cách vật liệu!" }]}
          >
            <Input placeholder="Ví dụ: Gạch Porcelain 600x1200mm vân Calacatta Ý, xương bán sứ" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="brandName"
              label="Hãng Sản Xuất / Xuất Xứ"
              rules={[{ required: true, message: "Vui lòng nhập thương hiệu!" }]}
            >
              <Input placeholder="Ví dụ: Vietceramics / Florim (Ý)" />
            </Form.Item>

            <Form.Item
              name="specCodeRef"
              label="Tiêu Chuẩn SPEC Đối Chiếu"
              initialValue="NVLG-DMD-SPEC02"
              rules={[{ required: true, message: "Vui lòng chọn tiêu chuẩn!" }]}
            >
              <Select
                options={[
                  { value: "NVLG-DMD-SPEC01", label: "SPEC01 (Nhà Cao Tầng)" },
                  { value: "NVLG-DMD-SPEC02", label: "SPEC02 (Nhà Thấp Tầng)" },
                  { value: "NVLG-DMD-SPEC06", label: "SPEC06 (Cảnh Quan)" },
                  { value: "NVLG-DMD-SPEC07", label: "SPEC07 (Cơ Điện MEP)" },
                  { value: "NVLG-DMD-SPEC09", label: "SPEC09 (Tiện Ích)" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="applicationArea"
            label="Vị Trí Áp Dụng Thực Tế Trong Dự Án"
            rules={[{ required: true, message: "Vui lòng nhập vị trí áp dụng!" }]}
          >
            <Input placeholder="Ví dụ: Mặt tiền Shophouse Phoenix South & Sảnh chính Villa" />
          </Form.Item>

          <Form.Item
            name="mockupLocation"
            label="Địa Điểm Thi Công Mockup Kiểm Tra Hiện Trường"
            rules={[{ required: true, message: "Vui lòng nhập địa điểm làm mockup!" }]}
          >
            <Input placeholder="Ví dụ: Căn mẫu thực tế Villa Stella (Lô ST-01)" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Nộp Hồ Sơ Trình Duyệt
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết Hồ Sơ Mẫu Vật Tư */}
      <Modal
        title={
          selectedMaterial ? (
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span>Biên Bản Nghiệm Thu Mẫu: {selectedMaterial.sampleCode}</span>
            </div>
          ) : (
            "Chi tiết Mẫu"
          )
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={580}
      >
        {selectedMaterial && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
              <div className="text-sm font-bold text-foreground">
                {selectedMaterial.materialName}
              </div>
              <div className="text-muted-foreground">
                Thương hiệu: <span className="font-semibold text-primary">{selectedMaterial.brandName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <span className="text-muted-foreground">Nhóm vật liệu:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedMaterial.materialCategory}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiêu chuẩn SPEC:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedMaterial.specCodeRef}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vị trí ứng dụng:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedMaterial.applicationArea}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vị trí Mockup:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedMaterial.mockupLocation}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-1.5">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                Thông Tin Ký Duyệt Nghiệm Thu (SOP08.F01)
              </div>
              <div>
                <span className="text-muted-foreground">Chuyên gia DMD thẩm tra:</span>{" "}
                <span className="font-medium text-foreground">{selectedMaterial.dmdReviewer}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cấp có thẩm quyền phê duyệt:</span>{" "}
                <span className="font-medium text-foreground">{selectedMaterial.bomApprover}</span>
              </div>
              {selectedMaterial.approvalDate && (
                <div>
                  <span className="text-muted-foreground">Ngày phê duyệt hiệu lực:</span>{" "}
                  <span className="font-bold text-emerald-600">{selectedMaterial.approvalDate}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
