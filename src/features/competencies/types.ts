/**
 * Types for DMD Business Competencies Framework
 * (5 Nghiệp vụ chính - 23 Nghiệp vụ phụ chuyên môn)
 * Based on:
 * - Nghiep vu DMD theo SOP_Draf 02.xlsx
 * - NVLG-DMD-SOP09: Quy trình Quản lý Thiết kế
 * - Quyết định phân nhiệm & RACI Ban Tổng Giám Đốc (BOM)
 */

export type MainGroupId = "G1" | "G2" | "G3" | "G4" | "G5"

export interface MainCompetencyGroup {
  id: MainGroupId
  code: string
  order: number
  title: string
  shortTitle: string
  description: string
  color: string
  badgeColor: string
  bgColor: string
  borderColor: string
  subCompetencyCount: number
  keyDepartment: string
  sopRef: string
}

export interface SubCompetency {
  code: string
  groupId: MainGroupId
  groupTitle: string
  name: string
  detailedScope: string
  sopRef: string
  standardForms: string[]
  applicableStages: string[] // G1, G2, G3, G4, G5, G6, G7, G8
  coordinatingDepts: string[] // PMD, QSB, CQA, SAC, PLP, GMS, BOM...
  keyDeliverables: string
  frequency: string
  raciRole: "R" | "A" | "C" | "I" // Role của DMD
  activeTasksCount: number
  completedTasksCount: number
  status: "ACTIVE" | "COMPLETED" | "IN_PROGRESS"
}

export interface CompetencyFilterState {
  searchQuery: string
  selectedGroup: MainGroupId | "ALL"
  selectedStage: string | "ALL"
  selectedDept: string | "ALL"
}
