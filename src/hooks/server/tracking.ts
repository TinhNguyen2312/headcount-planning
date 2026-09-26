import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { TrackingAPI } from "@/services/tracking"
import type {
  BatchTrackingPointsRequest,
  CreateTrackingSessionRequest,
  IQueryTrackingSessions,
  ItemResponse,
  ListResponse,
  TrackingPointResponse,
  TrackingSessionResponse,
} from "@/types"
import {
  type QueryOptionsHelper,
  type SuspenseQueryOptionsHelper,
  useItemQuery,
  useListQuery,
  useSuspenseItemQuery,
  useSuspenseListQuery,
} from "./base"

export const trackingQueries = {
  all: () => ["tracking"] as const,
  sessionsKey: () => [...trackingQueries.all(), "sessions"] as const,
  detailsKey: () => [...trackingQueries.all(), "detail"] as const,
  pointsKey: () => [...trackingQueries.all(), "points"] as const,

  sessions: (params?: IQueryTrackingSessions) =>
    queryOptions({
      queryKey: [...trackingQueries.sessionsKey(), params] as const,
      queryFn: () => TrackingAPI.getSessions(params),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...trackingQueries.detailsKey(), id] as const,
      queryFn: () => TrackingAPI.getSessionById(id),
    }),

  points: (sessionId: number) =>
    queryOptions({
      queryKey: [...trackingQueries.pointsKey(), sessionId] as const,
      queryFn: () => TrackingAPI.getSessionPoints(sessionId),
    }),

  useSessions: <TSelected = TrackingSessionResponse[]>(
    params?: IQueryTrackingSessions,
    options?: QueryOptionsHelper<
      ListResponse<TrackingSessionResponse>,
      TSelected
    >,
  ) => useListQuery(trackingQueries.sessions(params), options),

  useSuspenseSessions: <TSelected = TrackingSessionResponse[]>(
    params?: IQueryTrackingSessions,
    options?: SuspenseQueryOptionsHelper<
      ListResponse<TrackingSessionResponse>,
      TSelected
    >,
  ) => useSuspenseListQuery(trackingQueries.sessions(params), options),

  useDetail: <TSelected = TrackingSessionResponse>(
    id?: number,
    options?: QueryOptionsHelper<
      ItemResponse<TrackingSessionResponse>,
      TSelected
    >,
  ) =>
    useItemQuery(trackingQueries.detail(id!), {
      enabled: !!id && options?.enabled !== false,
      ...options,
    }),

  useSuspenseDetail: <TSelected = TrackingSessionResponse>(
    id: number,
    options?: SuspenseQueryOptionsHelper<
      ItemResponse<TrackingSessionResponse>,
      TSelected
    >,
  ) => useSuspenseItemQuery(trackingQueries.detail(id), options),

  usePoints: <TSelected = TrackingPointResponse[]>(
    sessionId?: number,
    options?: QueryOptionsHelper<
      ListResponse<TrackingPointResponse>,
      TSelected
    >,
  ) =>
    useListQuery(trackingQueries.points(sessionId!), {
      enabled: !!sessionId && options?.enabled !== false,
      ...options,
    }),
}

export const useTrackingSessions = trackingQueries.useSessions
export const useSuspenseTrackingSessions = trackingQueries.useSuspenseSessions
export const useTrackingSessionDetail = trackingQueries.useDetail
export const useSuspenseTrackingSessionDetail =
  trackingQueries.useSuspenseDetail
export const useTrackingPoints = trackingQueries.usePoints

export const useCreateTrackingSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrackingSessionRequest) =>
      TrackingAPI.getOrCreateSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackingQueries.all() })
    },
  })
}

export const useRecordTrackingPoints = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: number
      data: BatchTrackingPointsRequest
    }) => TrackingAPI.recordPoints(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: [...trackingQueries.pointsKey(), sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: [...trackingQueries.detailsKey(), sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: trackingQueries.sessionsKey(),
      })
    },
  })
}
