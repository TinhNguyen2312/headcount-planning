/**
 * Types for DMD Cross-Functional Review & SLA Module
 * Conforming to:
 * - NVLG-DMD-SOP09 (Steps 4 & 5: PBCM Review)
 * - NVLG-GMS.DMD-SOP02 (Design Control Procedure)
 * - NVLG-QSB-SOP01 (Budget Estimation & BOQ)
 */

export type ReviewDepartment =
  | "PLP" // Phòng Thủ tục Pháp lý (SLA 48h)
  | "QSB" // Phòng Khối lượng & Ngân sách (SLA 72h)
  | "CQA" // Phòng Thẩm định Chi phí - Chất lượng (VE) (SLA 72h)
  | "SAC" // Ban Kinh doanh (SLA 48h)
  | "INC" // Ban Đầu tư (SLA 48h)
  | "GMS" // Phòng Tổ chức Điều hành Dự án (SLA 72h)
  | "PTC" // Ban Cung ứng Đấu thầu (SLA 72h)

export type TicketStatus =
  | "DRAFT"          // Bản nháp PYC
  | "PROCESSING"     // Đang chờ phòng ban phản hồi
  | "COMPLETED"      // Đã phản hồi đầy đủ
  | "REVISE_REQUIRED"// Yêu cầu DMD/TVTK giải trình thêm
  | "OVERDUE"        // Quá hạn cam kết SLA

export type SLASeverity = "NORMAL" | "WARNING" | "OVERDUE"

export interface FeedbackRecord {
  id: string
  respondentName: string
  respondentTitle: string
  department: ReviewDepartment
  responseDate: string
  isAccepted: boolean // Đồng ý / Có ý kiến sửa đổi
  commentSummary: string
  detailedNotes?: string
  attachedDocUrl?: string
  attachedDocName?: string
}

export interface CrossReviewTicket {
  id: string
  ticketNo: string // e.g. "CR-2026-089", "PYC-DMD-PLP-01"
  title: string
  projectCode: string // "AQ"
  zoneCode: string // "PHX1"
  stageCode: string // "G1" - "G8"
  targetDept: ReviewDepartment
  targetDeptName: string
  packageCode: string
  drawingCodeRef?: string
  initiatorName: string // Chuyên gia DMD lập phiếu
  initiatorRole: string
  sentDate: string
  deadlineDate: string
  slaHoursTotal: number // e.g. 48h, 72h
  slaHoursRemaining: number // Số giờ còn lại
  slaSeverity: SLASeverity
  status: TicketStatus
  purpose: string
  feedbacks: FeedbackRecord[]
  createdAt: string
  updatedAt: string
}
