"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Tabs,
} from "antd"
import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Crown,
  DollarSign,
  Edit3,
  FileCheck,
  FileText,
  Layers,
  Network,
  Shield,
  Users,
} from "lucide-react"
import { DmdRoleProvider, useDmdRole } from "@/core/auth/roleContext"
import { RoleSwitcherDropdown } from "@/components/Dmd/RoleSwitcherDropdown"
import { StageGateFeature } from "@/features/stageGate"
import { CompetenciesFeature } from "@/features/competencies"
import { DeliverablesFeature } from "@/features/deliverables"
import { CrossReviewFeature } from "@/features/crossReview"
import { RfiFeature } from "@/features/rfi"
import { ContractsFeature } from "@/features/contracts"
import { KpiFeature } from "@/features/kpi"
import { StandardsFeature } from "@/features/standards"

const { Text } = Typography

function DmdWorkspaceInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab") || "timeline"

  const { currentRole, currentUser } = useDmdRole()
  const [selectedKey, setSelectedKey] = useState(tabParam)
  const [selectedProject, setSelectedProject] = useState("aqua-city")

  useEffect(() => {
    if (tabParam && tabParam !== selectedKey) {
      setSelectedKey(tabParam)
    }
  }, [tabParam, selectedKey])

  const handleTabChange = (key: string) => {
    setSelectedKey(key)
    router.push(`/dmd?tab=${key}`, { scroll: false })
  }

  const tabItems = [
    {
      key: "timeline",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Layers size={15} />
          <span>Cổng Stage-Gate (G1–G7)</span>
        </span>
      ),
    },
    {
      key: "competencies",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Network size={15} />
          <span>Khung Nghiệp Vụ (5–23 NV)</span>
        </span>
      ),
    },
    {
      key: "deliverables",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileText size={15} />
          <span>Hồ Sơ & Bản Vẽ (AFC)</span>
        </span>
      ),
    },
    {
      key: "cross-review",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Users size={15} />
          <span>Ma Trận Phối Hợp (SOP09)</span>
        </span>
      ),
    },
    {
      key: "rfi-change",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <AlertTriangle size={15} />
          <span>Xử Lý RFI & Thay Đổi (F02)</span>
        </span>
      ),
    },
    {
      key: "consultants",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Compass size={15} />
          <span>Hợp Đồng & TVTK (2.5)</span>
        </span>
      ),
    },
    {
      key: "kpi-work",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 size={15} />
          <span>Kế Hoạch Tuần & KPI (3.1)</span>
        </span>
      ),
    },
    {
      key: "standards",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileCheck size={15} />
          <span>Thư Viện SPEC & SOP</span>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4 pb-12">
      {/* Top Project & Role Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card rounded-xl border border-border shadow-xs">
        <Space size="middle" wrap>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#2db34b]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dự Án:
            </span>
          </div>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 230 }}
            options={[
              { value: "aqua-city", label: "Khu Đô Thị Aqua City" },
              { value: "novaworld-pt", label: "NovaWorld Phan Thiết" },
              { value: "grand-marina", label: "Grand Marina Saigon" },
            ]}
          />
          <Tag color="cyan" className="font-semibold text-xs py-0.5">
            Chế Độ: Thiết Kế 3 Bước
          </Tag>
          <Tag color="purple" className="font-semibold text-xs py-0.5">
            Quy Trình: NVLG-DMD-SOP09
          </Tag>
        </Space>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden lg:inline">
            Góc nhìn quyền hạn:
          </span>
          <RoleSwitcherDropdown />
        </div>
      </div>

      {/* Contextual Role Banner */}
      <div>
        {currentRole === "BOM" && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Crown size={18} className="text-purple-500 shrink-0" />
              <div>
                <span className="font-bold">
                  BAN TỔNG GIÁM ĐỐC / GIÁM ĐỐC BAN QLDA (BOM / AM)
                </span>
                <span className="hidden sm:inline">
                  {" "}
                  — Bạn có toàn quyền ký duyệt Cổng Stage-Gate G1-G7, Báo cáo thay đổi thiết kế Form F08 và giải ngân hợp đồng TVTK.
                </span>
              </div>
            </div>
            <Tag color="purple" className="font-bold uppercase text-[10px] m-0">
              Quyền Phê Duyệt Cao Nhất
            </Tag>
          </div>
        )}
        {currentRole === "DMD_HEAD" && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield size={18} className="text-blue-500 shrink-0" />
              <div>
                <span className="font-bold">
                  TRƯỞNG PHÒNG QUẢN LÝ THIẾT KẾ (DMD HEAD)
                </span>
                <span className="hidden sm:inline">
                  {" "}
                  — Bạn đang điều phối 7 bộ môn chuyên môn, kiểm soát SLA liên phòng ban (PLP/QSB/CQA), duyệt hồ sơ thanh toán Form 2.5 và giao việc tuần.
                </span>
              </div>
            </div>
            <Tag color="blue" className="font-bold uppercase text-[10px] m-0">
              Trưởng Phòng QLTK
            </Tag>
          </div>
        )}
        {currentRole === "DESIGNER" && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Edit3 size={18} className="text-[#2db34b] shrink-0" />
              <div>
                <span className="font-bold">
                  CHUYÊN GIA THIẾT KẾ KIẾN TRÚC ({currentUser.name})
                </span>
                <span className="hidden sm:inline">
                  {" "}
                  — Bạn đang quản lý các đầu việc tuần cá nhân (RACI 3.1), phát hành hồ sơ bản vẽ Revision và giải trình RFI hiện trường.
                </span>
              </div>
            </div>
            <Tag color="green" className="font-bold uppercase text-[10px] m-0">
              Chuyên Gia Tác Nghiệp
            </Tag>
          </div>
        )}
      </div>

      {/* Quick Metrics Bar Thích Ứng Theo Vai Trò */}
      <Row gutter={[16, 16]}>
        {currentRole === "BOM" ? (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Tiến Độ Tổng Thể (MTL)
                    </div>
                    <div className="text-2xl font-bold mt-1 text-foreground">68.5%</div>
                    <div className="text-xs text-[#2db34b] font-medium mt-1">Đúng tiến độ Master Timeline</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#2db34b]">
                    <Clock size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Hồ Sơ Chờ Duyệt AM
                    </div>
                    <div className="text-2xl font-bold mt-1 text-purple-600">8 Hồ Sơ</div>
                    <div className="text-xs text-purple-600 font-medium mt-1">Cổng G3, G4 & BVTC cần ký duyệt</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                    <Crown size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Biến Động Ngân Sách (GTPS)
                    </div>
                    <div className="text-2xl font-bold mt-1 text-amber-500">+1.8 Tỷ</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Kiểm soát an toàn (&lt; 1% dự toán)</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <DollarSign size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-blue-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Báo Cáo Tuần Gửi GMD
                    </div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">Tuần 12</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">Đã sẵn sàng phê duyệt (3.3.6)</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <FileText size={22} />
                  </div>
                </div>
              </Card>
            </Col>
          </>
        ) : currentRole === "DESIGNER" ? (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Công Việc Tuần Cá Nhân
                    </div>
                    <div className="text-2xl font-bold mt-1 text-[#2db34b]">4 / 6 Việc</div>
                    <div className="text-xs text-[#2db34b] font-medium mt-1">Tiến độ hoàn thành tuần: 67%</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#2db34b]">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-blue-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Bản Vẽ Phụ Trách (TKCS)
                    </div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">8 Bản Vẽ</div>
                    <div className="text-xs text-muted-foreground mt-1">Đang thẩm định CQA &amp; VE</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <FileText size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      RFI Phân Công Xử Lý
                    </div>
                    <div className="text-2xl font-bold mt-1 text-amber-500">1 Yêu Cầu</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Xung đột dầm D4 vs ống MEP</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <AlertTriangle size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Điểm KPI SMART Tuần
                    </div>
                    <div className="text-2xl font-bold mt-1 text-purple-600">91.0 / 100</div>
                    <div className="text-xs text-purple-600 font-medium mt-1">Hạng A - Xuất sắc (RACI 3.1)</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                    <Award size={22} />
                  </div>
                </div>
              </Card>
            </Col>
          </>
        ) : (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Tiến Độ Quản Lý Thiết Kế
                    </div>
                    <div className="text-2xl font-bold mt-1 text-foreground">68.5%</div>
                    <div className="text-xs text-[#2db34b] font-medium mt-1">Đúng tiến độ Master Timeline</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#2db34b]">
                    <Clock size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-blue-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Bộ Hồ Sơ Phát Hành (AFC)
                    </div>
                    <div className="text-2xl font-bold mt-1 text-foreground">24 / 32</div>
                    <div className="text-xs text-muted-foreground mt-1">8 bộ đang chờ duyệt AM</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <FileText size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-amber-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      Thẩm Định CQA &amp; QSB
                    </div>
                    <div className="text-2xl font-bold mt-1 text-amber-500">3 Hồ sơ</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Đang kiểm soát vượt ngân sách</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Layers size={22} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card size="small" className="border-border shadow-xs hover:border-red-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">
                      RFI Từ Công Trường (PCD)
                    </div>
                    <div className="text-2xl font-bold mt-1 text-red-500">2 Yêu cầu</div>
                    <div className="text-xs text-red-600 font-medium mt-1">1 RFI High cần xử lý trong 24h</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertTriangle size={22} />
                  </div>
                </div>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Tabs Navigation */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
        <Tabs
          activeKey={selectedKey}
          onChange={handleTabChange}
          items={tabItems}
          type="line"
          className="dmd-tabs"
        />

        {/* Tab Content */}
        <div className="mt-4">
          {selectedKey === "timeline" && <StageGateFeature />}
          {selectedKey === "competencies" && <CompetenciesFeature />}
          {selectedKey === "deliverables" && <DeliverablesFeature />}
          {selectedKey === "cross-review" && <CrossReviewFeature />}
          {selectedKey === "rfi-change" && <RfiFeature />}
          {selectedKey === "consultants" && <ContractsFeature />}
          {selectedKey === "kpi-work" && <KpiFeature />}
          {selectedKey === "standards" && <StandardsFeature />}
        </div>
      </div>
    </div>
  )
}

export function DmdWorkspacePage() {
  return (
    <DmdRoleProvider>
      <DmdWorkspaceInner />
    </DmdRoleProvider>
  )
}
