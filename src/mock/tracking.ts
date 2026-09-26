import type { TrackingPointResponse, TrackingSessionResponse } from "@/types"

export const MOCK_TRACKING_SESSIONS: TrackingSessionResponse[] = [
  {
    id: 1,
    userId: 7,
    userName: "Nguyễn Văn Hùng",
    projectId: 1,
    projectName: "NovaWorld Phan Thiết",
    zoneId: 1,
    zoneName: "Phân khu 1 - Florida",
    createdAt: "2026-03-25T07:30:00Z",
    pointsCount: 8,
    latestRecordedAt: "2026-03-25T09:15:00Z",
  },
  {
    id: 2,
    userId: 10,
    userName: "Vũ Nhật Minh",
    projectId: 1,
    projectName: "NovaWorld Phan Thiết",
    zoneId: 1,
    zoneName: "Phân khu 1 - Florida",
    createdAt: "2026-03-25T07:45:00Z",
    pointsCount: 6,
    latestRecordedAt: "2026-03-25T09:20:00Z",
  },
]

export const MOCK_TRACKING_POINTS: Record<number, TrackingPointResponse[]> = {
  1: [
    { id: 1, sessionId: 1, lat: 10.8652, lng: 108.0691, recordedAt: "2026-03-25T07:35:00Z", speed: 1.2 },
    { id: 2, sessionId: 1, lat: 10.8660, lng: 108.0705, recordedAt: "2026-03-25T07:50:00Z", speed: 1.1 },
    { id: 3, sessionId: 1, lat: 10.8672, lng: 108.0718, recordedAt: "2026-03-25T08:10:00Z", speed: 0.8 },
    { id: 4, sessionId: 1, lat: 10.8685, lng: 108.0725, recordedAt: "2026-03-25T08:30:00Z", speed: 0.2 },
    { id: 5, sessionId: 1, lat: 10.8691, lng: 108.0732, recordedAt: "2026-03-25T08:50:00Z", speed: 0.5 },
    { id: 6, sessionId: 1, lat: 10.8702, lng: 108.0740, recordedAt: "2026-03-25T09:15:00Z", speed: 0.3 },
  ],
  2: [
    { id: 7, sessionId: 2, lat: 10.8648, lng: 108.0682, recordedAt: "2026-03-25T07:50:00Z", speed: 1.4 },
    { id: 8, sessionId: 2, lat: 10.8655, lng: 108.0695, recordedAt: "2026-03-25T08:15:00Z", speed: 0.9 },
    { id: 9, sessionId: 2, lat: 10.8668, lng: 108.0709, recordedAt: "2026-03-25T08:45:00Z", speed: 0.4 },
    { id: 10, sessionId: 2, lat: 10.8675, lng: 108.0715, recordedAt: "2026-03-25T09:20:00Z", speed: 0.2 },
  ],
}
