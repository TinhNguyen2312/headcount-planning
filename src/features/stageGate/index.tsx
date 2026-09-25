import { Card, Segmented, Space, Tag, Typography } from "antd"
import { Grid, ListOrdered } from "lucide-react"
import React, { useState } from "react"
import { GateReviewChecklist } from "./components/GateReviewChecklist"
import { InteractiveMatrixView } from "./components/InteractiveMatrixView"
import { StageGateNavigator } from "./components/StageGateNavigator"
import { StepDetailDrawer } from "./components/StepDetailDrawer"
import { WorkflowProcessView } from "./components/WorkflowProcessView"
import { stageGateData as initialData } from "./data/stageGateData"
import type { DesignProcessMode, StageDefinition, WorkflowStep } from "./types"

const { Title, Text } = Typography

export const StageGateFeature: React.FC = () => {
  const [stages, setStages] = useState<StageDefinition[]>(initialData.stages)
  const [activeStageCode, setActiveStageCode] = useState<string>("STAGE_4") // Default to Stage 4 (TKCS)
  const [designMode, setDesignMode] = useState<DesignProcessMode>("3_STEP")
  const [activeViewMode, setActiveViewMode] = useState<"PROCESS" | "MATRIX">(
    "PROCESS",
  )

  // Drawer state
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)

  // Current active stage
  const currentStage =
    stages.find((s) => s.stage_code === activeStageCode) || stages[0]

  // Handler for checklist toggle
  const handleToggleChecklistItem = (itemId: string) => {
    setStages((prev) =>
      prev.map((stg) => {
        if (stg.stage_code !== activeStageCode) return stg
        const updatedChecklist = stg.gateChecklist?.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              isCompleted: !item.isCompleted,
              completedAt: !item.isCompleted
                ? new Date().toLocaleDateString("vi-VN")
                : undefined,
            }
          }
          return item
        })
        return {
          ...stg,
          gateChecklist: updatedChecklist,
        }
      }),
    )
  }

  // Handler for gate approval
  const handleApproveGate = (stageCode: string) => {
    setStages((prev) =>
      prev.map((stg, idx) => {
        if (stg.stage_code === stageCode) {
          return { ...stg, gateStatus: "APPROVED" }
        }
        // Unlock next stage if it was locked
        const currentIdx = prev.findIndex((s) => s.stage_code === stageCode)
        if (idx === currentIdx + 1 && stg.gateStatus === "LOCKED") {
          return { ...stg, gateStatus: "IN_PROGRESS" }
        }
        return stg
      }),
    )
  }

  // Handler for step status update in 2D Matrix
  const handleUpdateStepStatus = (
    stepStt: string,
    status: "TODO" | "IN_PROGRESS" | "DONE",
  ) => {
    setStages((prev) =>
      prev.map((stg) => {
        if (stg.stage_code !== activeStageCode) return stg
        const updatedMatrix = stg.dmd_matrix_steps.map((m) => {
          if (m.stt === stepStt) {
            return { ...m, status }
          }
          return m
        })
        return { ...stg, dmd_matrix_steps: updatedMatrix }
      }),
    )
  }

  const handleOpenStepDetail = (step: WorkflowStep) => {
    setSelectedStep(step)
    setDrawerVisible(true)
  }

  return (
    <div className="space-y-4">
      {/* 1. Stage-Gate Pipeline Navigator */}
      <StageGateNavigator
        stages={stages}
        activeStageCode={activeStageCode}
        onSelectStage={setActiveStageCode}
        designMode={designMode}
        onChangeDesignMode={setDesignMode}
      />

      {/* 2. Gate Review Checklist Panel */}
      <GateReviewChecklist
        stage={currentStage}
        onToggleChecklistItem={handleToggleChecklistItem}
        onApproveGate={handleApproveGate}
      />

      {/* 3. Main Workspace with Dual-View Switcher */}
      <Card className="border-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-white font-mono font-bold text-xs flex items-center justify-center">
                {currentStage.sop_stt}
              </span>
              <Title level={5} className="!mb-0 text-foreground">
                {currentStage.stage_name}
              </Title>
              <Tag color="blue" className="font-mono text-xs">
                Mẫu: {currentStage.official_form}
              </Tag>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Gồm <strong>{currentStage.workflow_steps.length}</strong> bước quy
              trình SOP09 và{" "}
              <strong>{currentStage.dmd_matrix_steps.length}</strong> bước công
              việc chuẩn hóa DMD
            </div>
          </div>

          {/* View Mode Toggle */}
          <Space size="middle">
            <Segmented
              value={activeViewMode}
              onChange={(val) => setActiveViewMode(val as "PROCESS" | "MATRIX")}
              options={[
                {
                  label: (
                    <span className="flex items-center gap-1.5 px-1 py-0.5">
                      <ListOrdered size={15} />
                      Trình Tự Quy Trình (SOP09)
                    </span>
                  ),
                  value: "PROCESS",
                },
                {
                  label: (
                    <span className="flex items-center gap-1.5 px-1 py-0.5">
                      <Grid size={15} />
                      Ma Trận Nghiệp Vụ 2 Chiều (2D Matrix)
                    </span>
                  ),
                  value: "MATRIX",
                },
              ]}
            />
          </Space>
        </div>

        {/* View Mode Content */}
        {activeViewMode === "PROCESS" ? (
          <WorkflowProcessView
            steps={currentStage.workflow_steps}
            stageName={currentStage.stage_name}
            onSelectStep={handleOpenStepDetail}
          />
        ) : (
          <InteractiveMatrixView
            steps={currentStage.dmd_matrix_steps}
            competencies={initialData.dmd_competencies}
            stageName={currentStage.stage_name}
            onUpdateStepStatus={handleUpdateStepStatus}
          />
        )}
      </Card>

      {/* Step Detail Drawer */}
      <StepDetailDrawer
        step={selectedStep}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  )
}
