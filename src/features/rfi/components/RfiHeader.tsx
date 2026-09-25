import React from "react"
import { Card, Row, Col, Input, Select, Button, Space, Typography, Tag, Tooltip } from "antd"
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  FileCheck2,
  Share2,
} from "lucide-react"

const { Title, Text } = Typography

interface RfiHeaderProps {
  totalCount: number
  highPriorityCount: number
  resolvedCount: number
  waitingConsultantCount: number
  searchTerm: string
  onSearchChange: (val: string) => void
  selectedDiscipline: string
  onDisciplineChange: (val: string) => void
  selectedPriority: string
  onPriorityChange: (val: string) => void
  selectedStatus: string
  onStatusChange: (val: string) => void
  onOpenCreateFormF08: () => void
}

export const RfiHeader: React.FC<RfiHeaderProps> = ({
  totalCount,
  highPriorityCount,
  resolvedCount,
  waitingConsultantCount,
  searchTerm,
  onSearchChange,
  selectedDiscipline,
  onDisciplineChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  onOpenCreateFormF08,
}) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={22} />
            Tiếp Nhận & Xử Lý Yêu Cầu Làm Rõ Thiết Kế Hiện Trường (PCD RFI & Form F08)
          </Title>
          <Text type="secondary" className="text-xs">
            Quy trình phối hợp <strong className="text-foreground">SOP09 Bước 8.2</strong> & <strong className="text-foreground">RACI DMD 2.2.9</strong>: Giải quyết vướng mắc thi công, điều phối TVTK và lập Báo cáo thay đổi thiết kế nội bộ <strong className="text-foreground">NVLG-DMD-SOP09.F08</strong>.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<FileCheck2 size={16} />}
          onClick={onOpenCreateFormF08}
          className="shadow-sm font-medium bg-emerald-600 hover:bg-emerald-700"
        >
          Lập Báo Cáo Thay Đổi (F08 / F02)
        </Button>
      </div>

      {/* Metrics Row */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tổng RFI Tiếp Nhận
                </div>
                <div className="text-xl font-bold mt-1 text-foreground">
                  {totalCount} <span className="text-xs font-normal text-muted-foreground">yêu cầu</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <AlertTriangle size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  RFI Khẩn Cấp (SLA 24h)
                </div>
                <div className="text-xl font-bold mt-1 text-red-500">
                  {highPriorityCount} <span className="text-xs font-normal text-muted-foreground">chặn thi công</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <Flame size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Đang Làm Việc Với TVTK
                </div>
                <div className="text-xl font-bold mt-1 text-amber-500">
                  {waitingConsultantCount} <span className="text-xs font-normal text-muted-foreground">hồ sơ</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Đã Xử Lý Xong (Có Rev/CV)
                </div>
                <div className="text-xl font-bold mt-1 text-emerald-600">
                  {resolvedCount} <span className="text-xs font-normal text-muted-foreground">đã phản hồi</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={18} />
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
              placeholder="Tìm theo mã RFI, nội dung vướng mắc hoặc người gửi PCD..."
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
              placeholder="Bộ môn kỹ thuật"
              options={[
                { value: "ALL", label: "Tất cả Bộ môn" },
                { value: "STR", label: "Kết cấu (STR)" },
                { value: "MEP", label: "Cơ điện (MEP)" },
                { value: "ARC", label: "Kiến trúc (ARC)" },
                { value: "INF", label: "Hạ tầng (INF)" },
                { value: "LND", label: "Cảnh quan (LND)" },
              ]}
            />
          </Col>

          <Col xs={12} sm={8} md={5}>
            <Select
              value={selectedPriority}
              onChange={onPriorityChange}
              className="w-full"
              placeholder="Mức độ khẩn cấp"
              options={[
                { value: "ALL", label: "Tất cả Mức độ" },
                { value: "HIGH", label: "HIGH - Chặn thi công (24h)" },
                { value: "MEDIUM", label: "MEDIUM - Ảnh hưởng cục bộ (48h)" },
                { value: "LOW", label: "LOW - Làm rõ thông tin (72h)" },
              ]}
            />
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Select
              value={selectedStatus}
              onChange={onStatusChange}
              className="w-full"
              placeholder="Hiện trạng xử lý"
              options={[
                { value: "ALL", label: "Tất cả Hiện trạng" },
                { value: "RESOLVED_REVISION", label: "Đã phát hành bản vẽ Rev mới" },
                { value: "RESOLVED_CLARIFICATION", label: "Đã giải trình kỹ thuật" },
                { value: "CHANGE_REPORT_ISSUED", label: "Đã lập Form F08/F02" },
                { value: "WAITING_CONSULTANT", label: "Đang làm việc với TVTK" },
              ]}
            />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
