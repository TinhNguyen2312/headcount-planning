import React from "react"
import { Row, Col, Card, Input, Select, Space, Typography, Tag } from "antd"
import { Search, BookOpen, Layers, CheckCircle2, ShieldCheck } from "lucide-react"

const { Title, Text } = Typography

interface StandardsHeaderProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedDiscipline: string
  onDisciplineChange: (value: string) => void
  totalSpecs: number
  totalTemplates: number
  approvedMaterials: number
  totalMaterials: number
}

export const StandardsHeader: React.FC<StandardsHeaderProps> = ({
  searchText,
  onSearchChange,
  selectedDiscipline,
  onDisciplineChange,
  totalSpecs,
  totalTemplates,
  approvedMaterials,
  totalMaterials,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Tiêu Chuẩn Kỹ Thuật (SPEC)
                </div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {totalSpecs} Bộ Tài Liệu
                </div>
                <div className="text-xs text-primary font-medium mt-1">
                  SPEC01 - SPEC09 Đã Số Hóa
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Thiết Kế Điển Hình (SOP03)
                </div>
                <div className="text-2xl font-bold mt-1 text-blue-600">
                  {totalTemplates} Mẫu Chuẩn
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Đồng bộ Revit BIM LOD 350
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Layers size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Mẫu Vật Tư Đã Duyệt (SOP08)
                </div>
                <div className="text-2xl font-bold mt-1 text-emerald-600">
                  {approvedMaterials} / {totalMaterials}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  Đạt nghiệm thu Mockup thực tế
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  Hiệu Lực Ban Hành
                </div>
                <div className="text-2xl font-bold mt-1 text-purple-600">
                  Q1 / 2026
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  BOM & GMS Phê duyệt áp dụng
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <ShieldCheck size={20} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Title Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <Title level={4} style={{ margin: 0 }} className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Hệ Thống Tiêu Chuẩn Thiết Kế & Thư Viện Mẫu Điển Hình
          </Title>
          <Text type="secondary" className="text-xs">
            Áp dụng các tiêu chuẩn NVLG-DMD-SPEC01 đến SPEC09, quy trình thiết kế điển hình NVLG-GMS.DMD-SOP03 và duyệt mẫu vật liệu SOP08
          </Text>
        </div>

        <Space size="middle" className="w-full sm:w-auto">
          <Input
            prefix={<Search size={16} className="text-muted-foreground" />}
            placeholder="Tìm mã SPEC, tên tiêu chuẩn, vật liệu..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            value={selectedDiscipline}
            onChange={onDisciplineChange}
            style={{ width: 180 }}
            options={[
              { value: "ALL", label: "Tất cả bộ môn" },
              { value: "ARC", label: "Kiến trúc (ARC)" },
              { value: "STR", label: "Kết cấu (STR)" },
              { value: "MEP", label: "Cơ điện (MEP)" },
              { value: "LND", label: "Cảnh quan (LND)" },
              { value: "INF", label: "Hạ tầng (INF)" },
              { value: "PLN", label: "Quy hoạch (PLN)" },
            ]}
          />
        </Space>
      </div>
    </div>
  )
}
