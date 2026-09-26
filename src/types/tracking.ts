import type { IBaseQuery } from "./common"

export interface TrackingSessionResponse {
  id: number
  userId: number
  userName: string
  projectId: number
  projectName: string
  zoneId: number
  zoneName: string
  createdAt: string
  pointsCount: number
  latestRecordedAt: string
}

export interface TrackingPointResponse {
  id: number
  sessionId: number
  lat: number
  lng: number
  accuracy?: number
  speed?: number
  altitude?: number
  recordedAt: string
  receivedAt?: string
}

export interface CreateTrackingSessionRequest {
  projectId: number
  zoneId?: number
}

export interface TrackingPointItemRequest {
  lat: number
  lng: number
  accuracy?: number
  speed?: number
  altitude?: number
  recordedAt: string
}

export interface BatchTrackingPointsRequest {
  points: TrackingPointItemRequest[]
}

export interface BatchTrackingPointsResponse {
  sessionId: number
  insertedCount: number
}

export interface IQueryTrackingSessions extends IBaseQuery {
  projectId?: number
  zoneId?: number
  userId?: number
  fromDate?: string
  toDate?: string
}
