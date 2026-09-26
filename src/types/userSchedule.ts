import type { ZoneResponse } from "./project"
import type { ScheduleItemRequest, ScheduleResponse } from "./schedule"
import type { TaskItemResponse } from "./taskItem"
import type { UserResponse } from "./user"

export interface SaveUserCoverageRequest {
  projectId: number
  userId: number
  weekStart: string
  schedules: ScheduleItemRequest[]
}

export interface ScheduleTaskEntry {
  taskItem: TaskItemResponse
  schedules: ScheduleResponse[]
  zoneSchedules: ScheduleResponse[]
  zoneScheduleZoneName?: string | null
}

export interface UserScheduleConfigResponse {
  projectId: number
  user: UserResponse
  roleId: number
  roleName: string
  zones: ZoneResponse[]
  tasks: ScheduleTaskEntry[]
}

export interface CandidateResponse {
  userId: number
  fullName: string
  phone?: string | null
}

export interface ScheduleDayDetail {
  date: string
  weekday: number
  scheduled: boolean
  assignedUserIds: number[]
  assignedUserNames: string[]
  candidates?: CandidateResponse[]
  instanceAssignedUserId?: number | null
  instanceAssignedUserName?: string | null
  checklistId?: number | null
  checklistName?: string | null
}

export interface ScheduleCoverageRow {
  taskItemId: number
  taskTitle: string
  taskGroupId: number | null
  taskGroupName: string | null
  groupPath: string[]
  zoneId: number
  zoneName: string
  roleId: number | null
  roleName: string | null
  roleNames: string[]
  staffed: boolean
  days: ScheduleDayDetail[]
}

export interface ScheduleCoverageResponse {
  projectId: number
  weekStart: string
  weekEnd: string
  rows: ScheduleCoverageRow[]
}
