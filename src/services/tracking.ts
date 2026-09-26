import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  BatchTrackingPointsRequest,
  BatchTrackingPointsResponse,
  CreateTrackingSessionRequest,
  IQueryTrackingSessions,
  ItemResponse,
  ListResponse,
  TrackingPointResponse,
  TrackingSessionResponse,
} from "@/types"

const url = (path = "") => `${API_V1}/tracking${path}`

export const TrackingAPI = {
  /** GET /api/tracking/sessions */
  getSessions: (params: IQueryTrackingSessions = {}) =>
    apiClient.get<ListResponse<TrackingSessionResponse>>(url("/sessions"), {
      params,
    }),

  /** GET /api/tracking/sessions/{id} */
  getSessionById: (id: number) =>
    apiClient.get<ItemResponse<TrackingSessionResponse>>(
      url(`/sessions/${id}`),
    ),

  /** GET /api/tracking/sessions/{id}/points */
  getSessionPoints: (id: number) =>
    apiClient.get<ListResponse<TrackingPointResponse>>(
      url(`/sessions/${id}/points`),
    ),

  /** POST /api/tracking/sessions */
  getOrCreateSession: (data: CreateTrackingSessionRequest) =>
    apiClient.post<ItemResponse<TrackingSessionResponse>>(
      url("/sessions"),
      data,
    ),

  /** POST /api/tracking/sessions/{sessionId}/points */
  recordPoints: (sessionId: number, data: BatchTrackingPointsRequest) =>
    apiClient.post<ItemResponse<BatchTrackingPointsResponse>>(
      url(`/sessions/${sessionId}/points`),
      data,
    ),
}
