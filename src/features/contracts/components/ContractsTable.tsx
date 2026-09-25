import React from "react"
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  Progress,
  Badge,
} from "antd"
import {
  Compass,
  DollarSign,
  FileCheck2,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  Phone,
  Mail,
} from "lucide-react"
import { ConsultantContract, ContractRole, PaymentMilestone } from "../types"
import { DisciplineType } from "../../deliverables/types"
import { useDmdRole } from "@/core/auth/roleContext"

const { Text } = Typography

interface ContractsTableProps {
  data: ConsultantContract[]
  onOpenPaymentModal: (contract: ConsultantContract, milestone?: PaymentMilestone) => void
  onOpenEvalModal: (contract: ConsultantContract) => void
}

export const ContractsTable: React.FC<ContractsTableProps> = ({
  data,
  onOpenPaymentModal,
  onOpenEvalModal,
}) => {
  const { permissions, currentRole } = useDmdRole()
  const renderRating = (contract: ConsultantContract) => {
    if (contract.evaluations.length === 0) {
      return <Tag color="default">Chưa đánh giá</Tag>
    }

    const latest = contract.evaluations[0]
    const colorMap: Record<string, string> = {
      EXCELLENT: "green",
      GOOD: "blue",
      AVERAGE: "gold",
      POOR: "red",
    }

    return (
      <Tooltip title={`Đánh giá theo NVLG-BMD-SOP01.F1.24a: ${latest.evalNotes}`}>
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onOpenEvalModal(contract)}>
          <Tag color={colorMap[latest.ratingLevel]} className="font-bold text-xs py-0.5">
            Hạng {latest.ratingLevel === "EXCELLENT" ? "A" : latest.ratingLevel === "GOOD" ? "B" : "C"} ({latest.averageScore}/10)
          </Tag>
        </div>
      </Tooltip>
    )
  }

  const columns = [
    {
      title: "Số Hợp Đồng",
      dataIndex: "contractNo",
      key: "contractNo",
      width: 170,
      render: (no: string, record: ConsultantContract) => (
        <div>
          <span className="font-mono text-primary font-bold text-xs">{no}</span>
          <div className="mt-0.5">
            <Tag color={record.consultantRole === "TVTK" ? "geekblue" : "purple"} className="text-[10px] font-semibold py-0 px-1">
              {record.consultantRole === "TVTK" ? "Tư Vấn Thiết Kế" : "Tư Vấn Thẩm Tra"}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Gói Thầu & Đơn Vị Tư Vấn",
      dataIndex: "contractTitle",
      key: "contractTitle",
      render: (title: string, record: ConsultantContract) => (
        <div className="space-y-0.5">
          <div className="font-medium text-xs text-foreground">
            {title}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>Đối tác: <strong className="text-foreground">{record.consultantName}</strong></span>
            <span>•</span>
            <span>Chủ trì: {record.leadArchitect}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Bộ Môn",
      dataIndex: "discipline",
      key: "discipline",
      width: 110,
      render: (disc: DisciplineType) => <Tag color="blue">{disc}</Tag>,
    },
    {
      title: "Giá Trị & Giải Ngân",
      key: "value",
      width: 200,
      render: (_: any, record: ConsultantContract) => {
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">
                {(record.disbursedAmountVnd).toLocaleString("vi-VN")} tr
              </span>
              <span className="text-muted-foreground">
                / {(record.contractValueVnd).toLocaleString("vi-VN")} tr
              </span>
            </div>
            <Progress
              percent={record.disbursementRate}
              size="small"
              strokeColor={record.disbursementRate >= 80 ? "#2db34b" : "#1890ff"}
            />
          </div>
        )
      },
    },
    {
      title: "Đánh Giá Năng Lực (F1.24a)",
      key: "evaluation",
      width: 160,
      render: (_: any, record: ConsultantContract) => renderRating(record),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 130,
      render: (_: any, record: ConsultantContract) => (
        <Space size={2}>
          <Tooltip
            title={
              permissions.canApprovePayment
                ? "Kiểm tra & xác nhận thanh toán đợt (2.5.1)"
                : "Chỉ Trưởng phòng DMD & Ban TGĐ có quyền ký duyệt thanh toán giải ngân."
            }
          >
            <Button
              size="small"
              type="text"
              disabled={!permissions.canApprovePayment}
              icon={<DollarSign size={15} className={permissions.canApprovePayment ? "text-emerald-600" : "text-muted-foreground"} />}
              onClick={() => onOpenPaymentModal(record)}
            />
          </Tooltip>

          <Tooltip title="Đánh giá năng lực đối tác (F1.24a)">
            <Button
              size="small"
              type="text"
              icon={<Award size={15} className="text-amber-500" />}
              onClick={() => onOpenEvalModal(record)}
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
        pagination={{ pageSize: 6, size: "small" }}
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-3 bg-muted/20 border-y border-border text-xs space-y-3">
              <div className="font-semibold text-muted-foreground uppercase text-[11px]">
                Chi tiết các đợt giải ngân hợp đồng ({record.milestones.length} đợt):
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {record.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                      ms.status === "PAID"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : ms.status === "SUBMITTED"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        Đợt {ms.milestoneNo} ({ms.percentage}%)
                      </span>
                      <Tag
                        color={
                          ms.status === "PAID"
                            ? "success"
                            : ms.status === "SUBMITTED"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px] py-0 px-1 font-semibold"
                      >
                        {ms.status === "PAID"
                          ? "Đã thanh toán"
                          : ms.status === "SUBMITTED"
                          ? "Đang duyệt đợt"
                          : "Chưa đến hạn"}
                      </Tag>
                    </div>

                    <div className="text-foreground font-semibold">
                      {ms.amountVnd.toLocaleString("vi-VN")} triệu VNĐ
                    </div>

                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                      Điều kiện: {ms.deliverableCriteria}
                    </div>

                    {ms.invoiceNo && (
                      <div className="text-[10px] font-mono text-primary">
                        Hóa đơn: {ms.invoiceNo}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {record.variations.length > 0 && (
                <div className="border-t border-border pt-2 mt-2">
                  <span className="font-semibold text-purple-600">Hồ sơ phát sinh đã duyệt (RACI 2.5.3): </span>
                  {record.variations.map((v) => (
                    <Tag key={v.id} color="purple" className="text-xs">
                      {v.variationNo}: {v.title} (+{v.amountVnd} tr)
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          ),
        }}
        size="middle"
      />
    </div>
  )
}
