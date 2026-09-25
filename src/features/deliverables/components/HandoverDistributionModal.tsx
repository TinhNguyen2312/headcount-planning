import React, { useState } from "react"
import {
  Modal,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Checkbox,
  Input,
  Select,
  Alert,
  message,
  Divider,
} from "antd"
import {
  Share2,
  Stamp,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import { DeliverableItem, HandoverRecipient } from "../types"

const { Title, Text, Paragraph } = Typography

interface HandoverDistributionModalProps {
  open: boolean
  onClose: () => void
  deliverables: DeliverableItem[]
  onUpdateHandover: (deliverableId: string, recipient: HandoverRecipient) => void
}

export const HandoverDistributionModal: React.FC<HandoverDistributionModalProps> = ({
  open,
  onClose,
  deliverables,
  onUpdateHandover,
}) => {
  // Chỉ chọn những hồ sơ đã là AFC hoặc AM_APPROVED
  const afcDeliverables = deliverables.filter(
    (d) => d.status === "AFC_ISSUED" || d.status === "AM_APPROVED"
  )

  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>(
    afcDeliverables[0]?.id || ""
  )
  const [selectedDepts, setSelectedDepts] = useState<string[]>(["PCD", "PTC"])
  const [transmittalNote, setTransmittalNote] = useState<string>(
    "Bàn giao hồ sơ TKBVTC đã đóng dấu AFC phục vụ thi công & đấu thầu"
  )

  const currentDeliverable = deliverables.find(
    (d) => d.id === selectedDeliverableId
  )

  const handleSendHandover = () => {
    if (!currentDeliverable) {
      message.error("Vui lòng chọn hồ sơ cần bàn giao")
      return
    }

    if (selectedDepts.length === 0) {
      message.warning("Vui lòng chọn ít nhất một phòng ban tiếp nhận")
      return
    }

    selectedDepts.forEach((dept) => {
      const deptNames: Record<string, string> = {
        PCD: "Phòng QLXD (Hiện trường)",
        PTC: "Ban Cung ứng Đấu thầu",
        QSB: "Phòng Khối lượng & Ngân sách",
        PLP: "Phòng Thủ tục Pháp lý",
        SAC: "Ban Kinh doanh",
        NOVAGEN: "Kho Dữ liệu Novagen / ACC",
      }

      const newHandover: HandoverRecipient = {
        department: dept as any,
        deptName: deptNames[dept] || dept,
        purpose: transmittalNote,
        status: "SENT",
        sentDate: new Date().toLocaleDateString("vi-VN"),
        transmittalNo: `TR-DMD-${dept}-${Date.now().toString().slice(-4)}`,
      }

      onUpdateHandover(currentDeliverable.id, newHandover)
    })

    message.success(
      `Đã phát hành phiếu bàn giao cho ${selectedDepts.length} phòng ban thành công!`
    )
  }

  // Danh sách các phòng ban tiếp nhận hồ sơ theo SOP09
  const departmentOptions = [
    {
      key: "PCD",
      title: "Phòng Quản lý Xây dựng (PCD)",
      desc: "Hiện trường thi công. Tiếp nhận bản vẽ đóng dấu AFC để thi công và gửi RFI khi có xung đột kỹ thuật.",
      sopRef: "SOP09 Bước 8.2",
    },
    {
      key: "PTC",
      title: "Ban Cung ứng Đấu thầu (PTC)",
      desc: "Tiếp nhận hồ sơ thiết kế & BOQ phục vụ công tác mời thầu và ký hợp đồng thi công.",
      sopRef: "SOP09 Bước 8.1 / SOP01",
    },
    {
      key: "QSB",
      title: "Phòng Khối lượng & Ngân sách (QSB)",
      desc: "Tiếp nhận bản vẽ để đối soát định mức và lập bảng khối lượng BOQ chính thức.",
      sopRef: "SOP09 Bước 7.1",
    },
    {
      key: "PLP",
      title: "Phòng Thủ tục Pháp lý (PLP)",
      desc: "Tiếp nhận hồ sơ nộp thẩm định BCNCKT / Xin GPXD và thẩm duyệt PCCC từ CQNN.",
      sopRef: "SOP09 Bước 6 & 7",
    },
    {
      key: "SAC",
      title: "Ban Kinh doanh (SAC)",
      desc: "Tiếp nhận bộ bản vẽ trích xuất phục vụ tiếp thị sản phẩm và công tác bán hàng.",
      sopRef: "NVLG-DMD-SOP05",
    },
    {
      key: "NOVAGEN",
      title: "Kho Lưu Trữ Novagen & ACC",
      desc: "Lưu trữ số hóa tuân thủ 9 đầu mục NVG-ODD-REG05 và kiểm soát hồ sơ NVLG-RPC-REG02.",
      sopRef: "SOP09 Bước 9",
    },
  ]

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Share2 size={20} className="text-primary" />
          <span>Ma Trận Bàn Giao Hồ Sơ Phát Hành Thi Công (SOP09 Bước 7 & 8)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<Send size={15} />}
          onClick={handleSendHandover}
          disabled={!currentDeliverable}
        >
          Phát Hành Phiếu Bàn Giao (Transmittal)
        </Button>,
      ]}
      width={840}
      destroyOnClose
    >
      <div className="space-y-4 my-2">
        {/* Hướng dẫn quy trình */}
        <Alert
          message="Quy chuẩn Bàn giao Phát hành Thi công (AFC Stamping & Distribution)"
          description="Hồ sơ sau khi có Quyết định phê duyệt theo AM (kèm Form F07) sẽ được DMD & PMD phối hợp đóng dấu pháp nhân CĐT và dấu 'APPROVED FOR CONSTRUCTION' trước khi bàn giao cho các Ban/Phòng liên quan."
          type="info"
          showIcon
          icon={<Stamp className="text-primary" size={20} />}
          className="text-xs"
        />

        {/* Chọn hồ sơ phát hành */}
        <Row gutter={12}>
          <Col span={14}>
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
              Chọn Hồ Sơ / Bộ Bản Vẽ Cần Bàn Giao:
            </div>
            <Select
              value={selectedDeliverableId}
              onChange={setSelectedDeliverableId}
              className="w-full"
              placeholder="Chọn bộ hồ sơ..."
              options={afcDeliverables.map((d) => ({
                value: d.id,
                label: `[${d.drawingCode}] - ${d.drawingName} (${d.currentRevision})`,
              }))}
            />
          </Col>
          <Col span={10}>
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
              Trạng Thái Phê Duyệt Hiện Tại:
            </div>
            {currentDeliverable ? (
              <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-muted/30 border border-border text-xs">
                <Tag color={currentDeliverable.status === "AFC_ISSUED" ? "success" : "processing"}>
                  {currentDeliverable.status === "AFC_ISSUED"
                    ? "Đã đóng dấu AFC"
                    : "Đã duyệt AM (Chờ đóng dấu)"}
                </Tag>
                <span className="font-mono font-bold text-primary">
                  {currentDeliverable.currentRevision}
                </span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground py-2">Chưa chọn hồ sơ</div>
            )}
          </Col>
        </Row>

        {currentDeliverable && (
          <>
            {/* Điều kiện tiên quyết trước khi phát hành */}
            <Card size="small" className="border-border bg-muted/10">
              <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-500" />
                Kiểm tra điều kiện tiên quyết phát hành thi công:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>Đã thẩm định Chi phí & Chất lượng (CQA/QSB)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>Đã có báo cáo thẩm tra độc lập TVTT</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>Đã có quyết định phê duyệt BOM (Form F07)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>Đóng dấu pháp nhân CĐT & dấu phát hành AFC</span>
                </div>
              </div>
            </Card>

            {/* Chọn các phòng ban nhận bàn giao */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Chọn Các Phòng Ban Tiếp Nhận Bàn Giao:
              </div>
              <div className="space-y-2">
                {departmentOptions.map((dept) => {
                  const isChecked = selectedDepts.includes(dept.key)
                  const existingHandover = currentDeliverable.handovers.find(
                    (h) => h.department === dept.key
                  )

                  return (
                    <div
                      key={dept.key}
                      onClick={() => {
                        setSelectedDepts((prev) =>
                          prev.includes(dept.key)
                            ? prev.filter((k) => k !== dept.key)
                            : [...prev, dept.key]
                        )}
                      }
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Checkbox checked={isChecked} className="mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                            <span>{dept.title}</span>
                            <Tag className="text-[10px] py-0 px-1 font-normal">
                              {dept.sopRef}
                            </Tag>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {dept.desc}
                          </div>
                        </div>
                      </div>

                      {existingHandover && (
                        <div className="text-right shrink-0">
                          <Tag
                            color={
                              existingHandover.status === "ACKNOWLEDGED"
                                ? "success"
                                : "processing"
                            }
                            className="text-[10px]"
                          >
                            {existingHandover.status === "ACKNOWLEDGED"
                              ? "Đã xác nhận nhận"
                              : "Đã gửi"}
                          </Tag>
                          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                            {existingHandover.transmittalNo}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nội dung ghi chú bàn giao */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                Nội Dung Bàn Giao (Transmittal Note):
              </div>
              <Input.TextArea
                rows={2}
                value={transmittalNote}
                onChange={(e) => setTransmittalNote(e.target.value)}
                placeholder="Nhập ghi chú hoặc yêu cầu đối soát..."
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
