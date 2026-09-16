"use client"

import {
  Button,
  Card,
  InputNumber,
  message,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  ArrowRightLeft,
  FileCheck2,
  HelpCircle,
  Send,
  Sparkles,
  UserPlus,
} from "lucide-react"
import { useState } from "react"
import {
  MOCK_PROPOSALS,
  MOCK_RECOMMENDATIONS,
  type ProposalItem,
  type RecommendationItem,
} from "@/mocks/headcountReportMock"

interface HeadcountRecommendationsViewProps {
  reportCode?: string
  scopeName?: string
}

export const HeadcountRecommendationsView = ({
  reportCode = "BC_202609_001",
  scopeName = "Aqua - 112Ha",
}: HeadcountRecommendationsViewProps) => {
  const [recommendations, setRecommendations] =
    useState<RecommendationItem[]>(MOCK_RECOMMENDATIONS)
  const [proposals, setProposals] = useState<ProposalItem[]>(MOCK_PROPOSALS)
  const [activeTab, setActiveTab] = useState("recruitment")

  // Xử lý cập nhật số lượng Confirm
  const handleUpdateConfirm = (id: string, val: number | null) => {
    if (val === null) return
    setRecommendations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmedQty: val } : item,
      ),
    )
  }

  // Tạo đề xuất tuyển dụng (TD) hoặc thuyên chuyển (TC)
  const handleGenerateProposal = (rec: RecommendationItem) => {
    if (rec.confirmedQty <= 0) {
      message.warning("Vui lòng nhập số lượng phê duyệt (Confirm) lớn hơn 0!")
      return
    }

    const prefix = rec.type === "RECRUITMENT" ? "TD" : "TC"
    const newProposals: ProposalItem[] = []
    const generatedCodes: string[] = []

    for (let i = 1; i <= rec.confirmedQty; i++) {
      const code = `${prefix}_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}_${Math.floor(100 + Math.random() * 900)}_${i}`
      generatedCodes.push(code)
      newProposals.push({
        id: `prop-${Date.now()}-${i}`,
        code,
        type: rec.type,
        recommendationId: rec.id,
        projectCode: rec.projectCode,
        projectName: rec.projectName,
        departmentName: rec.departmentName,
        roleName: rec.roleName,
        targetCount: 1,
        status: "CONFIRMED",
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        approver: "Lãnh đạo Khối / Ban Giám đốc",
      })
    }

    setProposals((prev) => [...newProposals, ...prev])
    setRecommendations((prev) =>
      prev.map((item) =>
        item.id === rec.id
          ? {
              ...item,
              status: "CONFIRMED",
              proposalCodes: [...item.proposalCodes, ...generatedCodes],
            }
          : item,
      ),
    )

    message.success(
      `Đã tạo thành công ${rec.confirmedQty} mã đề xuất ${prefix} (${generatedCodes.join(", ")})!`,
    )
  }

  // Danh sách khuyến nghị Tuyển dụng
  const recruitmentList = recommendations.filter(
    (r) => r.type === "RECRUITMENT",
  )
  // Danh sách khuyến nghị Thuyên chuyển
  const transferList = recommendations.filter((r) => r.type === "TRANSFER")

  // Columns Bảng Tuyển dụng
  const recruitmentColumns: ColumnsType<RecommendationItem> = [
    {
      title: "Dự án",
      dataIndex: "projectCode",
      key: "projectCode",
      width: 120,
      render: (code, r) => (
        <div>
          <span className="font-semibold text-xs text-foreground">{code}</span>
          <div className="text-[11px] text-muted-foreground">
            {r.projectName}
          </div>
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      width: 140,
      render: (v) => <span className="text-xs text-foreground">{v}</span>,
    },
    {
      title: "Chức danh cần tuyển",
      dataIndex: "roleName",
      key: "roleName",
      width: 190,
      render: (v, r) => (
        <div>
          <span className="font-medium text-xs text-foreground">{v}</span>
          {r.notes && (
            <div className="text-[11px] text-muted-foreground italic truncate">
              {r.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="Quy tắc BRD Mục 4.5.b: Vị trí phải thiếu hụt liên tục tối thiểu 3 tháng mới được đề xuất tuyển dụng">
          <span className="flex items-center gap-1 cursor-help">
            Thiếu liên tục
            <HelpCircle className="size-3 text-muted-foreground" />
          </span>
        </Tooltip>
      ),
      dataIndex: "consecutiveShortageMonths",
      key: "consecutiveShortageMonths",
      width: 120,
      align: "center",
      render: (months: number) => (
        <Tag
          color={months >= 3 ? "error" : "warning"}
          className="text-xs font-bold"
        >
          {months} tháng ({months >= 3 ? ">= 3T Đạt" : "< 3T Không đạt"})
        </Tag>
      ),
    },
    {
      title: "SL kỳ này",
      dataIndex: "currentPeriodQty",
      key: "currentPeriodQty",
      width: 90,
      align: "center",
      render: (v) => <span className="font-semibold text-rose-600">-{v}</span>,
    },
    {
      title: "SL kỳ trước",
      dataIndex: "previousPeriodQty",
      key: "previousPeriodQty",
      width: 90,
      align: "center",
      render: (v) => <span className="text-muted-foreground">{v}</span>,
    },
    {
      title: "SL Cần tuyển",
      dataIndex: "neededQty",
      key: "neededQty",
      width: 100,
      align: "center",
      render: (v) => (
        <span className="font-bold text-sm text-foreground">{v}</span>
      ),
    },
    {
      title: "SL Phê duyệt (Confirm)",
      key: "confirmedQty",
      width: 150,
      align: "center",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={r.neededQty}
          value={r.confirmedQty}
          onChange={(val) => handleUpdateConfirm(r.id, val)}
          size="small"
          className="w-24 text-center font-bold"
        />
      ),
    },
    {
      title: "Mã Đề xuất đã sinh",
      key: "proposals",
      width: 180,
      render: (_, r) => (
        <div className="flex flex-wrap gap-1">
          {r.proposalCodes.length > 0 ? (
            r.proposalCodes.map((c) => (
              <Tag key={c} color="processing" className="font-mono text-[11px]">
                {c}
              </Tag>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/60 italic">
              Chưa tạo mã
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      align: "center",
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<Send className="size-3" />}
          onClick={() => handleGenerateProposal(r)}
          className="text-xs"
        >
          Tạo Đề xuất TD
        </Button>
      ),
    },
  ]

  // Columns Bảng Thuyên chuyển
  const transferColumns: ColumnsType<RecommendationItem> = [
    {
      title: "Dự án",
      dataIndex: "projectCode",
      key: "projectCode",
      width: 120,
      render: (code, r) => (
        <div>
          <span className="font-semibold text-xs text-foreground">{code}</span>
          <div className="text-[11px] text-muted-foreground">
            {r.projectName}
          </div>
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      width: 140,
      render: (v) => <span className="text-xs text-foreground">{v}</span>,
    },
    {
      title: "Chức danh thuyên chuyển",
      dataIndex: "roleName",
      key: "roleName",
      width: 190,
      render: (v, r) => (
        <div>
          <span className="font-medium text-xs text-foreground">{v}</span>
          {r.notes && (
            <div className="text-[11px] text-muted-foreground italic truncate">
              {r.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "SL kỳ này (Làm tròn nguyên)",
      dataIndex: "currentPeriodQty",
      key: "currentPeriodQty",
      width: 140,
      align: "center",
      render: (v) => <span className="font-semibold text-amber-600">+{v}</span>,
    },
    {
      title: "SL kỳ trước",
      dataIndex: "previousPeriodQty",
      key: "previousPeriodQty",
      width: 90,
      align: "center",
      render: (v) => <span className="text-muted-foreground">{v}</span>,
    },
    {
      title: "SL Cần thuyên chuyển",
      dataIndex: "neededQty",
      key: "neededQty",
      width: 140,
      align: "center",
      render: (v) => (
        <span className="font-bold text-sm text-foreground">{v}</span>
      ),
    },
    {
      title: "SL Phê duyệt (Confirm)",
      key: "confirmedQty",
      width: 150,
      align: "center",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={r.neededQty}
          value={r.confirmedQty}
          onChange={(val) => handleUpdateConfirm(r.id, val)}
          size="small"
          className="w-24 text-center font-bold"
        />
      ),
    },
    {
      title: "Mã Đề xuất đã sinh",
      key: "proposals",
      width: 180,
      render: (_, r) => (
        <div className="flex flex-wrap gap-1">
          {r.proposalCodes.length > 0 ? (
            r.proposalCodes.map((c) => (
              <Tag key={c} color="gold" className="font-mono text-[11px]">
                {c}
              </Tag>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/60 italic">
              Chưa tạo mã
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      align: "center",
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<Send className="size-3" />}
          onClick={() => handleGenerateProposal(r)}
          className="text-xs bg-amber-600 hover:bg-amber-500 border-none"
        >
          Tạo Đề xuất TC
        </Button>
      ),
    },
  ]

  // Columns Bảng Đề xuất sinh mã
  const proposalColumns: ColumnsType<ProposalItem> = [
    {
      title: "Mã Đề xuất",
      dataIndex: "code",
      key: "code",
      width: 160,
      render: (code, r) => (
        <span
          className={`font-mono font-bold text-xs ${
            r.type === "RECRUITMENT" ? "text-blue-600" : "text-amber-600"
          }`}
        >
          {code}
        </span>
      ),
    },
    {
      title: "Loại đề xuất",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type) =>
        type === "RECRUITMENT" ? (
          <Tag color="blue" icon={<UserPlus className="size-3" />}>
            Tuyển dụng
          </Tag>
        ) : (
          <Tag color="gold" icon={<ArrowRightLeft className="size-3" />}>
            Thuyên chuyển
          </Tag>
        ),
    },
    {
      title: "Dự án",
      dataIndex: "projectName",
      key: "projectName",
      width: 150,
      render: (name, r) => (
        <div>
          <div className="font-medium text-xs text-foreground">{name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {r.projectCode}
          </div>
        </div>
      ),
    },
    {
      title: "Chức danh",
      dataIndex: "roleName",
      key: "roleName",
      width: 180,
      render: (name) => (
        <span className="font-medium text-xs text-foreground">{name}</span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "targetCount",
      key: "targetCount",
      width: 80,
      align: "center",
      render: (val) => <span className="font-bold text-xs">{val} suất</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (st) => {
        if (st === "CONFIRMED") return <Tag color="success">Đã phê duyệt</Tag>
        if (st === "OPEN") return <Tag color="processing">Chờ phê duyệt</Tag>
        return <Tag color="default">Hoàn thành</Tag>
      },
    },
    {
      title: "Người phê duyệt",
      dataIndex: "approver",
      key: "approver",
      width: 160,
      render: (val) => (
        <span className="text-xs text-muted-foreground">{val || "-"}</span>
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (val) => (
        <span className="text-xs font-mono text-muted-foreground">{val}</span>
      ),
    },
  ]

  const tabItems = [
    {
      key: "recruitment",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <UserPlus className="size-4 text-blue-600" />
          Khuyến nghị Tuyển dụng ({recruitmentList.length})
        </span>
      ),
      children: (
        <div className="flex flex-col gap-3 pt-2">
          <Table<RecommendationItem>
            columns={recruitmentColumns}
            dataSource={recruitmentList}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            className="border border-border/70 rounded-xl overflow-hidden"
          />
        </div>
      ),
    },
    {
      key: "transfer",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <ArrowRightLeft className="size-4 text-amber-600" />
          Khuyến nghị Thuyên chuyển ({transferList.length})
        </span>
      ),
      children: (
        <div className="flex flex-col gap-3 pt-2">
          <Table<RecommendationItem>
            columns={transferColumns}
            dataSource={transferList}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            className="border border-border/70 rounded-xl overflow-hidden"
          />
        </div>
      ),
    },
    {
      key: "proposals",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileCheck2 className="size-4 text-emerald-600" />
          Danh mục Mã Đề xuất Phê duyệt ({proposals.length})
        </span>
      ),
      children: (
        <div className="flex flex-col gap-3 pt-2">
          <Table<ProposalItem>
            columns={proposalColumns}
            dataSource={proposals}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            className="border border-border/70 rounded-xl overflow-hidden"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden bg-card"
        styles={{ body: { padding: "16px 20px" } }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground">
                Kết quả Khuyến nghị & Đề xuất Nguồn lực
              </div>
              <div className="text-base text-muted-foreground">
                Dựa trên Báo cáo định biên:{" "}
                <Tag color="blue" className="font-mono font-bold">
                  {reportCode}
                </Tag>{" "}
                • Phạm vi: <strong>{scopeName}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag color="cyan" className="text-xs font-semibold px-2.5 py-1">
              Trạng thái: Đang rà soát đối soát
            </Tag>
          </div>
        </div>
      </Card>

      <Card
        className="border border-border/70 shadow-xs rounded-xl overflow-hidden bg-card"
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Card>
    </div>
  )
}
