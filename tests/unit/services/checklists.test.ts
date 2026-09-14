import { beforeEach, describe, expect, it, vi } from "vitest"
import { axios } from "@/lib/axios"
import { API_V1 } from "@/lib/config"
import { ChecklistsAPI, ChecklistTemplatesAPI } from "@/services/checklists"

vi.mock("@/lib/axios", () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("ChecklistsAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should export ChecklistTemplatesAPI as alias of ChecklistsAPI", () => {
    expect(ChecklistTemplatesAPI).toBe(ChecklistsAPI)
  })

  it("calls GET /checklists with search params", async () => {
    const params = { keyword: "giàn giáo", page: 0, limit: 10 }
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await ChecklistsAPI.getAll(params)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/checklists`, {
      params,
    })
  })

  it("calls GET /checklists/{id} to get a checklist", async () => {
    ;(axios.get as any).mockResolvedValue({ result: { id: 10 } })

    await ChecklistsAPI.getOne(10)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/checklists/10`)
  })

  it("calls POST /checklists to create a checklist", async () => {
    const payload = {
      code: "NVLG-PCD-CHECKLIST - F1.1",
      name: "Checklist an toàn",
      taskItemId: 216,
      custodianDepartment: "Ban QLTC",
    }
    ;(axios.post as any).mockResolvedValue({ result: { id: 1, ...payload } })

    await ChecklistsAPI.createOne(payload)
    expect(axios.post).toHaveBeenCalledWith(`${API_V1}/checklists`, payload)
  })

  it("calls PATCH /checklists/{id} to update a checklist", async () => {
    const payload = { name: "Checklist an toàn mới" }
    ;(axios.patch as any).mockResolvedValue({ result: { id: 1, ...payload } })

    await ChecklistsAPI.updateOne(1, payload)
    expect(axios.patch).toHaveBeenCalledWith(`${API_V1}/checklists/1`, payload)
  })

  it("calls DELETE /checklists/{id} to delete a checklist", async () => {
    ;(axios.delete as any).mockResolvedValue({ result: null })

    await ChecklistsAPI.deleteOne(1)
    expect(axios.delete).toHaveBeenCalledWith(`${API_V1}/checklists/1`)
  })

  it("calls PATCH /checklists/{id}/activate to activate a checklist", async () => {
    ;(axios.patch as any).mockResolvedValue({
      result: { id: 1, isActive: true },
    })

    await ChecklistsAPI.activate(1)
    expect(axios.patch).toHaveBeenCalledWith(`${API_V1}/checklists/1/activate`)
  })

  it("calls PATCH /checklists/{id}/deactivate to deactivate a checklist", async () => {
    ;(axios.patch as any).mockResolvedValue({
      result: { id: 1, isActive: false },
    })

    await ChecklistsAPI.deactivate(1)
    expect(axios.patch).toHaveBeenCalledWith(
      `${API_V1}/checklists/1/deactivate`,
    )
  })

  it("calls GET /checklists/{id}/items to get item tree", async () => {
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await ChecklistsAPI.getItemsTree(5)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/checklists/5/items`)
  })

  it("calls POST /checklists/{checklistId}/items to add an item", async () => {
    const payload = {
      title: "Kiểm tra bu lông neo",
      checkingMethod: "Quan sát trực tiếp",
      orderIndex: 0,
      requirementType: "IMAGE" as const,
      parentId: null,
    }
    ;(axios.post as any).mockResolvedValue({ result: { id: 20, ...payload } })

    await ChecklistsAPI.addItem(5, payload)
    expect(axios.post).toHaveBeenCalledWith(
      `${API_V1}/checklists/5/items`,
      payload,
    )
  })

  it("calls PATCH /checklists/{checklistId}/items/{itemId} to update an item", async () => {
    const payload = { title: "Kiểm tra mối hàn" }
    ;(axios.patch as any).mockResolvedValue({ result: { id: 20, ...payload } })

    await ChecklistsAPI.updateItem(5, 20, payload)
    expect(axios.patch).toHaveBeenCalledWith(
      `${API_V1}/checklists/5/items/20`,
      payload,
    )
  })

  it("calls DELETE /checklists/{checklistId}/items/{itemId} to delete an item", async () => {
    ;(axios.delete as any).mockResolvedValue({ result: null })

    await ChecklistsAPI.deleteItem(5, 20)
    expect(axios.delete).toHaveBeenCalledWith(`${API_V1}/checklists/5/items/20`)
  })

  it("calls PATCH /checklists/{checklistId}/items/reorder with items array", async () => {
    const items = [
      { id: 10, orderIndex: 0 },
      { id: 11, orderIndex: 1 },
    ]
    ;(axios.patch as any).mockResolvedValue({ result: [] })

    await ChecklistsAPI.reorderItems(5, items)
    expect(axios.patch).toHaveBeenCalledWith(
      `${API_V1}/checklists/5/items/reorder`,
      { items },
    )
  })
})
