import type { IBaseQuery } from "./common"

export interface ZoneProgressResponse {
  zoneId: number
  zoneName: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalParentTasks?: number
  runningParentTasks?: number
  totalChildTasks?: number
  runningChildTasks?: number
}

export interface ProjectProgressReportResponse {
  projectId: number
  projectName: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalParentTasks?: number
  runningParentTasks?: number
  totalChildTasks?: number
  runningChildTasks?: number
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
  lateTasks?: number
  overdueTasks: number
  reworkTasks: number
  completionRate: number
  bottleneck?: boolean
}

export interface ProgressTrendPoint {
  date: string
  plannedTasks: number
  actualCompletedTasks: number
  cumulativePlanned: number
  cumulativeActual: number
  completionRate?: number
}

export type TrendDataPoint = ProgressTrendPoint

export interface ProgressTrendReportResponse {
  projectId: number
  interval: "DAY" | "WEEK" | "MONTH" | string
  dataPoints: ProgressTrendPoint[]
}

export interface AtRiskTaskReportResponse {
  taskInstanceId: number
  taskTitle: string
  parentTaskTitle?: string
  zoneId?: number
  zoneName?: string
  executorId?: number
  executorName?: string
  slaDeadline: string
  minutesRemaining: number
  escalateLevel?: "LOW" | "MEDIUM" | "HIGH" | string
}

export interface LeaderboardUserResponse {
  rank: number
  userId: number
  userName: string
  roleName?: string
  departmentCode?: string
  departmentName?: string
  avatar?: string
  totalTasks: number
  onTimeTasks: number
  onTimeRate: number
  lateCompletedTasks: number
  lateRate: number
  uncompletedTasks: number
  uncompletedRate: number
  overdueTasks: number
  totalEarlyHours: number
}

export type LeaderboardReportResponse = LeaderboardUserResponse

export interface UserPerformanceReportResponse {
  userId: number
  userName: string
  roleName?: string
  departmentName?: string
  totalAssigned: number
  totalCompleted: number
  totalPassed: number
  totalFailed: number
  totalOverdue: number
  passRate: number
  completionRate?: number
  totalParentTasks?: number
  runningParentTasks?: number
  totalChildTasks?: number
  runningChildTasks?: number
  lateTasks?: number
  lateRate?: number
  totalLateHours?: number
  earlyTasks?: number
  earlyRate?: number
  totalEarlyHours?: number
}

export interface UserWorkloadHeatmapItem {
  date: string
  totalAssigned: number
  completedTasks: number
  overdueTasks: number
}

export type UserWorkloadHeatmapResponse = UserWorkloadHeatmapItem

export interface TaskBreakdownNode {
  id: number
  title: string
  total: number
  completedTasks: number
  uncompletedTasks: number
  overdueTasks: number
  childTasks: TaskBreakdownNode[]
}

export type UserTaskBreakdownResponse = TaskBreakdownNode

export interface IQueryProgressReport extends IBaseQuery {
  projectId?: number
  fromDate?: string
  toDate?: string
}

export interface IQueryProgressTrendReport extends IBaseQuery {
  projectId: number
  interval?: "DAY" | "WEEK" | "MONTH" | string
  fromDate?: string
  toDate?: string
}

export interface IQueryAtRiskReport extends IBaseQuery {
  projectId: number
  zoneId?: number
  withinMinutes?: number
  limit?: number
}

export interface IQueryLeaderboardReport extends IBaseQuery {
  projectId?: number
  departmentId?: number
  departmentCode?: string
  roleId?: number
  fromDate?: string
  toDate?: string
  sortBy?: "EFFICIENCY" | "SPEED" | "TOTAL_TASKS" | string
  limit?: number
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
  userId: number
  projectId?: number
  fromDate?: string
  toDate?: string
}

export interface IQueryUserWorkloadHeatmap extends IBaseQuery {
  userId: number
  projectId?: number
  yearMonth?: string
  fromDate?: string
  toDate?: string
}

export interface IQueryUserTaskBreakdown extends IBaseQuery {
  userId: number
  projectId?: number
  fromDate?: string
  toDate?: string
}

export type IQueryReports = IQueryProgressReport &
  IQueryProgressTrendReport &
  IQueryAtRiskReport &
  IQueryLeaderboardReport &
  IQueryOverdueReport &
  IQueryRolePerformanceReport &
  IQueryUserPerformanceReport &
  IQueryUserWorkloadHeatmap &
  IQueryUserTaskBreakdown
