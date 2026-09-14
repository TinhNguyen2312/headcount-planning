"use client"

import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd"
import dayjs from "dayjs"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  FastForward,
  Flag,
  Layers,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

import { planQueries } from "@/hooks/server/plans"
import { useUI } from "@/hooks/useUI"
import type {
  PhaseInput,
  PhaseResponse,
  PlanCreatePayload,
  PlanResponse,
  PlanStatus,
} from "@/types"

import { CascadeShiftModal } from "./CascadeShiftModal"
import { PhaseModal } from "./PhaseModal"
import { PlanVersionModal } from "./PlanVersionModal"

const { Text, Title } = Typography

interface ProjectPlanManagementProps {
  projectId: number
  projectStartDate?: string | null
  projectEndDate?: string | null
  viewOnly?: boolean
}

const statusTagColors: Record<PlanStatus, { color: string; label: string }> = {
  ACTIVE: { color: "success", label: "ĐANG ÁP DỤNG (ACTIVE)" },
  DRAFT: { color: "processing", label: "BẢN NHÁP (DRAFT)" },
  ARCHIVED: { color: "default", label: "LƯU TRỮ (ARCHIVED)" },
}

export const ProjectPlanManagement: React.FC<ProjectPlanManagementProps> = ({
  projectId,
  projectStartDate,
  projectEndDate,
  viewOnly = false,
}) => {
  const { message } = useUI()

  // Queries & Mutations
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
  const phasesWithMetrics = useMemo(() => {
    const sorted = [...workingPhases].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    )
    const baseDate = projectStartDate ? dayjs(projectStartDate) : null
    const projectEnd = projectEndDate ? dayjs(projectEndDate) : null

    return sorted.map((phase, idx) => {
      const endMonth = phase.startMonth + phase.durationMonths - 1
      let expectedDate: string | null = null
      let isPastProjectEnd = false

      if (baseDate && baseDate.isValid()) {
        const calcDate = baseDate.add(endMonth - 1, "month").endOf("month")
        expectedDate = calcDate.format("DD/MM/YYYY")
        if (
          projectEnd &&
          projectEnd.isValid() &&
          calcDate.isAfter(projectEnd, "day")
        ) {
          isPastProjectEnd = true
        }
      }

      // Detect overlapping or parallel with previous phase
      let executionType: "SEQUENTIAL" | "OVERLAPPING" | "PARALLEL" =
        "SEQUENTIAL"
      if (idx > 0) {
        const prevPhase = sorted[idx - 1]
        const prevEnd = prevPhase.startMonth + prevPhase.durationMonths - 1
        if (phase.startMonth === prevPhase.startMonth) {
          executionType = "PARALLEL"
        } else if (phase.startMonth <= prevEnd) {
          executionType = "OVERLAPPING"
        }
      }

      return {
        ...phase,
        endMonth,
        expectedDate,
        isPastProjectEnd,
        executionType,
      }
    })
  }, [workingPhases, projectStartDate, projectEndDate])

  // Check deadline warnings
  const deadlineWarnings = useMemo(() => {
    return phasesWithMetrics.filter((p) => p.isPastProjectEnd)
  }, [phasesWithMetrics])

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
      <Card className="shadow-xs border-dashed">
        <Empty
          description={
            <div className="flex flex-col gap-1 items-center">
              <span className="font-semibold text-base">
                Dự án chưa có phiên bản kế hoạch tiến độ nào
              </span>
              <span className="text-sm text-muted-foreground">
                Tạo phiên bản kế hoạch (Baseline) đầu tiên để khai báo các giai
                đoạn thi công
              </span>
            </div>
          }
        >
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setCloneSourcePlanId(undefined)
              setIsVersionModalOpen(true)
            }}
          >
            Tạo kế hoạch tiến độ đầu tiên (V01)
          </Button>
        </Empty>

        <PlanVersionModal
          open={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          onSubmit={handleCreatePlan}
          existingPlans={plansList}
          loading={createPlanMutation.isPending}
          defaultClonePlanId={cloneSourcePlanId}
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar: Version Selection & Primary Actions */}
      <Card size="small" className="shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="size-4 text-emerald-600" />
              Phiên bản kế hoạch:
            </span>

            <Select
              className="min-w-[280px]"
              value={selectedPlanId}
              onChange={(val) => setSelectedPlanId(val)}
              options={plansList.map((p) => ({
                label: (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{p.versionName}</span>
                    <Tag
                      color={statusTagColors[p.status].color}
                      className="text-xs m-0"
                    >
                      {p.status}
                    </Tag>
                  </div>
                ),
                value: p.id,
              }))}
            />

            {planDetail && (
              <Tag
                color={statusTagColors[planDetail.status].color}
                className="font-medium px-2 py-0.5 text-xs"
              >
                {statusTagColors[planDetail.status].label}
              </Tag>
            )}

            {planDetail?.validFrom && (
              <span className="text-xs text-muted-foreground">
                Hiệu lực từ:{" "}
                <strong>
                  {dayjs(planDetail.validFrom).format("DD/MM/YYYY")}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!viewOnly && planDetail?.status !== "ACTIVE" && (
              <Popconfirm
                title="Kích hoạt phiên bản này?"
                description="Khi kích hoạt, phiên bản này sẽ trở thành căn cứ chạy định biên nhân sự. Phiên bản ACTIVE hiện tại (nếu có) sẽ tự động chuyển sang trạng thái ARCHIVED."
                onConfirm={handleActivatePlan}
                okText="Kích hoạt"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={activatePlanMutation.isPending}
                  disabled={workingPhases.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Kích hoạt (Set Active)
                </Button>
              </Popconfirm>
            )}

            {!viewOnly && (
              <>
                <Button
                  icon={<Copy className="size-4" />}
                  onClick={() => {
                    setCloneSourcePlanId(selectedPlanId)
                    setIsVersionModalOpen(true)
                  }}
                >
                  Nhân bản (Clone)
                </Button>

                <Button
                  type="default"
                  icon={<Plus className="size-4" />}
                  onClick={() => {
                    setCloneSourcePlanId(undefined)
                    setIsVersionModalOpen(true)
                  }}
                >
                  Tạo phiên bản mới
                </Button>

                {planDetail?.status !== "ACTIVE" && (
                  <Popconfirm
                    title="Xóa phiên bản này?"
                    description={`Bạn có chắc muốn xóa phiên bản "${planDetail?.versionName}"? Tất cả giai đoạn thuộc phiên bản này sẽ bị xóa.`}
                    onConfirm={handleDeletePlan}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 className="size-4" />}
                      loading={deletePlanMutation.isPending}
                    />
                  </Popconfirm>
                )}
              </>
            )}
          </div>
        </div>

        {planDetail?.note && (
          <div className="mt-2.5 pt-2 border-t text-xs text-muted-foreground">
            <strong>Ghi chú phiên bản:</strong> {planDetail.note}
          </div>
        )}
      </Card>

      {/* Deadline Warnings Banner */}
      {deadlineWarnings.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle className="size-5 text-amber-500" />}
          message="Cảnh báo tiến độ giai đoạn vượt hạn dự án"
          description={
            <div className="text-xs">
              Có <strong>{deadlineWarnings.length}</strong> giai đoạn có ngày dự
              kiến hoàn thành vượt quá ngày kết thúc cam kết của dự án (
              {dayjs(projectEndDate).format("DD/MM/YYYY")}):{" "}
              {deadlineWarnings
                .map(
                  (w) =>
                    `${w.milestone?.name || w.milestoneId} (Tháng ${w.endMonth})`,
                )
                .join(", ")}
              . Vui lòng rà soát lại thời lượng hoặc điều chỉnh ngày kết thúc dự
              án.
            </div>
          }
        />
      )}

      {/* Action Bar for Phases */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base text-foreground">
            Danh sách giai đoạn & mốc kiểm soát ({workingPhases.length})
          </span>
          {isDirty && (
            <Badge
              status="processing"
              text={
                <span className="text-xs text-amber-600 font-medium">
                  Có thay đổi chưa lưu
                </span>
              }
            />
          )}
        </div>

        {!viewOnly && (
          <Space>
            <Button
              icon={<FastForward className="size-4" />}
              disabled={workingPhases.length === 0}
              onClick={() => setIsShiftModalOpen(true)}
            >
              Tịnh tiến (+/- tháng)
            </Button>

            <Button
              type="dashed"
              icon={<Plus className="size-4" />}
              onClick={() => {
                setEditingPhase(null)
                setIsPhaseModalOpen(true)
              }}
            >
              Thêm giai đoạn
            </Button>

            <Button
              type="primary"
              icon={<Save className="size-4" />}
              disabled={!isDirty}
              loading={updatePlanMutation.isPending}
              onClick={handleSavePlanChanges}
            >
              Lưu thay đổi giai đoạn
            </Button>
          </Space>
        )}
      </div>

      {/* Phases Table */}
      <Card size="small" className="p-0 overflow-hidden shadow-xs">
        {isDetailLoading ? (
          <div className="p-8 text-center">
            <Spin tip="Đang tải giai đoạn..." />
          </div>
        ) : (
          <Table
            size="middle"
            dataSource={phasesWithMetrics}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Thứ tự",
                dataIndex: "orderIndex",
                width: 75,
                align: "center",
                render: (val, _, idx) => (
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold">{val}</span>
                    {!viewOnly && (
                      <div className="flex flex-col">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMovePhase(idx, "UP")}
                          className="hover:text-emerald-600 disabled:opacity-20 cursor-pointer p-0.5 leading-none"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="size-3" />
                        </button>
                        <button
                          disabled={idx === phasesWithMetrics.length - 1}
                          onClick={() => handleMovePhase(idx, "DOWN")}
                          className="hover:text-emerald-600 disabled:opacity-20 cursor-pointer p-0.5 leading-none"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Mốc tiến độ chuẩn (Milestone)",
                key: "milestone",
                render: (_, r) => (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {r.milestone?.code && (
                        <Tag className="m-0 font-mono text-xs px-1.5 py-0 bg-muted text-muted-foreground border-none">
                          {r.milestone.code}
                        </Tag>
                      )}
                      <span className="font-medium text-foreground">
                        {r.milestone?.name || `Mốc ID: ${r.milestoneId}`}
                      </span>
                    </div>
                    {r.description && (
                      <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {r.description}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                title: "Tháng bắt đầu",
                dataIndex: "startMonth",
                width: 130,
                render: (val, r) => (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">Tháng {val}</span>
                    {r.executionType === "OVERLAPPING" && (
                      <Tooltip title="Giai đoạn gối đầu: Bắt đầu trước khi giai đoạn trước hoàn tất">
                        <Tag
                          color="orange"
                          className="text-[10px] m-0 px-1 leading-4"
                        >
                          Gối đầu
                        </Tag>
                      </Tooltip>
                    )}
                    {r.executionType === "PARALLEL" && (
                      <Tooltip title="Giai đoạn chạy song song: Cùng tháng bắt đầu với giai đoạn trước">
                        <Tag
                          color="purple"
                          className="text-[10px] m-0 px-1 leading-4"
                        >
                          Song song
                        </Tag>
                      </Tooltip>
                    )}
                  </div>
                ),
              },
              {
                title: "Thời lượng",
                dataIndex: "durationMonths",
                width: 110,
                align: "center",
                render: (val) => (
                  <span className="font-medium bg-muted/60 px-2 py-0.5 rounded text-xs">
                    {val} tháng
                  </span>
                ),
              },
              {
                title: "Tháng kết thúc",
                dataIndex: "endMonth",
                width: 120,
                align: "center",
                render: (val) => (
                  <span className="font-semibold">Tháng {val}</span>
                ),
              },
              {
                title: "Dự kiến hoàn thành",
                dataIndex: "expectedDate",
                width: 150,
                render: (val, r) => (
                  <div className="flex items-center gap-1">
                    <span>{val || "-"}</span>
                    {r.isPastProjectEnd && (
                      <Tooltip title="Vượt quá ngày kết thúc cam kết của dự án">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                      </Tooltip>
                    )}
                  </div>
                ),
              },
              {
                title: "Chốt chặn",
                dataIndex: "isAnchor",
                width: 100,
                align: "center",
                render: (val) =>
                  val ? (
                    <Tooltip title="Mốc cam kết chiến lược (Anchor)">
                      <Tag color="gold" className="m-0 text-xs px-2 py-0.5">
                        <Flag className="size-3 inline mr-1 text-amber-600" />
                        Anchor
                      </Tag>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  ),
              },
              {
                title: "Thao tác",
                key: "actions",
                width: 100,
                align: "center",
                render: (_, r) =>
                  !viewOnly ? (
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                        }
                        onClick={() => {
                          setEditingPhase(r)
                          setIsPhaseModalOpen(true)
                        }}
                      />
                      <Popconfirm
                        title="Xóa giai đoạn này?"
                        onConfirm={() => handleDeletePhase(r.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<Trash2 className="size-3.5" />}
                        />
                      </Popconfirm>
                    </Space>
                  ) : null,
              },
            ]}
          />
        )}
      </Card>

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
