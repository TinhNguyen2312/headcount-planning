/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Spin } from "antd"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import UnsavedChangesModal from "@/components/Common/UnsavedChangesModal"
import { planQueries } from "@/hooks/server/plans"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import type { PhaseInput, PhaseResponse, PlanCreatePayload } from "@/types"

import { PhaseModal } from "./PhaseModal"
import { PhaseTable } from "./PhaseTable"
import { PhaseTableToolbar } from "./PhaseTableToolbar"
import { PlanEmptyState } from "./PlanEmptyState"
import { PlanVersionHeader } from "./PlanVersionHeader"
import { PlanVersionModal } from "./PlanVersionModal"
import type { ProjectPlanManagementProps } from "./types"
import { usePhaseMetrics } from "./usePhaseMetrics"

interface PhaseComparable {
  id?: number
  orderIndex: number
  milestoneId: number
  startDate: string
  endDate: string
  durationMonths?: number
  description?: string | null
}

const getComparablePhases = (phases: PhaseResponse[]): PhaseComparable[] => {
  return phases.map((p) => ({
    id: p.id > 0 ? p.id : undefined,
    orderIndex: p.orderIndex,
    milestoneId: p.milestoneId,
    startDate: p.startDate,
    endDate: p.endDate,
    durationMonths: p.durationMonths,
    description: p.description || null,
  }))
}

export const ProjectPlanManagement: React.FC<ProjectPlanManagementProps> = ({
  projectId,
  projectStartDate,
  projectEndDate,
  viewOnly = false,
}) => {
  // Queries & State
  const { data: plansList = [], isLoading: isListLoading } =
    planQueries.useList(projectId)

  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>()
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

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

  const getCurrentPhasesValue = useCallback(() => {
    return getComparablePhases(workingPhases)
  }, [workingPhases])

  const { isDirty, setSnapshot, markClean } = useUnsavedChanges<
    PhaseComparable[]
  >({
    getCurrentValue: getCurrentPhasesValue,
  })

  useEffect(() => {
    if (planDetail?.phases) {
      setWorkingPhases(planDetail.phases)
      setSnapshot(getComparablePhases(planDetail.phases))
    } else {
      setWorkingPhases([])
      setSnapshot([])
    }
  }, [planDetail, setSnapshot])

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

  // Milestone IDs already used in this plan
  const existingMilestoneIds = useMemo(() => {
    return workingPhases.map((p) => p.milestoneId)
  }, [workingPhases])

  // Computed phase metrics
  const { phasesWithMetrics } = usePhaseMetrics(workingPhases)

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
                startDate: phaseInput.startDate,
                endDate: phaseInput.endDate,
                durationMonths:
                  phaseInput.durationMonths ?? p.durationMonths ?? 1,
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
          startDate: phaseInput.startDate,
          endDate: phaseInput.endDate,
          durationMonths: phaseInput.durationMonths ?? 1,
          description: phaseInput.description || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        updated = [...prev, newPhase]
      }
      return updated.sort((a, b) => a.orderIndex - b.orderIndex)
    })
  }

  const handleDeletePhase = (phaseId: number) => {
    setWorkingPhases((prev) => {
      const filtered = prev.filter((p) => p.id !== phaseId)
      // Re-index remaining
      return filtered.map((p, idx) => ({ ...p, orderIndex: idx + 1 }))
    })
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
  }

  // Save changes to current plan
  const handleSavePlanChanges = async () => {
    if (!selectedPlanId) return
    try {
      const payloadPhases: PhaseInput[] = workingPhases.map((p) => ({
        id: p.id > 0 ? p.id : undefined,
        orderIndex: p.orderIndex,
        milestoneId: p.milestoneId,
        startDate: p.startDate,
        endDate: p.endDate,
        durationMonths: p.durationMonths,
        description: p.description,
      }))

      await updatePlanMutation.mutateAsync({
        planId: selectedPlanId,
        data: {
          phases: payloadPhases,
        },
      })
      markClean()
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

  const handleSelectPlan = (newPlanId: number) => {
    if (newPlanId === selectedPlanId) return
    if (isDirty) {
      setPendingPlanId(newPlanId)
      setShowLeaveModal(true)
    } else {
      setSelectedPlanId(newPlanId)
    }
  }

  const handleConfirmLeavePlan = () => {
    setShowLeaveModal(false)
    if (pendingPlanId !== null) {
      setSelectedPlanId(pendingPlanId)
      setPendingPlanId(null)
    }
  }

  const handleCancelLeavePlan = () => {
    setShowLeaveModal(false)
    setPendingPlanId(null)
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
        onSelectPlan={handleSelectPlan}
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

      {/* Action Bar for Phases */}
      <PhaseTableToolbar
        phasesCount={workingPhases.length}
        isDirty={isDirty}
        viewOnly={viewOnly}
        isSaving={updatePlanMutation.isPending}
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

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        open={showLeaveModal}
        onConfirm={handleConfirmLeavePlan}
        onCancel={handleCancelLeavePlan}
        title="Có thay đổi giai đoạn chưa lưu"
        description="Nếu chuyển sang phiên bản khác, các thay đổi chưa lưu của phiên bản hiện tại sẽ bị mất. Bạn có chắc muốn tiếp tục?"
      />
    </div>
  )
}
