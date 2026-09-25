/**
 * Types for DMD Work Tracking & KPI Management Module
 * Conforming to:
 * - Note in Nghiep vu DMD theo SOP_Draf 02.xlsx (Tick cv + nv, kiểm soát cá nhân, work tháng/tuần)
 * - RACI 3.1: Kế hoạch hoạt động năm (AOP) và KPI
 * - RACI 3.2: Quản lý hiệu suất nhân sự theo SMART
 * - RACI 3.3.6: Báo cáo tuần gửi GMD
 * - 23 Nghiệp vụ chuyên môn con DMD
 */

import { DisciplineType } from "../deliverables/types"

export type WorkStatus = "TODO" | "IN_PROGRESS" | "DONE" | "DELAYED"

export interface WeeklyWorkItem {
  id: string
  taskTitle: string
  assigneeName: string
  assigneeRole: string
  discipline: DisciplineType
  competencyCode: string // e.g. "1.1", "2.1", "2.6", "2.9", "2.5.1"
  competencyName: string
  stageCode: string // "G1" - "G8"
  relatedDwgCode?: string
  plannedDays: number
  dueDate: string
  completedDate?: string
  status: WorkStatus
  isOverdue: boolean
  kpiWeight: number // Trọng số % (e.g. 10%, 15%)
  notes?: string
}

export interface StaffKpiRecord {
  id: string
  staffName: string
  staffRole: string
  discipline: DisciplineType
  avatarBg: string
  totalTasks: number
  doneTasks: number
  delayedTasks: number
  onTimeRate: number // Tỷ lệ đúng hạn %
  kpiScore: number // Điểm KPI thang 100
  kpiGrade: "A" | "B" | "C" | "D"
  keyStrengths: string
  developmentGoals: string
}

export interface WeeklyReportData {
  reportWeek: string // "Tuần 38 (21/09 - 27/09/2026)"
  projectCode: string
  author: string
  reviewer: string
  completedSummary: string // Đánh giá công việc hoàn thành trong tuần theo kế hoạch
  overallProgressRate: number // Đánh giá tiến độ thiết kế hoàn thành trên tổng tiến độ dự án
  riskAndBlockers: string // Các vấn đề tồn đọng tiến độ, chất lượng & đề xuất xử lý
  nextWeekActionPlan: string // Kế hoạch công việc cho tuần tiếp theo
}
