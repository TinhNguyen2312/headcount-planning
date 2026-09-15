/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Spin } from "antd"
import React, { useEffect, useMemo, useState } from "react"

import { planQueries } from "@/hooks/server/plans"
import { useUI } from "@/hooks/useUI"
import type { PhaseInput, PhaseResponse, PlanCreatePayload } from "@/types"

import { CascadeShiftModal } from "./CascadeShiftModal"
import { PhaseModal } from "./PhaseModal"
import { PhaseTable } from "./PhaseTable"
import { PhaseTableToolbar } from "./PhaseTableToolbar"
import { PlanDeadlineAlert } from "./PlanDeadlineAlert"
import { PlanEmptyState } from "./PlanEmptyState"
import { PlanVersionHeader } from "./PlanVersionHeader"
import { PlanVersionModal } from "./PlanVersionModal"
import type { ProjectPlanManagementProps } from "./types"
import { usePhaseMetrics } from "./usePhaseMetrics"

export const ProjectPlanManagement: React.FC<ProjectPlanManagementProps> = ({
  projectId,
  projectStartDate,
  projectEndDate,
  viewOnly = false,
}) => {
  const { message } = useUI()

  // Queries & State
  const { data: plansList = [], isLoading: isListLoading } =
    planQueries.useList(projectId)

  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>()

  // Auto-select ACTIVE plan or first plan
  useEffect(() => {
    if (plansList.length > 0) {
      if (!selectedPlanId || !plansList.some((p) => p.id === selectedPlanId)) {
        const activePlan = plansList.find((p) => p.status === "ACTIVE")
        setSelectedPlanId(activePlan ? activePlan.id : plansList[0].id)
      }
    } else {
      setSelectedPlanId(undefined)
    }
  }, [plansList, selectedPlanId])

  const { data: planDetail, isLoading: isDetailLoading } =
    planQueries.useDetail(projectId, selectedPlanId)

  // Local working copy of phases for currently selected plan
  const [workingPhases, setWorkingPhases] = useState<PhaseResponse[]>([])
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (planDetail?.phases) {
      setWorkingPhases(planDetail.phases)
      setIsDirty(false)
    } else {
      setWorkingPhases([])
      setIsDirty(false)
    }
  }, [planDetail])

  // Mutations
  const createPlanMutation = planQueries.useCreate(projectId)
  const updatePlanMutation = planQueries.useUpdate(projectId)
  const deletePlanMutation = planQueries.useDelete(projectId)
  const activatePlanMutation = planQueries.useActivate(projectId)

  // Modals state
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const [cloneSourcePlanId, setCloneSourcePlanId] = useState<
    number | undefined
  >()
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false)
  const [editingPhase, setEditingPhase] = useState<PhaseResponse | null>(null)
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)

  // Milestone IDs already used in this plan
  const existingMilestoneIds = useMemo(() => {
    return workingPhases.map((p) => p.milestoneId)
  }, [workingPhases])

  // Computed phase metrics
  const { phasesWithMetrics, deadlineWarnings } = usePhaseMetrics(
    workingPhases,
    projectStartDate,
    projectEndDate,
  )

  // Handlers for Phase operations
  const handleSavePhase = (phaseInput: PhaseInput) => {
    setWorkingPhases((prev) => {
      let updated: PhaseResponse[]
      if (phaseInput.id) {
        // Edit existing
        updated = prev.map((p) =>
          p.id === phaseInput.id
            ? {
                ...p,
                orderIndex: phaseInput.orderIndex,
                milestoneId: phaseInput.milestoneId,
                startMonth: phaseInput.startMonth,
                durationMonths: phaseInput.durationMonths,
                isAnchor: Boolean(phaseInput.isAnchor),
                description: phaseInput.description || null,
              }
            : p,
        )
      } else {
        // Add new
        const newPhase: PhaseResponse = {
          id: -Date.now(), // Temporary negative ID for new items
          planId: selectedPlanId!,
          orderIndex: phaseInput.orderIndex,
          milestoneId: phaseInput.milestoneId,
          startMonth: phaseInput.startMonth,
          durationMonths: phaseInput.durationMonths,
          isAnchor: Boolean(phaseInput.isAnchor),
          description: phaseInput.description || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        updated = [...prev, newPhase]
      }
      return updated.sort((a, b) => a.orderIndex - b.orderIndex)
    })
    setIsDirty(true)
  }

  const handleDeletePhase = (phaseId: number) => {
    setWorkingPhases((prev) => {
      const filtered = prev.filter((p) => p.id !== phaseId)
      // Re-index remaining
      return filtered.map((p, idx) => ({ ...p, orderIndex: idx + 1 }))
    })
    setIsDirty(true)
  }

  const handleMovePhase = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= workingPhases.length) return

    setWorkingPhases((prev) => {
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[targetIndex]
      arr[targetIndex] = temp
      // Reassign orderIndex
      return arr.map((p, idx) => ({ ...p, orderIndex: idx + 1 }))
    })
    setIsDirty(true)
  }

  const handleApplyCascadeShift = (
    fromOrderIndex: number,
    deltaMonths: number,
  ) => {
    setWorkingPhases((prev) => {
      return prev.map((p) => {
        if (p.orderIndex >= fromOrderIndex) {
          return {
            ...p,
            startMonth: Math.max(1, p.startMonth + deltaMonths),
          }
        }
        return p
      })
    })
    setIsDirty(true)
    message.success(
      `Đã tịnh tiến các giai đoạn từ STT ${fromOrderIndex} trở đi thêm ${deltaMonths > 0 ? `+${deltaMonths}` : deltaMonths} tháng`,
    )
  }

  // Save changes to current plan
  const handleSavePlanChanges = async () => {
    if (!selectedPlanId) return
    try {
      const payloadPhases: PhaseInput[] = workingPhases.map((p) => ({
        id: p.id > 0 ? p.id : undefined,
        orderIndex: p.orderIndex,
        milestoneId: p.milestoneId,
        startMonth: p.startMonth,
        durationMonths: p.durationMonths,
        isAnchor: p.isAnchor,
        description: p.description,
      }))

      await updatePlanMutation.mutateAsync({
        planId: selectedPlanId,
        data: {
          phases: payloadPhases,
        },
      })
      setIsDirty(false)
    } catch {
      // Handled in onError
    }
  }

  // Plan version actions
  const handleCreatePlan = async (payload: PlanCreatePayload) => {
    const res = await createPlanMutation.mutateAsync(payload)
    if (res.result?.id) {
      setSelectedPlanId(res.result.id)
    }
  }

  const handleActivatePlan = async () => {
    if (!selectedPlanId) return
    await activatePlanMutation.mutateAsync(selectedPlanId)
  }

  const handleDeletePlan = async () => {
    if (!selectedPlanId) return
    await deletePlanMutation.mutateAsync(selectedPlanId)
    setSelectedPlanId(undefined)
  }

  if (isListLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spin tip="Đang tải kế hoạch dự án..." />
      </div>
    )
  }

  if (plansList.length === 0) {
    return (
      <>
        <PlanEmptyState
          viewOnly={viewOnly}
          onCreateFirstPlan={() => {
            setCloneSourcePlanId(undefined)
            setIsVersionModalOpen(true)
          }}
        />

        <PlanVersionModal
          open={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          onSubmit={handleCreatePlan}
          existingPlans={plansList}
          loading={createPlanMutation.isPending}
          defaultClonePlanId={cloneSourcePlanId}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar: Version Selection & Primary Actions */}
      <PlanVersionHeader
        plansList={plansList}
        selectedPlanId={selectedPlanId}
        planDetail={planDetail}
        projectStartDate={projectStartDate}
        projectEndDate={projectEndDate}
        viewOnly={viewOnly}
        workingPhasesCount={workingPhases.length}
        isActivating={activatePlanMutation.isPending}
        isDeleting={deletePlanMutation.isPending}
        onSelectPlan={(id) => setSelectedPlanId(id)}
        onActivatePlan={handleActivatePlan}
        onClonePlan={() => {
          setCloneSourcePlanId(selectedPlanId)
          setIsVersionModalOpen(true)
        }}
        onCreatePlan={() => {
          setCloneSourcePlanId(undefined)
          setIsVersionModalOpen(true)
        }}
        onDeletePlan={handleDeletePlan}
      />

      {/* Deadline Warnings Banner */}
      <PlanDeadlineAlert
        deadlineWarnings={deadlineWarnings}
        projectEndDate={projectEndDate}
      />

      {/* Action Bar for Phases */}
      <PhaseTableToolbar
        phasesCount={workingPhases.length}
        isDirty={isDirty}
        viewOnly={viewOnly}
        isSaving={updatePlanMutation.isPending}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onAddPhase={() => {
          setEditingPhase(null)
          setIsPhaseModalOpen(true)
        }}
        onSavePlanChanges={handleSavePlanChanges}
      />

      {/* Phases Table */}
      <PhaseTable
        loading={isDetailLoading}
        phases={phasesWithMetrics}
        viewOnly={viewOnly}
        onMovePhase={handleMovePhase}
        onEditPhase={(phase) => {
          setEditingPhase(phase)
          setIsPhaseModalOpen(true)
        }}
        onDeletePhase={handleDeletePhase}
      />

      {/* Phase Add/Edit Modal */}
      <PhaseModal
        open={isPhaseModalOpen}
        onClose={() => {
          setIsPhaseModalOpen(false)
          setEditingPhase(null)
        }}
        onSave={handleSavePhase}
        initialPhase={editingPhase}
        existingMilestoneIds={existingMilestoneIds}
        projectStartDate={projectStartDate}
        defaultOrderIndex={workingPhases.length + 1}
      />

      {/* Plan Version Create / Clone Modal */}
      <PlanVersionModal
        open={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onSubmit={handleCreatePlan}
        existingPlans={plansList}
        loading={createPlanMutation.isPending}
        defaultClonePlanId={cloneSourcePlanId}
      />

      {/* Cascade Delta Shift Modal */}
      <CascadeShiftModal
        open={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        phases={workingPhases}
        onApplyShift={handleApplyCascadeShift}
      />
    </div>
  )
}
