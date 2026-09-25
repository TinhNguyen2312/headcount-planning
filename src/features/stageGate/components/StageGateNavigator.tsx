import { Card, Progress, Segmented, Tag, Tooltip } from "antd"
import { AlertCircle, CheckCircle2, Clock, Lock } from "lucide-react"
import React from "react"
import type { DesignProcessMode, StageDefinition } from "../types"

interface StageGateNavigatorProps {
  stages: StageDefinition[]
  activeStageCode: string
  onSelectStage: (code: string) => void
  designMode: DesignProcessMode
  onChangeDesignMode: (mode: DesignProcessMode) => void
}

export const StageGateNavigator: React.FC<StageGateNavigatorProps> = ({
  stages,
  activeStageCode,
  onSelectStage,
  designMode,
  onChangeDesignMode,
}) => {
  // Filter stages if 2-step mode is selected (skip Stage 6 TKKT)
  const displayStages = stages.filter((stg) => {
    if (designMode === "2_STEP" && stg.stage_code === "STAGE_6") {
      return false
    }
    return true
  })

  // Extract short form code (e.g. "NVLG-DMD-SOP09.F03" -> "F03")
  const getShortFormCode = (formStr: string) => {
    if (!formStr) return ""
    const match = formStr.match(/F\d+/)
    if (match) return match[0]
    if (formStr.includes("SOP05")) return "F.05"
    return formStr.replace("NVLG-DMD-", "")
  }

  const getStageShortCode = (code: string) => {
    switch (code) {
      case "STAGE_1":
        return "G1"
      case "STAGE_2":
        return "G2"
      case "STAGE_3":
        return "G3"
      case "STAGE_4":
        return "G4"
      case "STAGE_5":
        return designMode === "2_STEP" ? "G5 (2B)" : "G5"
      case "STAGE_6":
        return "G6 (3B)"
      case "STAGE_7":
        return "G7 (3B)"
      case "SOP05":
        return "TTSP"
      default:
        return code
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} className="shrink-0" /> Đã Mở Cổng
          </span>
        )
      case "IN_PROGRESS":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <Clock size={12} className="shrink-0 animate-spin" /> Đang Thực Hiện
          </span>
        )
      case "REVIEW_PENDING":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle size={12} className="shrink-0" /> Chờ Duyệt Cổng
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Lock size={11} className="shrink-0" /> Đang Khóa
          </span>
        )
    }
  }

  return (
    <Card size="small" className="border-border shadow-xs mb-3">
      {/* Header controls: Design mode switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-border">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Giai Đoạn Quản Lý Thiết Kế
          </div>
          <div className="text-sm font-bold text-foreground">
            Tiến Trình Kiểm Soát Tuần Tự & Điều Kiện Mở Cổng Giai Đoạn
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground font-medium">
            Chế độ thiết kế:
          </span>
          <Segmented
            size="small"
            value={designMode}
            onChange={(val) => onChangeDesignMode(val as DesignProcessMode)}
            options={[
              { label: "Thiết Kế 3 Bước (Chuẩn)", value: "3_STEP" },
              { label: "Thiết Kế 2 Bước (Rút gọn)", value: "2_STEP" },
            ]}
          />
        </div>
      </div>

      {/* Stage-Gate Horizontal Scrollable Pipeline */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {displayStages.map((stage) => {
          const isActive = stage.stage_code === activeStageCode
          const isApproved = stage.gateStatus === "APPROVED"
          const isInProgress = stage.gateStatus === "IN_PROGRESS"

          // Calculate checklist completion percentage
          const checklistTotal = stage.gateChecklist?.length || 0
          const checklistDone =
            stage.gateChecklist?.filter((c) => c.isCompleted).length || 0
          const checklistPercent =
            checklistTotal > 0
              ? Math.round((checklistDone / checklistTotal) * 100)
              : 0
          const shortForm = getShortFormCode(stage.official_form)

          return (
            <div
              key={stage.stage_code}
              onClick={() => onSelectStage(stage.stage_code)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none min-w-[135px] max-w-[160px] flex-1 overflow-hidden ${
                isActive
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/50"
                  : "border-border hover:border-primary/40 bg-card/60 hover:bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-md font-mono font-bold flex items-center justify-center text-xs shrink-0 ${
                      isActive
                        ? "bg-primary text-white"
                        : isApproved
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : isInProgress
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getStageShortCode(stage.stage_code)}
                  </span>

                  {shortForm && (
                    <Tooltip
                      title={`Biểu mẫu đệ trình: ${stage.official_form}`}
                    >
                      <Tag
                        color={isActive ? "green" : "default"}
                        className="text-[10px] font-mono font-bold px-1 py-0 mr-0 border-0 bg-muted/80 text-foreground"
                      >
                        {shortForm}
                      </Tag>
                    </Tooltip>
                  )}
                </div>

                <div
                  className={`text-[12px] font-semibold leading-snug line-clamp-2 h-8 ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                  title={stage.stage_name}
                >
                  {stage.stage_name.replace(/\(.*\)/, "").trim()}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border/60">
                <div className="mb-1 truncate">
                  {getStatusBadge(stage.gateStatus)}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Điều kiện:</span>
                  <span className="font-semibold text-foreground">
                    {checklistDone}/{checklistTotal}
                  </span>
                </div>
                <Progress
                  percent={checklistPercent}
                  size="small"
                  showInfo={false}
                  strokeColor={
                    isApproved
                      ? "#2db34b"
                      : isInProgress
                        ? "#3b82f6"
                        : "#94a3b8"
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
