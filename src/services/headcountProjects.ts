import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  HeadcountProjectCreatePayload,
  HeadcountProjectQueryParams,
  HeadcountProjectResponse,
  HeadcountProjectUpdatePayload,
  ItemResponse,
  ListResponse,
  MessageResponse,
} from "@/types"

const BASE_URL = `${API_V1}/headcount-projects`

export interface AvailableProjectItem {
  id: number
  code: string | null
  name: string
  address?: string | null
  status: string
  regionId?: number | null
  regionName?: string | null
  sectorId?: number | null
  sectorName?: string | null
}

export const HeadcountProjectsAPI = {
  /** GET /api/headcount-projects */
  getAll: (params?: HeadcountProjectQueryParams) =>
    apiClient.get<ListResponse<HeadcountProjectResponse>>(BASE_URL, {
      params,
    }),

  /** GET /api/headcount-projects/{id} */
  getOne: (id: number) =>
    apiClient.get<ItemResponse<HeadcountProjectResponse>>(`${BASE_URL}/${id}`),

  /** GET /api/headcount-projects/available-projects */
  getAvailableProjects: () =>
    apiClient.get<ListResponse<AvailableProjectItem>>(
      `${BASE_URL}/available-projects`,
    ),

  /** POST /api/headcount-projects */
  create: (data: HeadcountProjectCreatePayload) =>
    apiClient.post<ItemResponse<HeadcountProjectResponse>>(BASE_URL, data),

  /** PATCH /api/headcount-projects/{id} */
  update: (id: number, data: HeadcountProjectUpdatePayload) =>
    apiClient.patch<ItemResponse<HeadcountProjectResponse>>(
      `${BASE_URL}/${id}`,
      data,
    ),

  /** DELETE /api/headcount-projects/{id} */
  delete: (id: number) =>
    apiClient.delete<ItemResponse<MessageResponse>>(`${BASE_URL}/${id}`),
}
