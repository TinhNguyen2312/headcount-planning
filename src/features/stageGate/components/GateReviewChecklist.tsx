import React from "react"
import { Card, Checkbox, Tag, Button, Space, Typography, Tooltip, message } from "antd"
import { ShieldCheck, CheckCircle2, ArrowRight, FileText, Building2, Check } from "lucide-react"
import type { StageDefinition } from "../types"

interface GateReviewChecklistProps {
  stage: StageDefinition
  onToggleChecklistItem: (itemId: string) => void
  onApproveGate: (stageCode: string) => void
}

export const GateReviewChecklist: React.FC<GateReviewChecklistProps> = ({
  stage,
  onToggleChecklistItem,
  onApproveGate,
}) => {
  const items = stage.gateChecklist || []
  const allCompleted = items.length > 0 && items.every((item) => item.isCompleted)
  const isApproved = stage.gateStatus === "APPROVED"

  return (
    <Card size="small" className="border-border shadow-xs mb-3 bg-card/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Điều Kiện Khóa Cổng (Stage-Gate Review)
            </div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>{stage.stage_name}</span>
              <Tag color="green" className="font-mono text-[11px] font-semibold">
                Mẫu: {stage.official_form}
              </Tag>
            </div>
          </div>
        </div>

        <Space>
          {isApproved ? (
            <Tag color="success" className="text-xs py-1 px-2.5 flex items-center gap-1 font-semibold">
              <CheckCircle2 size={13} /> Giai Đoạn Đã Nghiệm Thu Mở Cổng
            </Tag>
          ) : (
            <Button
              type="primary"
              size="middle"
              disabled={!allCompleted}
              icon={<ArrowRight size={14} />}
              onClick={() => {
                onApproveGate(stage.stage_code)
                message.success(`Đã nghiệm thu và mở cổng cho ${stage.stage_name}!`)
              }}
            >
              Nghiệm Thu Mở Cổng Giai Đoạn Kế Tiếp
            </Button>
          )}
        </Space>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-2.5">
          {stage.description} Căn cứ theo <strong>SOP09 mục {stage.docx_section}</strong>, cần hoàn tất các điều kiện sau để thông qua cổng:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleChecklistItem(item.id)}
              className={`p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2.5 cursor-pointer select-none ${
                item.isCompleted
                  ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <Checkbox
                  checked={item.isCompleted}
                  onChange={() => {}} // Click handled by container
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground leading-snug">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
                    <FileText size={11} className="text-primary shrink-0" />
                    <span className="truncate">Hồ sơ: <strong>{item.requiredDoc}</strong></span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                    <Building2 size={11} className="text-blue-500 shrink-0" />
                    <span className="truncate">Đơn vị: <span className="font-medium text-foreground">{item.department}</span></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {item.isCompleted ? (
                  <Tag color="green" className="text-[10px] mr-0 font-medium border-0">
                    <Check size={11} className="inline mr-0.5" />
                    {item.completedAt || "Đạt"}
                  </Tag>
                ) : (
                  <Tag color="warning" className="text-[10px] mr-0 font-medium border-0">
                    Chờ xử lý
                  </Tag>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
