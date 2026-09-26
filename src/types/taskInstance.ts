import type { IBaseQuery } from "./common"

export type TaskInstanceCategory = "DAILY" | "ADHOC"
export type TaskInstanceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"
  | "CANCELLED"

export type TaskInstanceEvaluate = "PASS" | "FAIL"

export interface InstanceResponse {
  id: number
  scheduleId: number | null
  projectId: number
  projectName: string | null
  zoneId: number | null
  zoneName: string | null
  roleId: number
  roleName: string | null
  assignedUserId: number | null
  assignedUserName: string | null
  assignedUserFullName: string | null
  workDate: string
  status: TaskInstanceStatus
  createdBy: number | null
  createdAt: string
}

export interface InstanceDetailResponse extends InstanceResponse {
  totalTasks: number
  doneTasks: number
  taskInstances?: TaskInstanceResponse[]
}

export interface IQueryTaskInstances extends IBaseQuery {
  projectId?: number
  zoneId?: number
  workDate?: string
  status?: TaskInstanceStatus
  assignedUserId?: number
}

// PATCH /instances/{id}/status
export interface UpdateInstanceStatusRequest {
  status: TaskInstanceStatus
}

export type TaskInstanceStageStatus =
  | "TODO"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"

export interface Requirement {
  type: "IMAGE" | "FILE" | "VIDEO" | "LINK"
  url: string
  title?: string
}

export interface AccMetadata {
  accItemId?: string
  submittalId?: string
  rfiId?: string
  issueId?: string
  specCode?: string
  packageTitle?: string
  dueDate?: string
  typeName: string
  specTitle: string
}
export interface TaskInstanceResponse {
  id: number
  instance: InstanceResponse
  taskItemId: number | null
  taskItemTitle: string | null
  parentTaskInstanceId: number | null
  title: string
  description: string | null
  category: TaskInstanceCategory
  orderIndex: number
  approvalLevel: 0 | 1 | 2
  stageStatus: TaskInstanceStageStatus
  approvalStep: number
  requirements: string[] | null
  attachments: string[] | null
  isDone: boolean
  metadata: { acc: AccMetadata; source: string }
  startTime: string | null
  endTime: string | null
  completedAt: string | null
  slaDeadline: string | null
  issueNote: string | null
  reviewerUserId: number | null
  evaluate: TaskInstanceEvaluate | null
  evaluateReason: string | null
  evaluatedAt: string | null
  originTaskInstanceId: number | null
  createdBy: number | null
  createdAt: string
  histories: TaskInstanceHistoryResponse[] | null
}

export interface TaskInstanceTreeNodeResponse extends TaskInstanceResponse {
  children: TaskInstanceTreeNodeResponse[]
}

export interface TaskInstanceHistoryResponse {
  id: number
  taskId: number
  userId: number
  email: string
  userFullName?: string | null
  status: TaskInstanceStageStatus
  datelastmaint: string
  note: string | null
}

// PATCH /task-instances/{id}/status
export interface UpdateTaskStatusRequest {
  stageStatus: TaskInstanceStageStatus
  note?: string | null
  requirements?: string[]
}

// PATCH /task-instances/{id}/evaluate
export interface EvaluateTaskRequest {
  evaluate: TaskInstanceEvaluate
  evaluateReason?: string | null
}

// GET /task-instances
export interface TaskInstanceFilters extends IBaseQuery {
  projectId?: number
  zoneId?: number
  assignedUserId?: number
  workDate?: string
  stageStatus?: TaskInstanceStageStatus
  category?: TaskInstanceCategory
  isDone?: boolean
}

// GET /task-instances/my-tasks
export interface MyTasksFilters extends IBaseQuery {
  projectId?: number
  zoneId?: number
  workDate?: string
  fromDate?: string
  toDate?: string
  stageStatus?: TaskInstanceStageStatus
  category?: TaskInstanceCategory
  isDone?: boolean
}

export interface SubordinateTaskFilters extends IBaseQuery {
  projectId?: number
  userId?: number
  workDate?: string
  stageStatus?: TaskInstanceStageStatus
  isDone?: boolean
}

// GET /task-instances/pending-approvals
export type PendingApprovalFilters = MyTasksFilters

// POST /task-instances/adhoc
export interface CreateAdhocTaskRequest {
  projectId: number
  zoneId?: number | null
  taskItemId?: number | null
  roleId: number
  assignedUserId: number
  workDate: string
  title: string
  description?: string | null
  attachments?: string[] | null
  slaHours?: number | null
  approvalLevel?: 0 | 1 | 2
}

export type SlaUrgency = "ON_TRACK" | "WARNING" | "OVERDUE"
