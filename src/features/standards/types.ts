/**
 * Types for DMD Standards Library & Typical Design Module
 * Conforming to:
 * - NVLG-DMD-SPEC01 to SPEC09 (Technical Design Standards)
 * - NVLG-GMS.DMD-SOP03 (Typical Design Library & Standardization)
 * - NVLG-DMD-SOP08 (Material Sample Selection & Approval Procedure)
 * - NVLG-DMD-REG02 (Standardization of Design Activities)
 */

import { DisciplineType } from "../deliverables/types"

export interface SpecStandard {
  id: string
  specCode: string // e.g. "NVLG-DMD-SPEC01"
  specTitle: string
  discipline: DisciplineType
  targetType: "HIGH_RISE" | "LOW_RISE" | "LANDSCAPE" | "INFRASTRUCTURE" | "PLANNING" | "PUBLIC"
  starRatingApplicable: string // "3 Sao - 5 Sao"
  effectiveDate: string
  version: string // e.g. "Ban hành lần 2 (2025)"
  fileSize: string
  pageCount: number
  summary: string
  keyChapters: string[]
  downloadUrl?: string
}

export interface DesignTemplateItem {
  id: string
  templateCode: string // e.g. "TYP-SH-6x20"
  templateTitle: string
  buildingType: string // "Nhà ở liên kế thương mại (Shophouse)", "Biệt thự đơn lập"
  dimensions: string // "6.0m x 20.0m", "10.0m x 20.0m"
  floors: string // "1 Trệt 2 Lầu + Sân thượng"
  constructionAreaM2: number // Diện tích sàn xây dựng
  hasBimModel: boolean // Có mô hình Revit BIM hay không
  standardSopRef: string // "NVLG-GMS.DMD-SOP03"
  discipline: DisciplineType
  previewImageUrl?: string
  sheetCount: number
  status: "STANDARDIZED" | "UPDATING"
}

export interface MaterialSampleApproval {
  id: string
  sampleCode: string // e.g. "MTR-2026-042"
  materialCategory: "GẠCH ỐP LÁT" | "ĐÁ TỰ NHIÊN" | "SƠN HIỆU ỨNG" | "NHÔM KÍNH" | "THIẾT BỊ VỆ SINH" | "THIẾT BỊ ĐIỆN"
  materialName: string
  brandName: string // Inax, Toto, Kohler, Xingfa, Dulux...
  specCodeRef: string // "NVLG-DMD-SPEC02"
  applicationArea: string // Mặt tiền Shophouse, Nhà vệ sinh Master...
  mockupLocation: string // Nhà mẫu Aqua City Phoenix 1
  approvalStatus: "APPROVED" | "PENDING_MOCKUP" | "REVISE_REQUIRED"
  dmdReviewer: string
  bomApprover: string
  approvalDate?: string
  attachedForm: string // "NVLG-DMD-SOP08.F01"
}
