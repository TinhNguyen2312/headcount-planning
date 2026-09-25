"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Badge,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileCheck2,
  FolderGit2,
  Layers,
  Plus,
  Scale,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"
import { useMtlStore } from "@/stores/useMtlStore"
import { useMtlUiStore } from "@/stores/useMtlUiStore"
import { formatDate } from "@/lib/utils"

interface ProjectSummaryRow {
  key: string
  id: string
  code: string
  name: string
  location: string
  phase: string
  progress: number
  approvalStatus: string
  baselineLocked: boolean
  headcountPlanned: number
  headcountActual: number
  headcountGap: number
  targetDate: string
}

export const ExecutiveCockpit: React.FC = () => {
  const router = useRouter()
  const { projects, setActiveProjectId } = useMtlStore()
  const { setView, setActiveWorkspaceTab, setCreateProjectOpen, setApprovalModalOpen } =
    useMtlUiStore()

  // Dữ liệu tổng hợp giữa MTL và Định biên nhân sự
  const summaryData: ProjectSummaryRow[] = projects.map((p, idx) => {
    // Giả lập tính toán % tiến độ thực tế từ taskEdits hoặc mặc định theo dự án
    const progressList = [68, 45, 82, 30, 55]
    const progress = progressList[idx % progressList.length]

    // Giả lập định biên kế hoạch vs thực tế theo quy mô dự án
    const plannedList = [36, 48, 28, 52, 24]
    const actualList = [32, 45, 29, 44, 24]
    const planned = plannedList[idx % plannedList.length]
    const actual = actualList[idx % actualList.length]
    const gap = actual - planned

    const phases = [
      "Thi công kết cấu phần thân",
      "Thi công móng cọc & hầm",
      "Hoàn thiện & Nghiệm thu",
      "Chuẩn bị đầu tư & Thiết kế",
      "Giai đoạn thi công hạ tầng",
    ]

    return {
      key: p.id,
      id: p.id,
      code: p.code,
      name: p.name,
      location: p.location || "TP. Hồ Chí Minh",
      phase: phases[idx % phases.length],
      progress,
      approvalStatus: p.approvalStatus,
      baselineLocked: !!p.baselineLocked,
      headcountPlanned: planned,
      headcountActual: actual,
      headcountGap: gap,
      targetDate: p.targetDate,
    }
  })

  // Thống kê tổng hợp vĩ mô
  const totalProjects = summaryData.length
  const lockedBaselines = summaryData.filter((s) => s.baselineLocked).length
  const avgProgress = Math.round(
    summaryData.reduce((acc, curr) => acc + curr.progress, 0) / (totalProjects || 1)
  )
  const totalPlannedHC = summaryData.reduce((acc, curr) => acc + curr.headcountPlanned, 0)
  const totalActualHC = summaryData.reduce((acc, curr) => acc + curr.headcountActual, 0)
  const staffingSufficiency = Math.round(
    (totalActualHC / (totalPlannedHC || 1)) * 100
  )
  const deficitProjects = summaryData.filter((s) => s.headcountGap < 0)

  const handleOpenTimeline = (projectId: string) => {
    setActiveProjectId(projectId)
    setView("workspace")
    setActiveWorkspaceTab("gantt")
  }

  const handleOpenHeadcount = (_projectId: string) => {
    router.push("/headcount-reports")
  }

  const columns: ColumnsType<ProjectSummaryRow> = [
    {
      title: "Dự án Trọng điểm",
      key: "name",
      render: (_, record) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm hover:text-primary cursor-pointer"
              onClick={() => handleOpenTimeline(record.id)}>
              {record.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Tag className="mr-0 text-[10px] px-1.5 py-0 font-medium">{record.code}</Tag>
            <span>{record.location}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Giai đoạn & Mốc mục tiêu",
      key: "phase",
      render: (_, record) => (
        <div>
          <div className="text-xs font-semibold text-foreground">{record.phase}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground" />
            <span>Mục tiêu: {formatDate(record.targetDate)}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái MTL (SOP06)",
      key: "status",
      width: 170,
      render: (_, record) => {
        if (record.baselineLocked) {
          return (
            <Tag color="purple" className="font-semibold text-xs">
              <ShieldCheck className="size-3 inline mr-1" />
              Baseline Đã Khóa
            </Tag>
          )
        }
        if (record.approvalStatus === "approved") {
          return (
            <Tag color="success" className="font-semibold text-xs">
              <CheckCircle2 className="size-3 inline mr-1" />
              Đã Duyệt Chính Thức
            </Tag>
          )
        }
        return (
          <Tag color="warning" className="font-semibold text-xs">
            <Clock className="size-3 inline mr-1" />
            Đang Thẩm Định GMS.P
          </Tag>
        )
      },
    },
    {
      title: "% Tiến độ Thực tế",
      key: "progress",
      width: 160,
      render: (_, record) => (
        <div className="w-full">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>{record.progress}%</span>
            <span className="text-[11px] text-muted-foreground font-normal">Kế hoạch: 100%</span>
          </div>
          <Progress
            percent={record.progress}
            size="small"
            strokeColor="#2db34b"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: "Định biên Nhân sự",
      key: "headcount",
      width: 180,
      render: (_, record) => {
        const isDeficit = record.headcountGap < 0
        const isSurplus = record.headcountGap > 0
        return (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span>{record.headcountActual} / {record.headcountPlanned}</span>
              <span className="text-[11px] text-muted-foreground font-normal">nhân sự</span>
            </div>
            <div className="mt-1">
              {isDeficit ? (
                <Tag color="error" className="text-[10px] font-semibold">
                  Thiếu {Math.abs(record.headcountGap)} NS
                </Tag>
              ) : isSurplus ? (
                <Tag color="processing" className="text-[10px] font-semibold">
                  Dư {record.headcountGap} NS
                </Tag>
              ) : (
                <Tag color="success" className="text-[10px] font-semibold">
                  Đủ định biên (100%)
                </Tag>
              )}
            </div>
          </div>
        )
      },
    },
    {
      title: "Tác vụ Lãnh đạo",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Mở Cây công việc & Biểu đồ Gantt chi tiết">
            <Button
              size="small"
              type="primary"
              className="bg-primary hover:!bg-primary/90 text-xs font-medium"
              icon={<Clock className="size-3" />}
              onClick={() => handleOpenTimeline(record.id)}
            >
              Tiến độ
            </Button>
          </Tooltip>
          <Tooltip title="Xem Ma trận tính toán Định biên & Đề xuất điều chuyển">
            <Button
              size="small"
              className="text-xs font-medium"
              icon={<Users className="size-3 text-primary" />}
              onClick={() => handleOpenHeadcount(record.id)}
            >
              Định biên
            </Button>
          </Tooltip>
          <Tooltip title="Mở Soát xét Hồ sơ Bản vẽ Kiến trúc AI (CHTK)">
            <Button
              size="small"
              className="text-xs font-medium"
              icon={<FileCheck className="size-3 text-blue-600" />}
              onClick={() => router.push("/drawing-checker/reviews")}
            >
              Bản vẽ AI
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#002b60] via-[#00387a] to-[#004b9e] text-white p-6 rounded-xl shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge status="processing" color="#2db34b" />
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
              NOVALAND GMS.P • EXECUTIVE COCKPIT
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Bàn Làm Việc Ban Lãnh Đạo
          </h1>
          <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
            Nền tảng Quản trị Doanh nghiệp Hợp nhất: Giám sát toàn diện Tiến độ Thực hiện Tổng thể
            (SOP06) song hành cùng Ma trận Năng lực & Định biên Nhân sự các Dự án Trọng điểm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setCreateProjectOpen(true)}
            className="bg-[#2db34b] hover:!bg-[#2db34b]/90 border-none font-bold text-xs shadow-sm h-9"
          >
            Tạo Dự án Mới
          </Button>
          <Button
            icon={<FileCheck2 className="size-4" />}
            onClick={() => setApprovalModalOpen(true)}
            className="bg-white/10 hover:!bg-white/20 text-white border-white/20 text-xs font-medium h-9"
          >
            Phê duyệt SOP06
          </Button>
          <Button
            icon={<FileCheck className="size-4" />}
            onClick={() => router.push("/drawing-checker")}
            className="bg-white/10 hover:!bg-white/20 text-white border-white/20 text-xs font-medium h-9"
          >
            Thẩm định Bản vẽ AI
          </Button>
          <Button
            icon={<Scale className="size-4" />}
            onClick={() => router.push("/standards")}
            className="bg-white/10 hover:!bg-white/20 text-white border-white/20 text-xs font-medium h-9"
          >
            Mô hình Định biên
          </Button>
        </div>
      </div>

      {/* 4 Macro KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="shadow-xs border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dự án Đang Triển Khai
                </p>
                <h3 className="text-2xl font-black text-foreground mt-1">
                  {totalProjects} <span className="text-xs font-normal text-muted-foreground">dự án</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <FolderGit2 className="size-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Tag color="purple" className="mr-0 text-[10px] font-semibold">
                {lockedBaselines} Baseline Đã Khóa
              </Tag>
              <span className="text-muted-foreground">Theo chuẩn SOP06</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="shadow-xs border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tiến độ Thực hiện TB
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {avgProgress}%
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Đúng tiến độ cam kết</span>
              <span className="font-bold text-foreground">11/11 Mốc T0–T10</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="shadow-xs border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tỷ lệ Đáp ứng Định biên
                </p>
                <h3 className="text-2xl font-black text-foreground mt-1">
                  {staffingSufficiency}%
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Users className="size-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hiện hữu / Định biên:</span>
              <span className="font-bold text-foreground">{totalActualHC} / {totalPlannedHC} NS</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="shadow-xs border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dự án Cần Bổ sung NS
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {deficitProjects.length} <span className="text-xs font-normal text-muted-foreground">dự án</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <AlertTriangle className="size-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                Cần tuyển / điều chuyển:
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {totalPlannedHC - totalActualHC} vị trí
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Unified Project Table */}
      <Card
        className="shadow-xs border-border"
        title={
          <div className="flex items-center gap-2 py-1">
            <BarChart3 className="size-4 text-primary" />
            <span className="font-bold text-foreground text-sm">
              Ma trận Giám sát Đồng bộ: Tiến độ MTL & Tình trạng Định biên Dự án
            </span>
          </div>
        }
        extra={
          <div className="flex items-center gap-2">
            <Button
              size="small"
              type="link"
              onClick={() => router.push("/headcount-reports")}
              className="text-xs text-primary font-semibold flex items-center gap-1"
            >
              <span>Xem Toàn bộ Báo cáo Định biên</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>
        }
      >
        <Table
          dataSource={summaryData}
          columns={columns}
          pagination={false}
          size="middle"
          rowClassName="hover:bg-accent/30 transition-colors"
        />
      </Card>

      {/* Bottom Insights: Synergy between Milestones and Staffing */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            className="shadow-xs border-border h-full"
            title={
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-emerald-600" />
                <span className="font-bold text-sm">Kế hoạch Mốc Tiến độ Chiến lược T0–T10</span>
              </div>
            }
          >
            <div className="space-y-3">
              {[
                { name: "T4 - Khởi công dự án", date: "15/04/2026", status: "completed", proj: "Aqua City - Phân khu 5" },
                { name: "T6 - Cất nóc khối tháp A", date: "20/08/2026", status: "in_progress", proj: "Novaland Center" },
                { name: "T8 - Nghiệm thu hoàn thành", date: "10/12/2026", status: "pending", proj: "NovaWorld Phan Thiết" },
                { name: "T10 - Bàn giao đưa vào SD", date: "30/03/2027", status: "pending", proj: "The Grand Manhattan" },
              ].map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-primary" />
                    <div>
                      <div className="font-semibold text-xs text-foreground">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">{m.proj}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-foreground">{m.date}</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Theo Baseline SOP06</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="shadow-xs border-border h-full"
            title={
              <div className="flex items-center gap-2">
                <Scale className="size-4 text-blue-600" />
                <span className="font-bold text-sm">Khuyến nghị Điều phối Nhân sự theo Tiến độ</span>
              </div>
            }
          >
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-4 text-amber-600" />
                  <span>Aqua City Phân khu 5: Bước vào giai đoạn cao điểm T4</span>
                </div>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Dự án sắp khởi công đào đất diện rộng cần bổ sung 02 Kỹ sư Giám sát Hạ tầng & 01 Chỉ huy phó.
                  Đề xuất điều chuyển từ cụm NovaWorld Phan Thiết đã hoàn tất bàn giao.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Novaland Center: Định biên đáp ứng 100% chuẩn GMS.P</span>
                </div>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Bộ máy quản lý dự án đã kiện toàn đầy đủ các vị trí CHT, CHP, Giám sát Cơ điện (MEP), QA/QC
                  đảm bảo tiến độ cất nóc mốc T6.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="small"
                  type="primary"
                  className="bg-primary hover:!bg-primary/90 text-xs font-semibold"
                  onClick={() => router.push("/headcount-reports")}
                >
                  Mở Kịch bản Điều chuyển Nhân sự
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
