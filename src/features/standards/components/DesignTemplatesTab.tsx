import React, { useState } from "react"
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Typography,
  Modal,
  List,
  message,
  Tooltip,
  Badge,
} from "antd"
import {
  Layers,
  Box,
  Download,
  Eye,
  CheckCircle2,
  FileCode,
  Building,
  Maximize2,
} from "lucide-react"
import { DesignTemplateItem } from "../types"

const { Text, Title } = Typography

interface DesignTemplatesTabProps {
  templates: DesignTemplateItem[]
}

export const DesignTemplatesTab: React.FC<DesignTemplatesTabProps> = ({ templates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplateItem | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const handleOpenDetail = (template: DesignTemplateItem) => {
    setSelectedTemplate(template)
    setDetailModalOpen(true)
  }

  const handleDownloadPackage = (template: DesignTemplateItem) => {
    message.success(`Đang tạo liên kết tải gói BIM/CAD tiêu chuẩn: ${template.templateCode} (${template.sheetCount} bản vẽ)`)
  }

  const columns = [
    {
      title: "Mã Mẫu Điển Hình",
      dataIndex: "templateCode",
      key: "templateCode",
      width: 170,
      render: (code: string, record: DesignTemplateItem) => (
        <Space direction="vertical" size={2}>
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Box size={14} className="text-primary" />
            {code}
          </span>
          <span className="text-[11px] text-muted-foreground">{record.standardSopRef}</span>
        </Space>
      ),
    },
    {
      title: "Tên Mẫu Công Trình / Module",
      dataIndex: "templateTitle",
      key: "templateTitle",
      render: (title: string, record: DesignTemplateItem) => (
        <div>
          <div className="font-semibold text-foreground text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{record.buildingType}</div>
        </div>
      ),
    },
    {
      title: "Thông Số Khống Chế",
      key: "dimensions",
      width: 220,
      render: (_: any, record: DesignTemplateItem) => (
        <div className="text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">Kích thước:</span>{" "}
            <span className="font-medium text-foreground">{record.dimensions}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Quy mô:</span>{" "}
            <span className="font-medium text-foreground">{record.floors}</span>
          </div>
          {record.constructionAreaM2 > 0 && (
            <div>
              <span className="text-muted-foreground">DT sàn:</span>{" "}
              <span className="font-semibold text-primary">
                {record.constructionAreaM2.toLocaleString("vi-VN")} m²
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Mô Hình BIM Revit",
      dataIndex: "hasBimModel",
      key: "hasBimModel",
      width: 160,
      render: (hasBim: boolean) =>
        hasBim ? (
          <Tag color="cyan" className="flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} />
            Revit LOD 350
          </Tag>
        ) : (
          <Tag color="default">CAD 2D Standard</Tag>
        ),
    },
    {
      title: "Hồ Sơ Bản Vẽ",
      dataIndex: "sheetCount",
      key: "sheetCount",
      width: 130,
      align: "center" as const,
      render: (count: number) => (
        <div className="text-center">
          <span className="font-bold text-foreground text-sm">{count}</span>
          <div className="text-[11px] text-muted-foreground">bản vẽ chuẩn</div>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) =>
        status === "STANDARDIZED" ? (
          <Tag color="green">Đã Chuẩn Hóa</Tag>
        ) : (
          <Tag color="orange">Đang Cập Nhật</Tag>
        ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 160,
      align: "center" as const,
      render: (_: any, record: DesignTemplateItem) => (
        <Space size="small">
          <Tooltip title="Xem thông tin chi tiết">
            <Button
              type="text"
              size="small"
              icon={<Eye size={15} />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<Download size={14} />}
            onClick={() => handleDownloadPackage(record)}
          >
            Tải Gói BIM
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
        <Layers size={16} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Quy định Thư viện Thiết kế Điển hình (NVLG-GMS.DMD-SOP03):</span>{" "}
          Các mẫu nhà liên kế thương mại (Shophouse), biệt thự song lập/đơn lập, clubhouse và module hạ tầng kỹ thuật đã được Hội đồng Thiết kế Novaland phê duyệt chuẩn hóa. Khi triển khai các phân khu mới, TVTK bắt buộc tái sử dụng mô hình BIM mẫu nhằm rút ngắn thời gian thiết kế tối thiểu 40% và kiểm soát chuẩn chi phí định mức.
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        pagination={false}
        size="middle"
        bordered
      />

      {/* Detail Modal */}
      <Modal
        title={
          selectedTemplate ? (
            <div className="flex items-center gap-2">
              <Box size={18} className="text-primary" />
              <span>Chi Tiết Mẫu Điển Hình: {selectedTemplate.templateCode}</span>
            </div>
          ) : (
            "Chi tiết Mẫu"
          )
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width={650}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<Download size={14} />}
            onClick={() => {
              if (selectedTemplate) handleDownloadPackage(selectedTemplate)
            }}
          >
            Tải Toàn Bộ Hồ Sơ Thiết Kế
          </Button>,
        ]}
      >
        {selectedTemplate && (
          <div className="space-y-4 py-2 text-sm">
            <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-2">
              <div className="text-base font-bold text-foreground">
                {selectedTemplate.templateTitle}
              </div>
              <div className="text-xs text-muted-foreground">
                Loại hình: <span className="font-medium text-foreground">{selectedTemplate.buildingType}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Kích thước lô đất:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedTemplate.dimensions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quy mô tầng cao:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedTemplate.floors}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tổng diện tích sàn:</span>{" "}
                  <span className="font-semibold text-primary">
                    {selectedTemplate.constructionAreaM2.toLocaleString("vi-VN")} m²
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quy chuẩn áp dụng:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedTemplate.standardSopRef}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <FileCode size={15} className="text-primary" />
                Cấu Trúc Tệp Tin & Mô Hình Đi Kèm ({selectedTemplate.sheetCount} bản vẽ)
              </div>
              <List
                size="small"
                bordered
                dataSource={[
                  "Mô hình Revit BIM 2024 (.rvt) - Mức độ chi tiết LOD 350 kèm thông số Family chuẩn",
                  "Bộ bản vẽ Kiến trúc định dạng AutoCAD (.dwg) & PDF vector A1",
                  "Bảng bóc tách khối lượng chi tiết Bill of Quantities (BOQ) liên kết Revit schedule",
                  "Chỉ dẫn kỹ thuật thi công hoàn thiện mặt ngoài & bảng mã màu chuẩn Novaland",
                  "Phối cảnh 3D ngoại thất ban ngày và chiếu sáng ban đêm độ phân giải cao",
                ]}
                renderItem={(item) => (
                  <List.Item className="text-xs text-muted-foreground">
                    <CheckCircle2 size={13} className="text-emerald-500 mr-2 shrink-0" />
                    {item}
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
