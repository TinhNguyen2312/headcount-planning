import React, { useState, useMemo } from "react"
import { message } from "antd"
import { INITIAL_RFIS } from "./data/rfiData"
import { RFIItem, RFIStatus, DesignChangeReport } from "./types"
import { RfiHeader } from "./components/RfiHeader"
import { RfiTable } from "./components/RfiTable"
import { RfiResolutionModal } from "./components/RfiResolutionModal"
import { ChangeReportModal } from "./components/ChangeReportModal"
import { RfiDetailDrawer } from "./components/RfiDetailDrawer"

export const RfiFeature: React.FC = () => {
  const [rfis, setRfis] = useState<RFIItem[]>(INITIAL_RFIS)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState("ALL")
  const [selectedPriority, setSelectedPriority] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")

  // Modals & Drawers
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isChangeReportModalOpen, setIsChangeReportModalOpen] = useState(false)
  const [selectedRfi, setSelectedRfi] = useState<RFIItem | null>(null)

  // Filtered RFIs
  const filteredRfis = useMemo(() => {
    return rfis.filter((r) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchCode = r.rfiCode.toLowerCase().includes(query)
        const matchSubject = r.subject.toLowerCase().includes(query)
        const matchSender = r.sentFrom.toLowerCase().includes(query)
        const matchDrawing = r.affectedDrawingCode?.toLowerCase().includes(query) || false
        if (!matchCode && !matchSubject && !matchSender && !matchDrawing) return false
      }

      if (selectedDiscipline !== "ALL" && r.discipline !== selectedDiscipline) {
        return false
      }

      if (selectedPriority !== "ALL" && r.priority !== selectedPriority) {
        return false
      }

      if (selectedStatus !== "ALL" && r.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [rfis, searchTerm, selectedDiscipline, selectedPriority, selectedStatus])

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = rfis.length
    const highPriorityCount = rfis.filter((r) => r.priority === "HIGH").length
    const resolvedCount = rfis.filter(
      (r) => r.status === "RESOLVED_REVISION" || r.status === "RESOLVED_CLARIFICATION" || r.status === "CHANGE_REPORT_ISSUED"
    ).length
    const waitingConsultantCount = rfis.filter((r) => r.status === "WAITING_CONSULTANT").length

    return { totalCount, highPriorityCount, resolvedCount, waitingConsultantCount }
  }, [rfis])

  const handleViewRfi = (rfi: RFIItem) => {
    setSelectedRfi(rfi)
    setIsDetailDrawerOpen(true)
  }

  const handleOpenResolve = (rfi: RFIItem) => {
    setSelectedRfi(rfi)
    setIsResolveModalOpen(true)
  }

  const handleOpenChangeReport = (rfi?: RFIItem) => {
    if (rfi) {
      setSelectedRfi(rfi)
    }
    setIsChangeReportModalOpen(true)
  }

  const handleResolveSuccess = (
    rfiId: string,
    newStatus: RFIStatus,
    solution: string,
    newRevCode?: string
  ) => {
    setRfis((prev) =>
      prev.map((r) => {
        if (r.id === rfiId) {
          return {
            ...r,
            status: newStatus,
            dmdSolutionSummary: solution,
            newRevisionCode: newRevCode,
            resolvedDate: new Date().toLocaleDateString("vi-VN"),
            updatedAt: new Date().toLocaleDateString("vi-VN"),
          }
        }
        return r
      })
    )

    if (selectedRfi && selectedRfi.id === rfiId) {
      setSelectedRfi((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              dmdSolutionSummary: solution,
              newRevisionCode: newRevCode,
            }
          : null
      )
    }
  }

  const handleChangeReportSuccess = (report: DesignChangeReport) => {
    if (selectedRfi) {
      setRfis((prev) =>
        prev.map((r) => {
          if (r.id === selectedRfi.id) {
            return {
              ...r,
              status: "CHANGE_REPORT_ISSUED",
              linkedChangeReport: report,
              updatedAt: new Date().toLocaleDateString("vi-VN"),
            }
          }
          return r
        })
      )

      setSelectedRfi((prev) =>
        prev
          ? {
              ...prev,
              status: "CHANGE_REPORT_ISSUED",
              linkedChangeReport: report,
            }
          : null
      )
    }
  }

  return (
    <div className="py-2 space-y-4">
      <RfiHeader
        totalCount={metrics.totalCount}
        highPriorityCount={metrics.highPriorityCount}
        resolvedCount={metrics.resolvedCount}
        waitingConsultantCount={metrics.waitingConsultantCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDiscipline={selectedDiscipline}
        onDisciplineChange={setSelectedDiscipline}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onOpenCreateFormF08={() => handleOpenChangeReport()}
      />

      <RfiTable
        data={filteredRfis}
        onViewRfi={handleViewRfi}
        onResolveRfi={handleOpenResolve}
        onCreateChangeReport={handleOpenChangeReport}
      />

      <RfiDetailDrawer
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        rfi={selectedRfi}
        onOpenResolve={handleOpenResolve}
        onOpenChangeReport={handleOpenChangeReport}
      />

      <RfiResolutionModal
        open={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        rfi={selectedRfi}
        onSuccess={handleResolveSuccess}
        onOpenChangeReport={handleOpenChangeReport}
      />

      <ChangeReportModal
        open={isChangeReportModalOpen}
        onClose={() => setIsChangeReportModalOpen(false)}
        rfi={selectedRfi}
        onSuccess={handleChangeReportSuccess}
      />
    </div>
  )
}
