/**
 * TypeScript Definitions for DMD Deliverables & Revision Control Module
 * Conforming to Novaland Design Management Standards:
 * - NVLG-DMD-REG01: Quy định mã số bản vẽ
 * - NVLG-DMD-SOP09: Quy trình quản lý thiết kế (7 giai đoạn)
 * - NVLG-DMD-SOP05: Quy trình phát hành bản vẽ TTSP & CTBH
 * - NVG-ODD-REG05: Quy định lưu trữ theo 9 đầu mục Novagen & ACC
 */

// 7 Bộ môn Chuyên môn theo chuẩn NVLG-DMD
export type DisciplineType =
  | "ARC" // Kiến trúc (Architecture)
  | "STR" // Kết cấu (Structure)
  | "MEP" // Cơ điện & PCCC (Mechanical, Electrical, Plumbing, Fire)
  | "LND" // Cảnh quan (Landscape)
  | "INF" // Hạ tầng kỹ thuật (Infrastructure)
  | "PLN" // Quy hoạch đô thị (Urban Planning)
  | "INT" // Nội thất & Fitout (Interior)

// Loại hồ sơ / tài liệu theo chuẩn NVLG-DMD-REG01
export type DocumentType =
  | "DWG" // Bản vẽ thiết kế (Drawing Package)
  | "CAL" // Thuyết minh tính toán & Chỉ dẫn kỹ thuật (Calculation / Spec)
  | "BOQ" // Bảng bóc tách khối lượng (Bill of Quantities)
  | "VER" // Báo cáo thẩm tra độc lập từ TVTT (Verification Report)
  | "APP" // Tờ trình phê duyệt theo AM (Form F01 - F07)
  | "CR"  // Báo cáo thay đổi thiết kế (Form F02 / F08)
  | "DOC" // Hồ sơ thuyết minh / Pháp lý khác

// 8 Giai đoạn Quản lý thiết kế (SOP09 + SOP05)
export type StageCode =
  | "G1" // Ý tưởng Quy hoạch
  | "G2" // Quy hoạch 1/500
  | "G3" // Ý tưởng công trình (TKYT)
  | "G4" // Thiết kế cơ sở (TKCS)
  | "G5" // Thiết kế BVTC 2 bước
  | "G6" // Thiết kế kỹ thuật (TKKT) 3 bước
  | "G7" // Thiết kế BVTC 3 bước
  | "G8" // Bản vẽ bán hàng (SOP05)

// Trạng thái kiểm soát vòng đời của hồ sơ
export type DeliverableStatus =
  | "DRAFT"            // Đang triển khai nháp nội bộ TVTK
  | "INTERNAL_REVIEW"  // DMD chuyên môn đang rà soát kiểm tra
  | "CQA_APPRAISAL"   // CQA / QSB đang thẩm định Chi phí - Chất lượng (VE)
  | "AM_APPROVED"      // Đã được phê duyệt theo AM (kèm Form F01-F07)
  | "CQNN_SUBMITTED"   // Đã nộp thẩm định Sở Xây Dựng / PCCC
  | "AFC_ISSUED"       // Đóng dấu phát hành thi công (Approved For Construction)
  | "SUPERSEDED"       // Đã bị thay thế bởi phiên bản Revision mới
  | "ARCHIVED"         // Đã lưu trữ kho Novagen & ACC

// Trạng thái bàn giao phân phối sang các phòng ban liên quan
export type HandoverStatus = "PENDING" | "SENT" | "ACKNOWLEDGED"

export interface HandoverRecipient {
  department: "PCD" | "PTC" | "QSB" | "PLP" | "SAC" | "NOVAGEN"
  deptName: string
  purpose: string
  status: HandoverStatus
  sentDate?: string
  ackDate?: string
  transmittalNo?: string
  receivedBy?: string
}

// Lịch sử từng phiên bản Revision của bản vẽ
export interface DrawingRevision {
  revisionCode: string // e.g. "Rev A", "Rev 0", "Rev 1", "Rev 0 (AFC)", "Rev 01A", "Rev 02 (AFC)"
  versionNumber: number
  isCurrent: boolean
  isAFC: boolean // Có đóng dấu Approved For Construction hay không
  releaseDate: string
  author: string // TVTK hoặc KTS phụ trách
  reviewer: string // Trưởng phòng DMD kiểm soát
  approver?: string // Lãnh đạo phê duyệt theo AM
  changeReason?: string // Lý do thay đổi phiên bản
  changeCategory?: "INITIAL" | "VE_OPTIMIZATION" | "CQA_REVIEW" | "CQNN_REQUIREMENT" | "SITE_RFI" | "SALES_MOD"
  attachedForm?: string // E.g., "NVLG-DMD-SOP09.F07", "NVLG-DMD-SOP09.F08", "NVLG-DMD-SOP09.F02"
  fileUrl?: string
  fileName: string
  fileSize: string
  fileFormat: "DWG" | "PDF" | "BIM_RVT" | "XLSX" | "ZIP"
  rfiRefCode?: string // Nếu điều chỉnh theo RFI từ PCD (e.g. "RFI-PCD-PHX-012")
}

// Cấu trúc một hồ sơ / bộ bản vẽ Deliverable
export interface DeliverableItem {
  id: string
  projectCode: string   // e.g. "AQ" (Aqua City)
  zoneCode: string      // e.g. "PHX1" (Phoenix 1A)
  drawingCode: string    // Chuẩn NVLG-DMD-REG01: e.g. "AQ-PHX1-ARC-DWG-001"
  drawingName: string   // Tên hồ sơ
  discipline: DisciplineType
  documentType: DocumentType
  stageCode: StageCode
  stageName: string
  packageCode: string   // Mã gói thầu: e.g. "PKG-ARC-01"
  scale?: string        // Tỷ lệ bản vẽ (1/100, 1/500, 1/2000, N/A)
  currentRevision: string // "Rev 0 (AFC)", "Rev 01A", "Rev 0"
  status: DeliverableStatus
  leadConsultant: string // Đơn vị TVTK (Aedas, SWA, Aurecon...)
  verifierConsultant?: string // Đơn vị TVTT độc lập (APAVE, SGS...)
  dmdPic: string        // Chuyên gia DMD phụ trách bộ môn
  dmdManager: string    // Trưởng phòng DMD kiểm soát
  sheetCount: number    // Số lượng trang / bản vẽ trong tập hồ sơ
  novagenCategory: number // 1 đến 9 theo NVG-ODD-REG05
  novagenFolder: string // Đường dẫn lưu trữ thư viện Novagen / ACC
  handovers: HandoverRecipient[]
  revisions: DrawingRevision[]
  createdAt: string
  updatedAt: string
}

// 9 Đầu mục lưu trữ Novagen (NVG-ODD-REG05)
export interface NovagenStorageFolder {
  id: number
  code: string
  name: string
  description: string
  sopRef: string
  iconName: string
  fileCount: number
}
