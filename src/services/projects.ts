import { mockStore } from "@/mocks/store"
import type {
  IQueryProjects,
  ItemResponse,
  ListResponse,
  MessageResponse,
  ProjectCreate,
  ProjectMemberQueryParams,
  ProjectMemberResponse,
  ProjectResponse,
  ProjectUpdate,
  UpdateBoundaryRequest,
  ZoneCreate,
  ZoneResponse,
  ZoneUpdate,
} from "@/types"

export const ProjectsAPI = {
  /** GET /api/projects */
  getAll: async (
    params: IQueryProjects = {},
  ): Promise<ListResponse<ProjectResponse>> => {
    return mockStore.getProjects(params)
  },

  /** GET /api/projects/{id} */
  getOne: async (id: number): Promise<ItemResponse<ProjectResponse>> => {
    const proj = await mockStore.getProject(id)
    return {
      code: 0,
      message: "Thành công",
      result: proj,
    }
  },

  /** POST /api/projects */
  createOne: async (
    data: ProjectCreate,
  ): Promise<ItemResponse<ProjectResponse>> => {
    const created = await mockStore.createProject(data)
    return {
      code: 0,
      message: "Tạo dự án thành công",
      result: created,
    }
  },

  /** PATCH /api/projects/{id} */
  updateOne: async (
    id: number,
    data: ProjectUpdate,
  ): Promise<ItemResponse<ProjectResponse>> => {
    const updated = await mockStore.updateProject(id, data)
    return {
      code: 0,
      message: "Cập nhật dự án thành công",
      result: updated,
    }
  },

  /** PATCH /api/projects/{id}/boundary */
  updateBoundary: async (
    id: number,
    data: UpdateBoundaryRequest,
  ): Promise<ItemResponse<ProjectResponse>> => {
    const proj = await mockStore.getProject(id)
    if (proj) {
      proj.boundaryGeojson = data.boundaryGeojson
    }
    return {
      code: 0,
      message: "Cập nhật ranh giới thành công",
      result: proj!,
    }
  },

  /** GET /api/projects/{projectId}/members */
  getMembers: async (
    _projectId: number,
    _params: ProjectMemberQueryParams = {},
  ): Promise<ListResponse<ProjectMemberResponse>> => {
    return {
      code: 0,
      message: "Thành công",
      result: [],
      meta: {
        page: 1,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    }
  },

  /** DELETE /api/projects/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteProject(id)
    return {
      code: 0,
      message: "Xóa dự án thành công",
      result: { message: "Xóa dự án thành công" },
    }
  },
}

export const ZonesAPI = {
  /** GET /api/zones */
  getAll: async (
    params: {
      keyword?: string
      projectId?: number
      page?: number
      limit?: number
      sortBy?: string
      order?: string
    } = {},
  ): Promise<ListResponse<ZoneResponse>> => {
    return mockStore.getZones(params)
  },

  /** GET /api/zones/{id} */
  getOne: async (id: number): Promise<ItemResponse<ZoneResponse>> => {
    const zone = await mockStore.getZone(id)
    return {
      code: 0,
      message: "Thành công",
      result: zone,
    }
  },

  /** POST /api/zones */
  createOne: async (data: ZoneCreate): Promise<ItemResponse<ZoneResponse>> => {
    const created = await mockStore.createZone(data)
    return {
      code: 0,
      message: "Tạo phân khu thành công",
      result: created,
    }
  },

  /** PATCH /api/zones/{id} */
  updateOne: async (
    id: number,
    data: ZoneUpdate,
  ): Promise<ItemResponse<ZoneResponse>> => {
    const updated = await mockStore.updateZone(id, data)
    return {
      code: 0,
      message: "Cập nhật phân khu thành công",
      result: updated,
    }
  },

  /** DELETE /api/zones/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteZone(id)
    return {
      code: 0,
      message: "Xóa phân khu thành công",
      result: { message: "Xóa phân khu thành công" },
    }
  },
}
