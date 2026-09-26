import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  CopyScheduleRequest,
  CreateScheduleRequest,
  IQuerySchedules,
  ItemResponse,
  ListResponse,
  MessageResponse,
  SaveCoverageRequest,
  ScheduleMatrixResponse,
  ScheduleResponse,
  ToggleDayRequest,
  UpdateScheduleRequest,
} from "@/types"

const scheduleUrl = (path = "") => `${API_V1}/schedules${path}`

export const SchedulesAPI = {
  /** GET /api/schedules */
  getAll: (params?: IQuerySchedules) =>
    apiClient.get<ListResponse<ScheduleResponse>>(scheduleUrl(), {
      params,
    }),

  /** GET /api/schedules/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<ScheduleResponse>>(scheduleUrl(`/${id}`)),

  /** POST /api/schedules */
  createOne: (data: CreateScheduleRequest) =>
    apiClient.post<ItemResponse<ScheduleResponse>>(scheduleUrl(), data),

  /** PUT /api/schedules/{id} */
  updateOne: (id: number, data: UpdateScheduleRequest) =>
    apiClient.patch<ItemResponse<ScheduleResponse>>(
      scheduleUrl(`/${id}`),
      data,
    ),

  /** DELETE /api/schedules/{id} */
  deleteOne: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(scheduleUrl(`/${id}`)),

  /** PATCH /api/schedules/coverage */
  saveCoverage: (data: SaveCoverageRequest) =>
    apiClient.patch<ItemResponse<MessageResponse>>(
      scheduleUrl("/coverage"),
      data,
    ),

  /** PATCH /api/schedules/day */
  toggleCoverageDay: (data: ToggleDayRequest) =>
    apiClient.patch<ItemResponse<MessageResponse>>(scheduleUrl("/day"), data),

  /** POST /api/schedules/copy */
  copyRange: (data: CopyScheduleRequest) =>
    apiClient.post<ItemResponse<MessageResponse>>(scheduleUrl("/copy"), data),

  /** GET /api/schedules/matrix */
  getMatrix: (params: {
    projectId: number
    fromDate: string
    toDate: string
    zoneId?: number
  }) =>
    apiClient.get<ListResponse<ScheduleMatrixResponse>>(
      scheduleUrl("/matrix"),
      {
        params,
      },
    ),
}
