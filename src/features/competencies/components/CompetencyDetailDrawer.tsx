import React from "react"
import { Drawer, Tag, Typography, Space, Divider, Button, List } from "antd"
import {
  FileText,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Target,
  FileSpreadsheet,
} from "lucide-react"
import type { SubCompetency } from "../types"

const { Title, Text, Paragraph } = Typography

interface CompetencyDetailDrawerProps {
  competency: SubCompetency | null
  visible: boolean
  onClose: () => void
}

export const CompetencyDetailDrawer: React.FC<CompetencyDetailDrawerProps> = ({
  competency,
  visible,
  onClose,
}) => {
  if (!competency) return null

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Tag color="green" className="font-mono font-bold text-sm m-0">
            NV {competency.code}
          </Tag>
          <span className="font-bold text-base text-foreground truncate">
            {competency.name}
          </span>
        </div>
      }
      open={visible}
      onClose={onClose}
      width={560}
      extra={
        <Tag color={competency.raciRole === "R" ? "success" : "error"} className="font-bold">
          RACI: {competency.raciRole === "R" ? "Responsible (Thực hiện)" : "Accountable (Chịu trách nhiệm)"}
        </Tag>
      }
    >
      <div className="space-y-5">
        {/* Group Banner */}
        <div className="p-3 rounded-lg bg-muted/60 border border-border">
          <div className="text-xs text-muted-foreground uppercase font-semibold">
            Thuộc Nhóm Nghiệp Vụ Chính:
          </div>
          <div className="font-bold text-sm text-foreground mt-0.5">
            {competency.groupTitle}
          </div>
        </div>

        {/* Detailed Scope */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Target size={14} className="text-primary" />
            Mô Tả Phạm Vi Công Việc Chi Tiết
          </h4>
          <div className="p-3.5 rounded-lg bg-card border border-border text-sm leading-relaxed text-foreground">
            {competency.detailedScope}
          </div>
        </div>

        {/* Key Deliverable */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Đầu Ra / Sản Phẩm Nghiệm Thu Bắt Buộc
          </h4>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            {competency.keyDeliverables}
          </div>
        </div>

        {/* SOP & Forms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
            <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <FileText size={13} className="text-blue-500" />
              Quy Trình SOP Áp Dụng
            </div>
            <div className="font-mono text-xs font-bold text-foreground">
              {competency.sopRef}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
            <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <FileSpreadsheet size={13} className="text-amber-500" />
              Tần Suất Thực Hiện
            </div>
            <div className="text-xs font-bold text-foreground">
              {competency.frequency}
            </div>
          </div>
        </div>

        {/* Standard Forms */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Mẫu Biểu Tiêu Chuẩn Đi Kèm
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {competency.standardForms.map((form, idx) => (
              <Tag key={idx} color="blue" className="font-mono text-xs py-1 px-2 m-0">
                {form}
              </Tag>
            ))}
          </div>
        </div>

        {/* Applicable Stages */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Layers size={14} className="text-primary" />
            Cổng Stage-Gate Áp Dụng ({competency.applicableStages.length} Cổng)
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {competency.applicableStages.map((stage) => (
              <Tag key={stage} color="geekblue" className="font-mono font-bold text-xs py-0.5 px-2 m-0">
                Cổng {stage}
              </Tag>
            ))}
          </div>
        </div>

        {/* Coordinating Departments */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Users size={14} className="text-primary" />
            Phòng Ban Phối Hợp & Tiếp Nhận
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {competency.coordinatingDepts.map((dept) => (
              <span
                key={dept}
                className="inline-flex items-center text-xs font-semibold bg-muted px-2.5 py-1 rounded-md text-foreground border border-border"
              >
                {dept}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
