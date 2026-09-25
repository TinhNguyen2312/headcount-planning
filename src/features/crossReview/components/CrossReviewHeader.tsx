import React from "react"
import { Card, Row, Col, Input, Select, Button, Space, Typography, Tag, Tooltip } from "antd"
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Timer,
  Send,
} from "lucide-react"
import { ReviewDepartment, TicketStatus } from "../types"

const { Title, Text } = Typography

interface CrossReviewHeaderProps {
  totalCount: number
  inProgressCount: number
  warningCount: number
  overdueCount: number
  completedCount: number
  searchTerm: string
  onSearchChange: (val: string) => void
  selectedDept: string
  onDeptChange: (val: string) => void
  selectedStatus: string
  onStatusChange: (val: string) => void
  onOpenCreateModal: () => void
}

export const CrossReviewHeader: React.FC<CrossReviewHeaderProps> = ({
  totalCount,
  inProgressCount,
  warningCount,
  overdueCount,
  completedCount,
  searchTerm,
  onSearchChange,
  selectedDept,
  onDeptChange,
  selectedStatus,
  onStatusChange,
  onOpenCreateModal,
}) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <Users className="text-primary" size={22} />
            Ma Trận Phối Hợp & Giám Sát SLA Liên Phòng Ban (Cross-Functional SLA Matrix)
          </Title>
          <Text type="secondary" className="text-xs">
            Theo dõi luồng xin ý kiến chuyên môn <strong className="text-foreground">SOP09 Bước 4 & 5</strong>: Pháp lý (PLP 48h), Ngân sách (QSB 72h), Thẩm định (CQA 72h), Kinh doanh (SAC 48h).
          </Text>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={onOpenCreateModal}
          className="shadow-sm font-medium"
        >
          Tạo Phiếu Lấy Ý Kiến (PYC)
        </Button>
      </div>

      {/* Metrics Row */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tổng Phiếu Xin Ý Kiến
                </div>
                <div className="text-xl font-bold mt-1 text-foreground">
                  {totalCount} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Đã Phản Hồi Xong
                </div>
                <div className="text-xl font-bold mt-1 text-emerald-600">
                  {completedCount} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Cảnh Báo SLA (≤ 24h)
                </div>
                <div className="text-xl font-bold mt-1 text-amber-500">
                  {warningCount} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Quá Hạn Cam Kết (Escalate)
                </div>
                <div className="text-xl font-bold mt-1 text-red-500">
                  {overdueCount} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle size={18} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card size="small" className="border-border bg-muted/20">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo mã phiếu, tiêu đề, mã bản vẽ hoặc người lập..."
              prefix={<Search size={15} className="text-muted-foreground" />}
              allowClear
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </Col>

          <Col xs={12} sm={8} md={7}>
            <Select
              value={selectedDept}
              onChange={onDeptChange}
              className="w-full"
              placeholder="Phòng ban tiếp nhận"
              options={[
                { value: "ALL", label: "Tất cả Phòng Ban Tiếp Nhận" },
                { value: "PLP", label: "Phòng Thủ tục Pháp lý (PLP - 48h)" },
                { value: "QSB", label: "Phòng Khối lượng & Ngân sách (QSB - 72h)" },
                { value: "CQA", label: "Phòng Thẩm định Chi phí (CQA - 72h)" },
                { value: "SAC", label: "Ban Kinh doanh (SAC - 48h)" },
                { value: "INC", label: "Ban Đầu tư (INC - 48h)" },
                { value: "GMS", label: "Phòng Điều hành Dự án (GMS - 72h)" },
              ]}
            />
          </Col>

          <Col xs={12} sm={8} md={7}>
            <Select
              value={selectedStatus}
              onChange={onStatusChange}
              className="w-full"
              placeholder="Trạng thái SLA"
              options={[
                { value: "ALL", label: "Tất cả Trạng thái" },
                { value: "PROCESSING", label: "Đang xử lý (Trong hạn)" },
                { value: "COMPLETED", label: "Đã có văn bản phản hồi" },
                { value: "OVERDUE", label: "Quá hạn SLA (Cần nhắc nhở)" },
              ]}
            />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
