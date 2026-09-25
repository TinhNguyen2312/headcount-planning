import React from "react"
import { Card, Row, Col, Input, Select, Button, Space, Typography, Tag, Tooltip } from "antd"
import {
  FileText,
  Stamp,
  Clock,
  RotateCcw,
  Plus,
  Share2,
  FolderGit2,
  Search,
  Filter,
  Sparkles,
} from "lucide-react"
import { DisciplineType, StageCode, DeliverableStatus } from "../types"

const { Title, Text } = Typography

interface DeliverablesHeaderProps {
  totalCount: number
  afcCount: number
  reviewCount: number
  revisionCount: number
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedDiscipline: string
  onDisciplineChange: (value: string) => void
  selectedStage: string
  onStageChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  onOpenRegisterModal: () => void
  onOpenHandoverModal: () => void
  onOpenNovagenModal: () => void
}

export const DeliverablesHeader: React.FC<DeliverablesHeaderProps> = ({
  totalCount,
  afcCount,
  reviewCount,
  revisionCount,
  searchTerm,
  onSearchChange,
  selectedDiscipline,
  onDisciplineChange,
  selectedStage,
  onStageChange,
  selectedStatus,
  onStatusChange,
  onOpenRegisterModal,
  onOpenHandoverModal,
  onOpenNovagenModal,
}) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Top Banner with Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <FileText className="text-primary" size={22} />
            Quản Lý Danh Mục Bản Vẽ & Kiểm Soát Phiên Bản (Deliverables & Revision Control)
          </Title>
          <Text type="secondary" className="text-xs">
            Hệ thống quản lý mã hồ sơ theo chuẩn <strong className="text-foreground">NVLG-DMD-REG01</strong>, phê duyệt AM theo <strong className="text-foreground">SOP09</strong> và lưu trữ <strong className="text-foreground">NVG-ODD-REG05</strong>.
          </Text>
        </div>

        <Space wrap>
          <Tooltip title="Xem cấu trúc lưu trữ 9 danh mục Novagen & Autodesk Construction Cloud">
            <Button
              icon={<FolderGit2 size={16} />}
              onClick={onOpenNovagenModal}
              className="border-border text-foreground hover:text-primary"
            >
              Kho Novagen (9 Mục)
            </Button>
          </Tooltip>

          <Tooltip title="Xem tình trạng bàn giao bản vẽ thi công sang PCD, PTC, QSB, PLP">
            <Button
              icon={<Share2 size={16} />}
              onClick={onOpenHandoverModal}
              className="border-border text-foreground hover:text-primary"
            >
              Ma Trận Bàn Giao
            </Button>
          </Tooltip>

          <Tooltip title="Chuyển sang phân hệ Thẩm định Hồ sơ Thiết kế AI để quét lỗi CHTK trên bản vẽ">
            <Button
              icon={<Sparkles size={16} className="text-[#2db34b]" />}
              onClick={() => {
                window.location.href = "/drawing-checker"
              }}
              className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-medium"
            >
              Thẩm Định AI (CHTK)
            </Button>
          </Tooltip>

          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={onOpenRegisterModal}
            className="shadow-sm font-medium"
          >
            Đăng Ký Hồ Sơ Mới (REG01)
          </Button>
        </Space>
      </div>

      {/* Metrics Row */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tổng Hồ Sơ Quản Lý
                </div>
                <div className="text-xl font-bold mt-1 text-foreground">
                  {totalCount} <span className="text-xs font-normal text-muted-foreground">gói</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <FileText size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Phát Hành Thi Công (AFC)
                </div>
                <div className="text-xl font-bold mt-1 text-emerald-600">
                  {afcCount} <span className="text-xs font-normal text-muted-foreground">bộ bản vẽ</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Stamp size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Đang Soát Xét / CQA
                </div>
                <div className="text-xl font-bold mt-1 text-amber-500">
                  {reviewCount} <span className="text-xs font-normal text-muted-foreground">hồ sơ</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Bản Vẽ Có Revision Mới
                </div>
                <div className="text-xl font-bold mt-1 text-purple-600">
                  {revisionCount} <span className="text-xs font-normal text-muted-foreground">bản sửa đổi</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <RotateCcw size={18} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card size="small" className="border-border bg-muted/20">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo mã REG01, tên bản vẽ hoặc đơn vị tư vấn..."
              prefix={<Search size={15} className="text-muted-foreground" />}
              allowClear
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </Col>

          <Col xs={12} sm={8} md={5}>
            <Select
              value={selectedDiscipline}
              onChange={onDisciplineChange}
              className="w-full"
              placeholder="Bộ môn chuyên ngành"
              options={[
                { value: "ALL", label: "Tất cả Bộ môn (7 Bộ môn)" },
                { value: "ARC", label: "Kiến trúc (ARC)" },
                { value: "STR", label: "Kết cấu (STR)" },
                { value: "MEP", label: "Cơ điện & PCCC (MEP)" },
                { value: "LND", label: "Cảnh quan (LND)" },
                { value: "INF", label: "Hạ tầng kỹ thuật (INF)" },
                { value: "PLN", label: "Quy hoạch đô thị (PLN)" },
                { value: "INT", label: "Nội thất & Fitout (INT)" },
              ]}
            />
          </Col>

          <Col xs={12} sm={8} md={6}>
            <Select
              value={selectedStage}
              onChange={onStageChange}
              className="w-full"
              placeholder="Giai đoạn SOP09"
              options={[
                { value: "ALL", label: "Tất cả Giai đoạn (G1 - G8)" },
                { value: "G1", label: "G1. Thiết kế Ý tưởng Quy hoạch" },
                { value: "G2", label: "G2. Thiết kế Quy hoạch 1/500" },
                { value: "G3", label: "G3. Thiết kế Ý tưởng Công trình" },
                { value: "G4", label: "G4. Thiết kế Cơ sở (TKCS)" },
                { value: "G5", label: "G5. Thiết kế BVTC 2 bước" },
                { value: "G6", label: "G6. Thiết kế Kỹ thuật 3 bước" },
                { value: "G7", label: "G7. Thiết kế BVTC 3 bước" },
                { value: "G8", label: "G8. Bản vẽ Bán hàng (SOP05)" },
              ]}
            />
          </Col>

          <Col xs={24} sm={8} md={5}>
            <Select
              value={selectedStatus}
              onChange={onStatusChange}
              className="w-full"
              placeholder="Trạng thái hồ sơ"
              options={[
                { value: "ALL", label: "Tất cả Trạng thái" },
                { value: "AFC_ISSUED", label: "Đã phát hành AFC" },
                { value: "AM_APPROVED", label: "Đã duyệt AM" },
                { value: "CQA_APPRAISAL", label: "Đang thẩm định CQA" },
                { value: "INTERNAL_REVIEW", label: "Đang soát xét nội bộ" },
                { value: "CQNN_SUBMITTED", label: "Đã nộp CQNN" },
              ]}
            />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
