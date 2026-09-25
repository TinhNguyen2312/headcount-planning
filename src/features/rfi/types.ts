/**
 * Types for DMD RFI (Request For Information) & Change Control Module
 * Conforming to:
 * - NVLG-DMD-SOP09 (Step 8.2: PCD RFI Submission)
 * - NVLG-DMD-SOP09.F08 (Báo cáo thay đổi Thiết kế nội bộ)
 * - NVLG-DMD-SOP09.F02 (Báo cáo thay đổi Thiết kế ý tưởng)
 * - RACI DMD 2.2.9 (Phối hợp bộ phận quản lý thi công giải quyết vấn đề thiết kế)
 */

import { DisciplineType } from "../deliverables/types"

export type RFIPriority =
  | "HIGH"   // Chặn thi công (Critical path - SLA 24h)
  | "MEDIUM" // Ảnh hưởng cục bộ (SLA 48h)
  | "LOW"    // Làm rõ thông tin chung (SLA 72h)

export type RFIStatus =
  | "NEW"                   // Mới tiếp nhận từ PCD
  | "WAITING_CONSULTANT"    // Đang làm việc với TVTK
  | "RESOLVED_CLARIFICATION"// Đã giải trình kỹ thuật (Không đổi bản vẽ)
  | "RESOLVED_REVISION"     // Đã phát hành bản vẽ điều chỉnh (Rev mới)
  | "CHANGE_REPORT_ISSUED"  // Đã lập Báo cáo thay đổi Form F08/F02 trình BOM

export type RFICategory =
  | "DESIGN_CONFLICT"     // Xung đột không gian giữa các bộ môn (Clash)
  | "MATERIAL_DISCONTINUED"// Chủng loại vật tư hết nguồn cung / thay thế
  | "SITE_CONDITION"      // Sai lệch hiện trường / địa chất / cao độ
  | "SPEC_CLARIFICATION"  // Làm rõ chỉ dẫn kỹ thuật SPEC
  | "METHOD_ADJUSTMENT"   // Điều chỉnh theo biện pháp thi công nhà thầu

// Báo cáo thay đổi thiết kế (Form F08 hoặc F02)
export interface DesignChangeReport {
  id: string
  reportNo: string // e.g. "F08-2026-AQ-PHX1-01"
  formCode: "NVLG-DMD-SOP09.F08" | "NVLG-DMD-SOP09.F02"
  formTitle: string // "Báo cáo thay đổi Thiết kế nội bộ"
  projectCode: string
  zoneCode: string
  relatedRfiCode: string
  discipline: DisciplineType
  title: string
  reasonDescription: string // Căn cứ và lý do thay đổi
  originalDesignSummary: string // Phương án cũ
  proposedDesignSummary: string // Phương án đề xuất mới
  costVarianceEstimate: number // Chênh lệch ngân sách (triệu VNĐ, do QSB tính)
  costImpactType: "INCREASE" | "DECREASE" | "NO_IMPACT"
  scheduleImpactDays: number // Ảnh hưởng tiến độ MTL (ngày)
  dmdCreator: string // Chuyên gia DMD lập
  dmdManager: string // Trưởng phòng DMD kiểm soát
  pmdReviewer: string // Giám đốc PMD xem xét
  bomApprover: string // Tổng Giám Đốc phê duyệt theo AM
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED"
  approvedDate?: string
  createdAt: string
}

export interface RFIItem {
  id: string
  rfiCode: string // e.g. "RFI-PCD-PHX-012"
  subject: string
  projectCode: string
  zoneCode: string
  zoneName: string
  discipline: DisciplineType
  priority: RFIPriority
  slaHours: number // 24, 48, 72
  slaHoursRemaining: number
  status: RFIStatus
  category: RFICategory
  sentFrom: string // e.g. "KS. Vũ Văn Thành (Chỉ huy trưởng PCD)"
  sentFromRole: string
  sentDate: string
  deadlineDate: string
  affectedDrawingCode?: string // Mã bản vẽ bị ảnh hưởng (REG01)
  assignedDmdPic: string // Chuyên gia DMD thụ lý
  leadConsultant: string // Đơn vị TVTK chịu trách nhiệm
  siteIssueDescription: string // Mô tả cụ thể vướng mắc tại công trường
  sitePhotoUrls?: string[]
  dmdSolutionSummary?: string // Giải pháp kết luận của DMD
  newRevisionCode?: string // Ví dụ: "Rev 01A"
  linkedChangeReport?: DesignChangeReport
  resolvedDate?: string
  createdAt: string
  updatedAt: string
}
