import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  ItemResponse,
  MessageResponse,
  SaveUserCoverageRequest,
  ScheduleCoverageResponse,
  UserScheduleConfigResponse,
} from "@/types"

const userScheduleUrl = (path = "") => `${API_V1}/user-schedules${path}`

export const UserSchedulesAPI = {
  /** GET /api/user-schedules/config */
  getConfig: (projectId: number, userId: number) =>
    apiClient.get<ItemResponse<UserScheduleConfigResponse>>(
      userScheduleUrl("/config"),
      {
        params: { projectId, userId },
      },
    ),

  /** GET /api/user-schedules/coverage */
  getCoverage: (projectId: number, userId: number, weekStart?: string) =>
    apiClient.get<ItemResponse<ScheduleCoverageResponse>>(
      userScheduleUrl("/coverage"),
      {
        params: { projectId, userId, weekStart },
      },
    ),

  /** PATCH /api/user-schedules/coverage */
  saveCoverage: (data: SaveUserCoverageRequest) =>
    apiClient.patch<ItemResponse<MessageResponse>>(
      userScheduleUrl("/coverage"),
      data,
    ),
}
