import { mockStore } from "@/mocks/store"
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  PlanCreatePayload,
  PlanResponse,
  PlanUpdatePayload,
} from "@/types"

export const PlansAPI = {
  /** GET /api/projects/{projectId}/plans */
  getAll: async (projectId: number): Promise<ListResponse<PlanResponse>> => {
    return mockStore.getPlans(projectId)
  },

  /** GET /api/projects/{projectId}/plans/{planId} */
  getOne: async (
    projectId: number,
    planId: number,
  ): Promise<ItemResponse<PlanResponse>> => {
    const plan = await mockStore.getPlan(projectId, planId)
    return {
      code: 0,
      message: "Thành công",
      result: plan,
    }
  },

  /** POST /api/projects/{projectId}/plans */
  createOne: async (
    projectId: number,
    data: PlanCreatePayload,
  ): Promise<ItemResponse<PlanResponse>> => {
    const created = await mockStore.createPlan(projectId, data)
    return {
      code: 0,
      message: "Tạo kế hoạch thành công",
      result: created,
    }
  },

  /** PATCH /api/projects/{projectId}/plans/{planId} */
  updateOne: async (
    projectId: number,
    planId: number,
    data: PlanUpdatePayload,
  ): Promise<ItemResponse<PlanResponse>> => {
    const updated = await mockStore.updatePlan(projectId, planId, data)
    return {
      code: 0,
      message: "Cập nhật kế hoạch thành công",
      result: updated,
    }
  },

  /** DELETE /api/projects/{projectId}/plans/{planId} */
  deleteOne: async (
    projectId: number,
    planId: number,
  ): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deletePlan(projectId, planId)
    return {
      code: 0,
      message: "Xóa kế hoạch thành công",
      result: { message: "Xóa kế hoạch thành công" },
    }
  },

  /** POST /api/projects/{projectId}/plans/{planId}/activate */
  activateOne: async (
    projectId: number,
    planId: number,
  ): Promise<ItemResponse<PlanResponse>> => {
    const activated = await mockStore.activatePlan(projectId, planId)
    return {
      code: 0,
      message: "Kích hoạt kế hoạch thành công",
      result: activated,
    }
  },
}
