import type { IBaseQuery } from "./common"

export type SyncTriggerType = "MANUAL" | "SCHEDULED"
export type SyncStatus = "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL" | ""
export type SourceSystem = "ACC_SUBMITTAL" | "ACC_RFI" | "ACC_SCHEDULE" | ""

export interface SyncLogResponse {
  id: number
  sourceSystem: string
  triggerType: SyncTriggerType
  status: SyncStatus
  startedAt: string
  finishedAt?: string | null
  durationSeconds?: number | null
  recordsCreated?: number | null
  recordsUpdated?: number | null
  errorDetail?: string | null
  createdAt: string
}

export interface IQuerySyncLogs extends IBaseQuery {
  sourceSystem?: string
  status?: SyncStatus
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC"
}
