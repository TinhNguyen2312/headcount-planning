import React, { useState } from "react"
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Typography,
  Space,
  Drawer,
  List,
  Divider,
  message,
  Tooltip,
} from "antd"
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  ArrowRight,
} from "lucide-react"
import { SpecStandard } from "../types"

const { Text, Title, Paragraph } = Typography

interface SpecDocumentGridProps {
  specs: SpecStandard[]
}

export const SpecDocumentGrid: React.FC<SpecDocumentGridProps> = ({ specs }) => {
  const [selectedSpec, setSelectedSpec] = useState<SpecStandard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleOpenDetail = (spec: SpecStandard) => {
    setSelectedSpec(spec)
    setDrawerOpen(true)
  }

  const handleDownload = (spec: SpecStandard) => {
    message.success(`Đang tải trọn bộ tài liệu ${spec.specCode}: ${spec.specTitle} (${spec.fileSize})`)
  }

  const getDisciplineBadge = (discipline: string) => {
    switch (discipline) {
      case "ARC":
        return <Tag color="blue">Kiến Trúc (ARC)</Tag>
      case "STR":
        return <Tag color="green">Kết Cấu (STR)</Tag>
      case "MEP":
        return <Tag color="orange">Cơ Điện (MEP)</Tag>
      case "LND":
        return <Tag color="cyan">Cảnh Quan (LND)</Tag>
      case "INF":
        return <Tag color="purple">Hạ Tầng (INF)</Tag>
      case "PLN":
        return <Tag color="geekblue">Quy Hoạch (PLN)</Tag>
      default:
        return <Tag>{discipline}</Tag>
    }
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {specs.map((spec) => (
          <Col xs={24} md={12} xl={8} key={spec.id}>
            <Card
              className="h-full border-border hover:shadow-md transition-shadow flex flex-col justify-between"
              size="small"
              title={
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {spec.specCode.replace("NVLG-DMD-", "")}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">
                        {spec.specCode}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {spec.version}
                      </div>
                    </div>
                  </div>
                  {getDisciplineBadge(spec.discipline)}
                </div>
              }
              actions={[
                <Button
                  key="detail"
                  type="text"
                  size="small"
                  icon={<Eye size={14} />}
                  onClick={() => handleOpenDetail(spec)}
                  className="text-xs"
                >
                  Xem Chương Mục
                </Button>,
                <Button
                  key="download"
                  type="link"
                  size="small"
                  icon={<Download size={14} />}
                  onClick={() => handleDownload(spec)}
                  className="text-xs font-semibold text-primary"
                >
                  Tải PDF ({spec.fileSize})
                </Button>,
              ]}
            >
              <div className="space-y-3 py-1">
                <Title level={5} className="line-clamp-2 !mb-1 text-foreground" style={{ minHeight: "44px" }}>
                  {spec.specTitle}
                </Title>

                <div className="bg-muted/40 p-2.5 rounded-md text-xs space-y-1.5 border border-border/50">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Phạm vi áp dụng:</span>
                    <span className="font-medium text-foreground text-right">{spec.starRatingApplicable}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Hiệu lực từ:</span>
                    <span className="font-medium text-foreground">{spec.effectiveDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Quy mô tài liệu:</span>
                    <span className="font-medium text-foreground">{spec.pageCount} Trang ({spec.fileSize})</span>
                  </div>
                </div>

                <Paragraph
                  ellipsis={{ rows: 3, expandable: false }}
                  className="text-xs text-muted-foreground !mb-0"
                >
                  {spec.summary}
                </Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Drawer Xem Chi Tiết Chương Mục của SPEC */}
      <Drawer
        title={
          selectedSpec ? (
            <div className="flex items-center justify-between pr-4">
              <Space direction="vertical" size={2}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground">{selectedSpec.specCode}</span>
                  {getDisciplineBadge(selectedSpec.discipline)}
                  <Tag color="gold">{selectedSpec.version}</Tag>
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  {selectedSpec.specTitle}
                </div>
              </Space>
            </div>
          ) : (
            "Chi tiết Tiêu chuẩn"
          )
        }
        placement="right"
        width={620}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
          selectedSpec && (
            <Button
              type="primary"
              icon={<Download size={14} />}
              onClick={() => handleDownload(selectedSpec)}
            >
              Tải Tài Liệu
            </Button>
          )
        }
      >
        {selectedSpec && (
          <div className="space-y-5 text-sm">
            {/* Overview info box */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Mục Đích & Phạm Vi Tiêu Chuẩn
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedSpec.summary}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground">Đối tượng áp dụng:</span>{" "}
                  <span className="font-medium text-foreground">{selectedSpec.starRatingApplicable}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hiệu lực ban hành:</span>{" "}
                  <span className="font-medium text-foreground">{selectedSpec.effectiveDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Số trang tài liệu:</span>{" "}
                  <span className="font-medium text-foreground">{selectedSpec.pageCount} trang A4</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Định dạng file:</span>{" "}
                  <span className="font-medium text-foreground">PDF Vector + CAD/BIM References</span>
                </div>
              </div>
            </div>

            {/* Chapters list */}
            <div>
              <div className="font-semibold text-foreground mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  Cấu Trúc Các Chương Mục Kỹ Thuật Bắt Buộc
                </span>
                <Tag color="cyan">{selectedSpec.keyChapters.length} Chương</Tag>
              </div>

              <List
                size="small"
                bordered
                dataSource={selectedSpec.keyChapters}
                renderItem={(chapter, idx) => (
                  <List.Item className="hover:bg-muted/40 transition-colors">
                    <div className="flex items-start gap-3 py-1">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-foreground font-medium">
                        {chapter}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Compliance warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Lưu Ý Áp Dụng Bắt Buộc Đối Với TVTK & Chuyên Gia DMD
              </div>
              <div>
                Tất cả các bản vẽ thiết kế phát hành bước TKCS (G4) và BVTC (G5/G7) bắt buộc phải tuân thủ triệt để các thông số khống chế trong tài liệu này. Mọi thay đổi hoặc đề xuất sai lệch phải lập báo cáo Form F08 trình BOM phê duyệt.
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}
