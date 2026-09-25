import React from "react"
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  Badge,
  Popconfirm,
  message,
} from "antd"
import {
  FileText,
  Eye,
  Download,
  History,
  Stamp,
  Copy,
  Share2,
  FileCode,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { DeliverableItem, DisciplineType, DeliverableStatus } from "../types"

const { Text } = Typography

interface DeliverablesTableProps {
  data: DeliverableItem[]
  onViewHistory: (item: DeliverableItem) => void
  onHandoverItem: (item: DeliverableItem) => void
  onCopyCode: (code: string) => void
}

export const DeliverablesTable: React.FC<DeliverablesTableProps> = ({
  data,
  onViewHistory,
  onHandoverItem,
  onCopyCode,
}) => {
  // Bộ màu cho từng bộ môn
  const getDisciplineColor = (disc: DisciplineType): string => {
    const map: Record<DisciplineType, string> = {
      ARC: "blue",
      STR: "cyan",
      MEP: "orange",
      LND: "green",
      INF: "purple",
      PLN: "magenta",
      INT: "gold",
    }
    return map[disc] || "default"
  }

  // Tên tiếng Việt của bộ môn
  const getDisciplineName = (disc: DisciplineType): string => {
    const map: Record<DisciplineType, string> = {
      ARC: "Kiến trúc",
      STR: "Kết cấu",
      MEP: "Cơ điện & PCCC",
      LND: "Cảnh quan",
      INF: "Hạ tầng kỹ thuật",
      PLN: "Quy hoạch 1/500",
      INT: "Nội thất Fitout",
    }
    return map[disc] || disc
  }

  // Render trạng thái hồ sơ
  const renderStatus = (status: DeliverableStatus) => {
    switch (status) {
      case "AFC_ISSUED":
        return (
          <Tag color="success" className="font-semibold flex items-center gap-1 w-fit">
            <Stamp size={12} />
            Đã phát hành AFC
          </Tag>
        )
      case "AM_APPROVED":
        return (
          <Tag color="green" className="font-medium flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} />
            Đã duyệt nội bộ (AM)
          </Tag>
        )
      case "CQA_APPRAISAL":
        return (
          <Tag color="warning" className="font-medium flex items-center gap-1 w-fit">
            <Clock size={12} />
            Thẩm định CQA / QSB
          </Tag>
        )
      case "CQNN_SUBMITTED":
        return (
          <Tag color="geekblue" className="font-medium flex items-center gap-1 w-fit">
            <Building size={12} />
            Đã nộp Sở Xây Dựng
          </Tag>
        )
      case "INTERNAL_REVIEW":
        return (
          <Tag color="processing" className="font-medium flex items-center gap-1 w-fit">
            Đang soát xét nội bộ
          </Tag>
        )
      case "DRAFT":
        return <Tag color="default">Dự thảo TVTK</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  // Các cột của bảng
  const columns = [
    {
      title: "Mã Bản Vẽ (REG01)",
      dataIndex: "drawingCode",
      key: "drawingCode",
      width: 210,
      render: (code: string) => (
        <div className="flex items-center gap-1.5 group">
          <span className="font-mono font-bold text-xs text-primary">{code}</span>
          <button
            type="button"
            onClick={() => onCopyCode(code)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary p-0.5"
            title="Sao chép mã"
          >
            <Copy size={12} />
          </button>
        </div>
      ),
    },
    {
      title: "Tên Hồ Sơ / Bản Vẽ",
      dataIndex: "drawingName",
      key: "drawingName",
      render: (name: string, record: DeliverableItem) => (
        <div className="space-y-0.5">
          <div className="font-medium text-xs text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => onViewHistory(record)}>
            {name}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>
              TVTK: <strong className="text-foreground font-normal">{record.leadConsultant}</strong>
            </span>
            <span>•</span>
            <span>Số bản vẽ: <strong className="text-foreground">{record.sheetCount} trang</strong></span>
            {record.scale && (
              <>
                <span>•</span>
                <span>Tỷ lệ: {record.scale}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Bộ Môn",
      dataIndex: "discipline",
      key: "discipline",
      width: 140,
      render: (disc: DisciplineType) => (
        <Tag color={getDisciplineColor(disc)} className="font-medium text-xs">
          {disc} - {getDisciplineName(disc)}
        </Tag>
      ),
    },
    {
      title: "Giai Đoạn SOP09",
      dataIndex: "stageCode",
      key: "stageCode",
      width: 160,
      render: (stage: string, record: DeliverableItem) => (
        <div>
          <span className="text-xs font-medium text-foreground">{stage}</span>
          <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
            {record.packageCode}
          </div>
        </div>
      ),
    },
    {
      title: "Phiên Bản",
      dataIndex: "currentRevision",
      key: "currentRevision",
      width: 130,
      render: (rev: string, record: DeliverableItem) => {
        const isAfc = record.status === "AFC_ISSUED" || rev.includes("AFC")
        const isModified = rev.includes("A") || rev.includes("B") || record.revisions.length > 2

        return (
          <Tooltip title={`Nhấn để xem toàn bộ lịch sử ${record.revisions.length} phiên bản`}>
            <button
              type="button"
              onClick={() => onViewHistory(record)}
              className="text-left cursor-pointer group"
            >
              <Tag
                color={isAfc ? "success" : "blue"}
                className="font-mono text-xs font-bold px-2 py-0.5 group-hover:scale-105 transition-transform"
              >
                {rev}
              </Tag>
              {record.revisions.length > 1 && (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <History size={10} />
                  <span>{record.revisions.length} revs</span>
                </div>
              )}
            </button>
          </Tooltip>
        )
      },
    },
    {
      title: "Trạng Thái Kiểm Soát",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: DeliverableStatus) => renderStatus(status),
    },
    {
      title: "Phân Phối (SOP09)",
      key: "handovers",
      width: 140,
      render: (_: any, record: DeliverableItem) => {
        const pcd = record.handovers.find((h) => h.department === "PCD")
        const ptc = record.handovers.find((h) => h.department === "PTC")
        const qsb = record.handovers.find((h) => h.department === "QSB")
        const nvg = record.handovers.find((h) => h.department === "NOVAGEN")

        return (
          <div className="flex items-center gap-1.5">
            <Tooltip title={`PCD (Hiện trường): ${pcd ? pcd.status : "Chưa gửi"}`}>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  pcd?.status === "ACKNOWLEDGED"
                    ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                    : pcd?.status === "SENT"
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                PCD
              </span>
            </Tooltip>

            <Tooltip title={`PTC (Đấu thầu): ${ptc ? ptc.status : "Chưa gửi"}`}>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  ptc?.status === "ACKNOWLEDGED"
                    ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                    : ptc?.status === "SENT"
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                PTC
              </span>
            </Tooltip>

            <Tooltip title={`QSB (Ngân sách): ${qsb ? qsb.status : "Chưa gửi"}`}>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  qsb?.status === "ACKNOWLEDGED"
                    ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                    : qsb?.status === "SENT"
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                QSB
              </span>
            </Tooltip>

            <Tooltip title={`Novagen Lưu trữ: ${nvg ? "Đã lưu trữ" : "Chưa đồng bộ"}`}>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  nvg
                    ? "bg-purple-500/20 text-purple-600 border border-purple-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                NVG
              </span>
            </Tooltip>
          </div>
        )
      },
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 110,
      render: (_: any, record: DeliverableItem) => (
        <Space size={2}>
          <Tooltip title="Xem lịch sử phiên bản">
            <Button
              size="small"
              type="text"
              icon={<History size={15} />}
              onClick={() => onViewHistory(record)}
            />
          </Tooltip>

          <Tooltip title="Bàn giao phát hành (SOP09)">
            <Button
              size="small"
              type="text"
              icon={<Share2 size={15} className="text-primary" />}
              onClick={() => onHandoverItem(record)}
            />
          </Tooltip>

          <Tooltip title="Tải xuống tập hồ sơ (PDF/DWG)">
            <Button
              size="small"
              type="text"
              icon={<Download size={15} />}
              onClick={() => message.info(`Đang tải tập tin: ${record.revisions[0]?.fileName || record.drawingCode}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          pageSize: 8,
          showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} hồ sơ`,
          size: "small",
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-3 bg-muted/20 border-y border-border text-xs space-y-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-muted-foreground">Đường dẫn Novagen / ACC:</span>
                  <div className="font-mono text-foreground mt-0.5 text-[11px] truncate">
                    {record.novagenFolder}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Chuyên gia DMD phụ trách:</span>
                  <div className="font-semibold text-foreground mt-0.5">
                    {record.dmdPic}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Lãnh đạo kiểm soát:</span>
                  <div className="font-semibold text-foreground mt-0.5">
                    {record.dmdManager}
                  </div>
                </div>
              </div>

              {record.revisions[0]?.changeReason && (
                <div className="border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground font-semibold">Ghi chú phiên bản hiện tại ({record.currentRevision}): </span>
                  <span className="text-foreground">{record.revisions[0].changeReason}</span>
                  {record.revisions[0].attachedForm && (
                    <Tag color="cyan" className="ml-2 text-[10px]">
                      {record.revisions[0].attachedForm}
                    </Tag>
                  )}
                </div>
              )}
            </div>
          ),
        }}
        size="middle"
        className="deliverables-table"
      />
    </div>
  )
}
