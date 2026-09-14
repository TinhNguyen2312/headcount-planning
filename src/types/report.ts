import type { IBaseQuery } from "./common"

export interface ZoneProgressResponse {
  zoneId: number
  zoneName: string
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export interface ProjectProgressReportResponse {
  projectId: number
  projectName: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  zonesProgress: ZoneProgressResponse[]
}

export interface OverdueTaskReportResponse {
  taskInstanceId: number
  taskTitle: string
  projectName: string
  zoneName: string
  executorName: string
  managerName: string
  escalateLevel: "LOW" | "MEDIUM" | "HIGH" | string
  slaDeadline: string
  overdueHours: number
}

export interface RolePerformanceReportResponse {
  roleId: number
  roleName: string
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  reworkTasks: number
  completionRate: number
}

export interface UserPerformanceReportResponse {
  userId: number
  userName: string
  totalAssigned: number
  totalCompleted: number
  totalPassed: number
  totalFailed: number
  totalOverdue: number
  passRate: number
}

export interface IQueryProgressReport extends IBaseQuery {
  projectId?: number
  fromDate?: string
  toDate?: string
}

export interface IQueryOverdueReport extends IBaseQuery {
  projectId?: number
  zoneId?: number
  escalateLevel?: string
}

export interface IQueryRolePerformanceReport extends IBaseQuery {
  projectId?: number
  fromDate?: string
  toDate?: string
}

export interface IQueryUserPerformanceReport extends IBaseQuery {
  userId?: number
  fromDate?: string
  toDate?: string
}

export type IQueryReports = IQueryProgressReport &
  IQueryOverdueReport &
  IQueryRolePerformanceReport &
  IQueryUserPerformanceReport
