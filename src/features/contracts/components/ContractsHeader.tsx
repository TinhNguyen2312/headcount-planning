import React from "react"
import { Card, Row, Col, Input, Select, Button, Typography, Tag, Tooltip } from "antd"
import {
  Compass,
  DollarSign,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  Plus,
  Search,
  Award,
} from "lucide-react"

const { Title, Text } = Typography

interface ContractsHeaderProps {
  totalContracts: number
  totalValueVnd: number
  totalDisbursedVnd: number
  pendingBatchCount: number
  searchTerm: string
  onSearchChange: (val: string) => void
  selectedRole: string
  onRoleChange: (val: string) => void
  selectedDiscipline: string
  onDisciplineChange: (val: string) => void
  onOpenCreateVariation: () => void
}

export const ContractsHeader: React.FC<ContractsHeaderProps> = ({
  totalContracts,
  totalValueVnd,
  totalDisbursedVnd,
  pendingBatchCount,
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedDiscipline,
  onDisciplineChange,
  onOpenCreateVariation,
}) => {
  const overallRate = totalValueVnd > 0 ? Math.round((totalDisbursedVnd / totalValueVnd) * 100) : 0

  return (
    <div className="space-y-4 mb-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={4} className="!mb-0 flex items-center gap-2">
            <Compass className="text-primary" size={22} />
            Quản Lý Hợp Đồng Tư Vấn, Thanh Quyết Toán & Đánh Giá Năng Lực (TVTK/TVTT)
          </Title>
          <Text type="secondary" className="text-xs">
            Thực hiện phân định trách nhiệm <strong className="text-foreground">RACI 2.5</strong>: Kiểm tra thanh toán đợt (<strong className="text-foreground">2.5.1</strong>), quyết toán (<strong className="text-foreground">2.5.2</strong>), quản lý phát sinh (<strong className="text-foreground">2.5.3</strong>) và đánh giá đối tác theo <strong className="text-foreground">NVLG-BMD-SOP01.F1.24a</strong>.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={onOpenCreateVariation}
          className="shadow-sm font-medium bg-amber-600 hover:bg-amber-700"
        >
          Lập Hồ Sơ Phát Sinh (2.5.3)
        </Button>
      </div>

      {/* Metrics Row */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tổng Hợp Đồng TVTK / TVTT
                </div>
                <div className="text-xl font-bold mt-1 text-foreground">
                  {totalContracts} <span className="text-xs font-normal text-muted-foreground">gói thầu</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Compass size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tổng Giá Trị Hợp Đồng
                </div>
                <div className="text-xl font-bold mt-1 text-emerald-600">
                  {(totalValueVnd / 1000).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">tỷ VNĐ</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <DollarSign size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Tiến Độ Giải Ngân
                </div>
                <div className="text-xl font-bold mt-1 text-purple-600">
                  {overallRate}% <span className="text-xs font-normal text-muted-foreground">({(totalDisbursedVnd / 1000).toFixed(2)} tỷ)</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <TrendingUp size={18} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Hồ Sơ Chờ Thanh Toán Đợt
                </div>
                <div className="text-xl font-bold mt-1 text-amber-500">
                  {pendingBatchCount} <span className="text-xs font-normal text-muted-foreground">đợt đến hạn</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileCheck2 size={18} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card size="small" className="border-border bg-muted/20">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo số hợp đồng, tên tư vấn hoặc KTS chủ trì..."
              prefix={<Search size={15} className="text-muted-foreground" />}
              allowClear
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </Col>

          <Col xs={12} sm={8} md={7}>
            <Select
              value={selectedRole}
              onChange={onRoleChange}
              className="w-full"
              placeholder="Loại đối tác tư vấn"
              options={[
                { value: "ALL", label: "Tất cả Đối Tác (TVTK & TVTT)" },
                { value: "TVTK", label: "Tư Vấn Thiết Kế (TVTK)" },
                { value: "TVTT", label: "Tư Vấn Thẩm Tra Độc Lập (TVTT)" },
              ]}
            />
          </Col>

          <Col xs={12} sm={8} md={7}>
            <Select
              value={selectedDiscipline}
              onChange={onDisciplineChange}
              className="w-full"
              placeholder="Bộ môn hợp đồng"
              options={[
                { value: "ALL", label: "Tất cả Bộ môn" },
                { value: "ARC", label: "Kiến trúc (ARC)" },
                { value: "STR", label: "Kết cấu (STR)" },
                { value: "MEP", label: "Cơ điện & PCCC (MEP)" },
                { value: "LND", label: "Cảnh quan (LND)" },
                { value: "INF", label: "Hạ tầng (INF)" },
              ]}
            />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
