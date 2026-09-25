/**
 * Types for DMD Contracts & Consultants Management Module
 * Conforming to:
 * - RACI 2.5: Quản lý thực hiện hợp đồng, phát sinh, thanh quyết toán
 * - RACI 2.5.1: Thanh toán đợt
 * - RACI 2.5.2: Quyết toán hợp đồng
 * - RACI 2.5.3: Quản lý phát sinh (PYC Phát sinh / GTPS)
 * - NVLG-BMD-SOP01.F1.24a: Tiêu chí đánh giá năng lực TVTK/TVTT
 */

import { DisciplineType } from "../deliverables/types"

export type ContractRole = "TVTK" | "TVTT" // Tư vấn thiết kế / Tư vấn thẩm tra

export type MilestoneStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "PAID"

export interface PaymentMilestone {
  id: string
  milestoneNo: number
  milestoneName: string // e.g. "Đợt 1: Thiết kế ý tưởng (Concept)", "Đợt 2: Thiết kế cơ sở (TKCS)"
  percentage: number // e.g. 20, 30, 35, 15
  amountVnd: number // Giá trị đợt (triệu VNĐ)
  deliverableCriteria: string // Điều kiện nghiệm thu (Form F01/F05/F07, thẩm tra)
  status: MilestoneStatus
  dueDate: string
  paidDate?: string
  invoiceNo?: string
  attachedForm?: string // Form F11: Biên bản nghiệm thu thiết kế
}

export interface ContractVariation {
  id: string
  variationNo: string // e.g. "GTPS-AQ-01" hoặc "PS-AQ-01"
  variationType: "ADDITION" | "DEDUCTION" // Phát sinh tăng / Giảm trừ phát sinh (GTPS)
  title: string
  reasonDescription: string
  amountVnd: number // Giá trị phát sinh (triệu VNĐ)
  relatedRfiCode?: string
  relatedFormF08?: string
  dmdConfirm: boolean // RACI 2.5.3: Chuyên gia kiểm tra
  managerConfirm: boolean // Trưởng phòng kiểm soát
  amApprovalStatus: "PENDING" | "APPROVED" | "REJECTED"
  approvedDate?: string
  createdAt: string
}

export interface ConsultantEvaluation {
  id: string
  evalYearQuarter: string // "Q3/2026"
  qualityScore: number // Thang 10: Chất lượng bản vẽ & hồ sơ
  timelineScore: number // Thang 10: Đúng tiến độ MTL
  cooperationScore: number // Thang 10: Phối hợp giải quyết RFI hiện trường
  bimComplianceScore: number // Thang 10: Mức độ tuân thủ BIM/CAD
  averageScore: number // Điểm trung bình
  ratingLevel: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" // A, B, C, D
  evalNotes: string
  evaluatedBy: string
  evaluationDate: string
}

export interface ConsultantContract {
  id: string
  contractNo: string // e.g. "HĐ-2025-AQ-TVTK-01"
  contractTitle: string
  projectCode: string
  zoneCode: string
  consultantName: string
  consultantRole: ContractRole
  discipline: DisciplineType
  leadArchitect: string // KTS / KS Chủ trì
  contactPhone: string
  contactEmail: string
  dmdPic: string // Chuyên gia DMD quản lý hợp đồng
  signedDate: string
  completionDate: string
  contractValueVnd: number // Tổng giá trị hợp đồng (triệu VNĐ)
  disbursedAmountVnd: number // Đã giải ngân (triệu VNĐ)
  disbursementRate: number // Tỷ lệ giải ngân %
  status: "ACTIVE" | "COMPLETED" | "LIQUIDATED" | "SUSPENDED"
  milestones: PaymentMilestone[]
  variations: ContractVariation[]
  evaluations: ConsultantEvaluation[]
  createdAt: string
  updatedAt: string
}
