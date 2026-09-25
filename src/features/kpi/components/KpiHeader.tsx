import React from "react"
import { Card, Row, Col, Button, Typography, Tag, Tooltip } from "antd"
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Award,
  Layers,
  Calendar,
  Users,
} from "lucide-react"

const { Title, Text } = Typography

interface KpiHeaderProps {
  totalTasks: number
  doneTasks: number
  delayedTasks: number
  avgKpiScore: number
  onTimeRate: number
  onOpenReportModal: () => void
}

export const KpiHeader: React.FC<KpiHeaderProps> = ({
  totalTasks,
  doneTasks,
  delayedTasks,
  avgKpiScore,
  onTimeRate,
  onOpenReportModal,
}) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <TrendingUp className="text-primary" size={22} />
            Theo Dõi Kế Hoạch Tuần & Đánh Giá KPI Cá Nhân (RACI 3.1 & 3.3.6)
          </Title>
          <Text type="secondary" className="text-xs">
            Số hóa quản lý theo Sheet Note: <strong className="text-foreground">Tick việc + 23 nghiệp vụ con</strong>, kiểm soát hiệu suất cá nhân và lập báo cáo tuần gửi GMD theo <strong className="text-foreground">RACI 3.3.6</strong>.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<Users size={16} />}
            onClick={() => {
              window.location.href = "/projects"
            }}
            className="border-border text-foreground hover:text-primary font-medium"
          >
            Định Biên Nhân Sự
          </Button>

          <Button
            type="primary"
            icon={<FileText size={16} />}
            onClick={onOpenReportModal}
            className="shadow-sm font-medium bg-emerald-600 hover:bg-emerald-700"
          >
            Báo Cáo Tuần Gửi GMD (3.3.6)
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Điểm KPI Toàn Phòng
                </div>
                <div className="text-xl font-bold mt-1 text-primary">
                  {avgKpiScore.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-primary">
                <Award size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Đầu Việc Hoàn Thành Tuần
                </div>
                <div className="text-xl font-bold mt-1 text-foreground">
                  {doneTasks} / {totalTasks} <span className="text-xs font-normal text-muted-foreground">việc</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tỷ Lệ Đúng Hạn (On-Time)
                </div>
                <div className="text-xl font-bold mt-1 text-purple-600">
                  {onTimeRate}% <span className="text-xs font-normal text-muted-foreground">SLA cam kết</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Clock size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Việc Tồn Đọng / Chậm Trễ
                </div>
                <div className="text-xl font-bold mt-1 text-amber-500">
                  {delayedTasks} <span className="text-xs font-normal text-muted-foreground">điểm nghẽn</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertTriangle size={18} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
