import React, { useState, useMemo } from "react"
import { message } from "antd"
import { INITIAL_REVIEW_TICKETS } from "./data/crossReviewData"
import { CrossReviewTicket, FeedbackRecord } from "./types"
import { CrossReviewHeader } from "./components/CrossReviewHeader"
import { CrossReviewTable } from "./components/CrossReviewTable"
import { CreateTicketModal } from "./components/CreateTicketModal"
import { TicketDetailDrawer } from "./components/TicketDetailDrawer"

export const CrossReviewFeature: React.FC = () => {
  const [tickets, setTickets] = useState<CrossReviewTicket[]>(INITIAL_REVIEW_TICKETS)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<CrossReviewTicket | null>(null)

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchNo = t.ticketNo.toLowerCase().includes(query)
        const matchTitle = t.title.toLowerCase().includes(query)
        const matchDwg = t.drawingCodeRef?.toLowerCase().includes(query) || false
        const matchAuthor = t.initiatorName.toLowerCase().includes(query)
        if (!matchNo && !matchTitle && !matchDwg && !matchAuthor) return false
      }

      if (selectedDept !== "ALL" && t.targetDept !== selectedDept) {
        return false
      }

      if (selectedStatus !== "ALL" && t.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [tickets, searchTerm, selectedDept, selectedStatus])

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = tickets.length
    const completedCount = tickets.filter((t) => t.status === "COMPLETED").length
    const inProgressCount = tickets.filter((t) => t.status === "PROCESSING").length
    const warningCount = tickets.filter((t) => t.slaSeverity === "WARNING" && t.status !== "COMPLETED").length
    const overdueCount = tickets.filter((t) => t.status === "OVERDUE" || t.slaSeverity === "OVERDUE").length

    return { totalCount, completedCount, inProgressCount, warningCount, overdueCount }
  }, [tickets])

  const handleViewTicket = (ticket: CrossReviewTicket) => {
    setSelectedTicket(ticket)
    setIsDetailDrawerOpen(true)
  }

  const handleSendReminder = (ticket: CrossReviewTicket) => {
    message.success(
      `Đã phát thông báo nhắc nhở cam kết SLA gửi ${ticket.targetDeptName} cho phiếu ${ticket.ticketNo}`
    )
  }

  const handleAddNewTicket = (newTicket: CrossReviewTicket) => {
    setTickets((prev) => [newTicket, ...prev])
  }

  const handleAddFeedback = (ticketId: string, feedback: FeedbackRecord) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "COMPLETED",
            feedbacks: [feedback, ...t.feedbacks],
            updatedAt: new Date().toLocaleDateString("vi-VN"),
          }
        }
        return t
      })
    )

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: "COMPLETED",
              feedbacks: [feedback, ...prev.feedbacks],
            }
          : null
      )
    }
  }

  return (
    <div className="py-2 space-y-4">
      <CrossReviewHeader
        totalCount={metrics.totalCount}
        inProgressCount={metrics.inProgressCount}
        warningCount={metrics.warningCount}
        overdueCount={metrics.overdueCount}
        completedCount={metrics.completedCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDept={selectedDept}
        onDeptChange={setSelectedDept}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <CrossReviewTable
        data={filteredTickets}
        onViewTicket={handleViewTicket}
        onSendReminder={handleSendReminder}
      />

      <CreateTicketModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAddNewTicket}
      />

      <TicketDetailDrawer
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        ticket={selectedTicket}
        onAddFeedback={handleAddFeedback}
      />
    </div>
  )
}
