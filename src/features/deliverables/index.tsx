import React, { useState, useMemo } from "react"
import { message } from "antd"
import { INITIAL_DELIVERABLES } from "./data/deliverablesData"
import {
  DeliverableItem,
  DrawingRevision,
  HandoverRecipient,
  DisciplineType,
  StageCode,
  DeliverableStatus,
} from "./types"
import { DeliverablesHeader } from "./components/DeliverablesHeader"
import { DeliverablesTable } from "./components/DeliverablesTable"
import { RevisionHistoryDrawer } from "./components/RevisionHistoryDrawer"
import { RegisterDeliverableModal } from "./components/RegisterDeliverableModal"
import { HandoverDistributionModal } from "./components/HandoverDistributionModal"
import { NovagenExplorerModal } from "./components/NovagenExplorerModal"
import { AddNewRevisionModal } from "./components/AddNewRevisionModal"

export const DeliverablesFeature: React.FC = () => {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(INITIAL_DELIVERABLES)

  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState("ALL")
  const [selectedStage, setSelectedStage] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")

  // Modal & Drawer States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false)
  const [isNovagenModalOpen, setIsNovagenModalOpen] = useState(false)
  const [isRevisionDrawerOpen, setIsRevisionDrawerOpen] = useState(false)
  const [isAddRevisionModalOpen, setIsAddRevisionModalOpen] = useState(false)

  // Selected item for drawer/action
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableItem | null>(null)

  // Filtered List
  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((item) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchCode = item.drawingCode.toLowerCase().includes(query)
        const matchName = item.drawingName.toLowerCase().includes(query)
        const matchConsultant = item.leadConsultant.toLowerCase().includes(query)
        if (!matchCode && !matchName && !matchConsultant) return false
      }

      // Discipline
      if (selectedDiscipline !== "ALL" && item.discipline !== selectedDiscipline) {
        return false
      }

      // Stage
      if (selectedStage !== "ALL" && item.stageCode !== selectedStage) {
        return false
      }

      // Status
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [deliverables, searchTerm, selectedDiscipline, selectedStage, selectedStatus])

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = deliverables.length
    const afcCount = deliverables.filter((d) => d.status === "AFC_ISSUED" || d.currentRevision.includes("AFC")).length
    const reviewCount = deliverables.filter((d) => d.status === "CQA_APPRAISAL" || d.status === "INTERNAL_REVIEW").length
    const revisionCount = deliverables.filter((d) => d.revisions.length > 1).length

    return { totalCount, afcCount, reviewCount, revisionCount }
  }, [deliverables])

  // Handlers
  const handleViewHistory = (item: DeliverableItem) => {
    setSelectedDeliverable(item)
    setIsRevisionDrawerOpen(true)
  }

  const handleHandoverItem = (item: DeliverableItem) => {
    setSelectedDeliverable(item)
    setIsHandoverModalOpen(true)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    message.success(`Đã sao chép mã bản vẽ: ${code}`)
  }

  // Thêm mới Deliverable
  const handleAddNewDeliverable = (newItem: DeliverableItem) => {
    setDeliverables((prev) => [newItem, ...prev])
  }

  // Ban hành phiên bản Revision mới
  const handleAddNewRevision = (deliverableId: string, newRev: DrawingRevision) => {
    setDeliverables((prev) =>
      prev.map((item) => {
        if (item.id === deliverableId) {
          // Đánh dấu các revision cũ isCurrent = false
          const updatedOldRevisions = item.revisions.map((r) => ({
            ...r,
            isCurrent: false,
          }))

          const updatedRevisions = [newRev, ...updatedOldRevisions]
          const isAfc = newRev.isAFC || newRev.revisionCode.includes("AFC")

          return {
            ...item,
            currentRevision: newRev.revisionCode,
            status: isAfc ? "AFC_ISSUED" : item.status,
            revisions: updatedRevisions,
            updatedAt: newRev.releaseDate,
          }
        }
        return item
      })
    )

    // Cập nhật selectedDeliverable nếu đang mở Drawer
    if (selectedDeliverable && selectedDeliverable.id === deliverableId) {
      setSelectedDeliverable((prev) => {
        if (!prev) return null
        const updatedOldRevisions = prev.revisions.map((r) => ({ ...r, isCurrent: false }))
        return {
          ...prev,
          currentRevision: newRev.revisionCode,
          status: newRev.isAFC ? "AFC_ISSUED" : prev.status,
          revisions: [newRev, ...updatedOldRevisions],
          updatedAt: newRev.releaseDate,
        }
      })
    }
  }

  // Cập nhật bàn giao
  const handleUpdateHandover = (deliverableId: string, recipient: HandoverRecipient) => {
    setDeliverables((prev) =>
      prev.map((item) => {
        if (item.id === deliverableId) {
          const existingIndex = item.handovers.findIndex(
            (h) => h.department === recipient.department
          )
          let newHandovers = [...item.handovers]
          if (existingIndex >= 0) {
            newHandovers[existingIndex] = recipient
          } else {
            newHandovers.push(recipient)
          }
          return {
            ...item,
            handovers: newHandovers,
          }
        }
        return item
      })
    )
  }

  return (
    <div className="py-2 space-y-4">
      {/* Header with Stats, Search, Filters & Actions */}
      <DeliverablesHeader
        totalCount={metrics.totalCount}
        afcCount={metrics.afcCount}
        reviewCount={metrics.reviewCount}
        revisionCount={metrics.revisionCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDiscipline={selectedDiscipline}
        onDisciplineChange={setSelectedDiscipline}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
        onOpenNovagenModal={() => setIsNovagenModalOpen(true)}
      />

      {/* Main Deliverables Table */}
      <DeliverablesTable
        data={filteredDeliverables}
        onViewHistory={handleViewHistory}
        onHandoverItem={handleHandoverItem}
        onCopyCode={handleCopyCode}
      />

      {/* Modals & Drawers */}
      <RevisionHistoryDrawer
        open={isRevisionDrawerOpen}
        onClose={() => setIsRevisionDrawerOpen(false)}
        deliverable={selectedDeliverable}
        onAddNewRevision={() => {
          setIsRevisionDrawerOpen(false)
          setIsAddRevisionModalOpen(true)
        }}
      />

      <RegisterDeliverableModal
        open={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleAddNewDeliverable}
      />

      <AddNewRevisionModal
        open={isAddRevisionModalOpen}
        onClose={() => setIsAddRevisionModalOpen(false)}
        deliverable={selectedDeliverable}
        onSuccess={handleAddNewRevision}
      />

      <HandoverDistributionModal
        open={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        deliverables={deliverables}
        onUpdateHandover={handleUpdateHandover}
      />

      <NovagenExplorerModal
        open={isNovagenModalOpen}
        onClose={() => setIsNovagenModalOpen(false)}
        deliverables={deliverables}
      />
    </div>
  )
}
