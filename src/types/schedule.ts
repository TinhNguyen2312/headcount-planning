import type { IBaseQuery } from "./common"

export type ScheduleStatus = "ACTIVE" | "CANCELLED"
export type ScheduleType = "SINGLE" | "WEEK" | "MONTH"

export interface ScheduleResponse {
  id: number
  projectId: number
  zoneId: number
  taskItemId: number
  roleId: number
  workDate: string
  assignedUserId?: number | null
  checklistId?: number | null
  status: ScheduleStatus
  createdBy?: number | null
  createdAt: string
  updatedAt?: string | null
}

export interface CreateScheduleRequest {
  projectId: number
  zoneId?: number | null
  taskItemId: number
  roleId: number
  scheduleType: ScheduleType
  scheduleStart: string
  daysOfWeek?: number[]
  workDates?: string[]
  assignedUserIds?: number[]
  checklistId?: number | null
}

export interface UpdateScheduleRequest {
  zoneId?: number | null
  taskItemId?: number | null
  roleId?: number | null
  workDate?: string | null
  assignedUserId?: number | null
  checklistId?: number | null
  status?: ScheduleStatus | null
}

export interface ScheduleAssignmentRequest {
  userId: number
  roleId?: number | null
  checklistId?: number | null
}

export interface ScheduleItemRequest {
  zoneId?: number | null
  taskItemId: number
  roleId?: number | null
  workDate: string
  assignments?: ScheduleAssignmentRequest[]
  assignedUserIds?: number[]
  checklistId?: number | null
}

export interface SaveCoverageRequest {
  projectId: number
  weekStart: string
  schedules: ScheduleItemRequest[]
}

export interface ToggleDayRequest {
  projectId: number
  zoneId?: number | null
  taskItemId: number
  date: string
  checked?: boolean
  assignedUserId?: number | null
  checklistId?: number | null
}

export interface CopyScheduleRequest {
  projectId: number
  zoneId?: number | null
  sourceFromDate: string
  sourceToDate: string
  targetFromDate: string
}

export interface IQuerySchedules extends IBaseQuery {
  projectId?: number
  zoneId?: number
  roleId?: number
}

export interface AssignedUserSummary {
  id: number
  name: string
  phone?: string | null
  roleId: number
  scheduleId?: number
  checklistId?: number | null
  checklistName?: string | null
}

export interface ScheduledDateDetail {
  scheduleId: number
  workDate: string
  assigned: AssignedUserSummary[]
  checklistId?: number | null
  checklistName?: string | null
}

export interface AvailableUserResponse {
  id?: number
  userId?: number
  fullName: string
  phone?: string | null
  perNumber?: string | null
  roleId?: number | null
  roleName?: string | null
}
export interface ScheduleMatrixRoleSummaryResponse {
  roleId: number
  roleName: string
}
export type ScheduleMatrixRoleSummary = ScheduleMatrixRoleSummaryResponse

export interface ScheduleMatrixResponse {
  projectId: number
  taskGroupId: number | null
  taskGroupName: string | null
  taskItemId: number
  taskItemTitle: string
  zoneId: number
  zoneName: string
  roleId: number
  roleName: string
  roles: ScheduleMatrixRoleSummaryResponse[]
  hasWarning?: boolean
  warningMessage?: string | null
  scheduledDates: ScheduledDateDetail[]
  availableUsers: AvailableUserResponse[]
}

export interface GenerateInstanceRequest {
  projectId: number
  zoneId?: number | null
  workDate: string
}
