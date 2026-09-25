import { mockStore } from "@/mocks/store"
import type {
  EvaluateStandardPayload,
  HeadcountStandardCreatePayload,
  HeadcountStandardQueryParams,
  HeadcountStandardResponse,
  HeadcountStandardUpdatePayload,
  ItemResponse,
  ListResponse,
  MessageResponse,
  StandardMatchResult,
} from "@/types"

export const StandardsAPI = {
  /** GET /api/standards */
  getAll: async (
    params: HeadcountStandardQueryParams = {},
  ): Promise<ListResponse<HeadcountStandardResponse>> => {
    return mockStore.getStandards(params)
  },

  /** GET /api/standards/{id} */
  getOne: async (
    id: number,
  ): Promise<ItemResponse<HeadcountStandardResponse>> => {
    const s = await mockStore.getStandard(id)
    return {
      code: 0,
      message: "Thành công",
      result: s,
    }
  },

  /** POST /api/standards */
  createOne: async (
    data: HeadcountStandardCreatePayload,
  ): Promise<ItemResponse<HeadcountStandardResponse>> => {
    const created = await mockStore.createStandard(data)
    return {
      code: 0,
      message: "Tạo định biên chuẩn thành công",
      result: created,
    }
  },

  /** PATCH /api/standards/{id} */
  updateOne: async (
    id: number,
    data: HeadcountStandardUpdatePayload,
  ): Promise<ItemResponse<HeadcountStandardResponse>> => {
    const updated = await mockStore.updateStandard(id, data)
    return {
      code: 0,
      message: "Cập nhật định biên chuẩn thành công",
      result: updated,
    }
  },

  /** DELETE /api/standards/{id} */
  deleteOne: async (id: number): Promise<ItemResponse<MessageResponse>> => {
    await mockStore.deleteStandard(id)
    return {
      code: 0,
      message: "Xóa định biên chuẩn thành công",
      result: { message: "Xóa định biên chuẩn thành công" },
    }
  },

  /** POST /api/standards/evaluate */
  evaluate: async (
    payload: EvaluateStandardPayload,
  ): Promise<ItemResponse<StandardMatchResult[]>> => {
    const res = await mockStore.evaluateStandards(payload)
    return {
      code: 0,
      message: "Thành công",
      result: res,
    }
  },
}
