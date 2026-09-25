import React, { useState } from "react"
import {
  Modal,
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Table,
  Badge,
  Tooltip,
} from "antd"
import {
  FolderGit2,
  Folder,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Stamp,
} from "lucide-react"
import { NOVAGEN_CATEGORIES } from "../data/deliverablesData"
import { DeliverableItem } from "../types"

const { Title, Text, Paragraph } = Typography

interface NovagenExplorerModalProps {
  open: boolean
  onClose: () => void
  deliverables: DeliverableItem[]
}

export const NovagenExplorerModal: React.FC<NovagenExplorerModalProps> = ({
  open,
  onClose,
  deliverables,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(7) // Default Mục 07: TKBVTC (AFC)

  const selectedCategory = NOVAGEN_CATEGORIES.find(
    (c) => c.id === selectedCategoryId
  )

  // Lọc các bản vẽ thuộc danh mục Novagen này
  const categoryDeliverables = deliverables.filter(
    (d) => d.novagenCategory === selectedCategoryId
  )

  const fileColumns = [
    {
      title: "Mã Số Bản Vẽ",
      dataIndex: "drawingCode",
      key: "drawingCode",
      render: (code: string) => (
        <span className="font-mono font-semibold text-primary">{code}</span>
      ),
    },
    {
      title: "Tên Hồ Sơ",
      dataIndex: "drawingName",
      key: "drawingName",
      render: (name: string, record: DeliverableItem) => (
        <div>
          <div className="font-medium text-xs text-foreground">{name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            TVTK: <span className="text-foreground">{record.leadConsultant}</span> • Bộ môn:{" "}
            <Tag color="blue" className="text-[10px] py-0 px-1">
              {record.discipline}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Phiên Bản",
      dataIndex: "currentRevision",
      key: "currentRevision",
      render: (rev: string, record: DeliverableItem) => (
        <Tag
          color={record.status === "AFC_ISSUED" ? "success" : "geekblue"}
          className="font-mono text-xs font-semibold"
        >
          {rev}
        </Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        switch (status) {
          case "AFC_ISSUED":
            return <Tag color="success">Phát hành thi công (AFC)</Tag>
          case "AM_APPROVED":
            return <Tag color="green">Đã duyệt AM</Tag>
          case "CQA_APPRAISAL":
            return <Tag color="warning">Đang thẩm định CQA</Tag>
          default:
            return <Tag>{status}</Tag>
        }
      },
    },
    {
      title: "Đường Dẫn Lưu Trữ",
      dataIndex: "novagenFolder",
      key: "novagenFolder",
      render: (folder: string) => (
        <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px] block">
          {folder}
        </span>
      ),
    },
    {
      title: "Tải Về",
      key: "action",
      render: () => (
        <Tooltip title="Tải xuống từ kho lưu trữ số hóa">
          <Button
            size="small"
            type="text"
            icon={<Download size={14} className="text-primary" />}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FolderGit2 size={20} className="text-primary" />
          <span>Kho Lưu Trữ Số Hóa 9 Đầu Mục Novagen & ACC (NVG-ODD-REG05)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={980}
      destroyOnClose
    >
      <div className="my-2">
        <div className="text-xs text-muted-foreground mb-3 flex items-center justify-between">
          <span>
            Quy định lưu trữ hồ sơ thiết kế theo 9 đầu mục chuẩn hóa của Tập đoàn Novaland kết nối Autodesk Construction Cloud (ACC).
          </span>
          <span className="font-semibold text-primary flex items-center gap-1">
            <ShieldCheck size={14} /> Tuân thủ NVLG-RPC-REG02
          </span>
        </div>

        <Row gutter={16}>
          {/* Cột trái: Danh sách 9 Danh mục Novagen */}
          <Col span={9} className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {NOVAGEN_CATEGORIES.map((cat) => {
              const isSelected = cat.id === selectedCategoryId
              const countInCat = deliverables.filter(
                (d) => d.novagenCategory === cat.id
              ).length

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder
                        size={16}
                        className={isSelected ? "text-primary fill-primary/20" : "text-muted-foreground"}
                      />
                      <span className="font-semibold text-xs text-foreground">
                        {cat.name}
                      </span>
                    </div>
                    <Badge
                      count={countInCat > 0 ? countInCat : cat.fileCount}
                      overflowCount={999}
                      className="site-badge-count-4"
                      style={{
                        backgroundColor: isSelected ? "#2db34b" : "#8c8c8c",
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-1 pl-6">
                    {cat.description}
                  </div>

                  <div className="text-[10px] text-muted-foreground/80 mt-1 pl-6">
                    Căn cứ: <span className="font-medium">{cat.sopRef}</span>
                  </div>
                </div>
              )
            })}
          </Col>

          {/* Cột phải: Chi tiết danh mục và bảng file */}
          <Col span={15}>
            {selectedCategory && (
              <div className="space-y-3">
                <Card size="small" className="border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-primary font-bold">
                        {selectedCategory.code}
                      </div>
                      <div className="font-bold text-sm text-foreground mt-0.5">
                        {selectedCategory.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedCategory.description}
                      </div>
                    </div>
                    <Tooltip title="Mở trực tiếp trên Autodesk Construction Cloud">
                      <Button
                        size="small"
                        icon={<ExternalLink size={13} />}
                        className="text-xs"
                      >
                        Mở ACC
                      </Button>
                    </Tooltip>
                  </div>
                </Card>

                {/* Bảng danh sách các hồ sơ thuộc danh mục này */}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Các Hồ Sơ Lưu Trữ Thuộc Mục Này ({categoryDeliverables.length} hồ sơ):
                  </div>

                  {categoryDeliverables.length > 0 ? (
                    <Table
                      columns={fileColumns}
                      dataSource={categoryDeliverables}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      size="small"
                      className="border border-border rounded-lg text-xs"
                    />
                  ) : (
                    <Card size="small" className="text-center py-6 text-muted-foreground text-xs border-dashed">
                      Chưa có hồ sơ dự án nào được phân loại vào đầu mục này.
                    </Card>
                  )}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </Modal>
  )
}
