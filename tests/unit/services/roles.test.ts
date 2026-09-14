import { beforeEach, describe, expect, it, vi } from "vitest"
import { axios } from "@/lib/axios"
import { API_V1 } from "@/lib/config"
import { RolesAPI } from "@/services/roles"

vi.mock("@/lib/axios", () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("RolesAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls GET /roles with default limit: 100 when no params provided", async () => {
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await RolesAPI.getAll()
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/roles`, {
      params: { limit: 100 },
    })
  })

  it("calls GET /roles and preserves custom params while overriding limit if specified", async () => {
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await RolesAPI.getAll({ keyword: "GĐ", page: 1, limit: 20 })
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/roles`, {
      params: { keyword: "GĐ", page: 1, limit: 20 },
    })
  })

  it("calls GET /roles/{id} to get a role", async () => {
    ;(axios.get as any).mockResolvedValue({ result: { id: 1 } })

    await RolesAPI.getOne(1)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/roles/1`)
  })

  it("calls POST /roles to create a role", async () => {
    const payload = {
      code: "TEST_ROLE",
      name: "Chức danh thử nghiệm",
      level: 2,
    }
    ;(axios.post as any).mockResolvedValue({ result: { id: 15, ...payload } })

    await RolesAPI.createOne(payload)
    expect(axios.post).toHaveBeenCalledWith(`${API_V1}/roles`, payload)
  })

  it("calls PATCH /roles/{id} to update a role", async () => {
    const payload = { name: "Chức danh đã sửa" }
    ;(axios.patch as any).mockResolvedValue({ result: { id: 1, ...payload } })

    await RolesAPI.updateOne(1, payload)
    expect(axios.patch).toHaveBeenCalledWith(`${API_V1}/roles/1`, payload)
  })

  it("calls DELETE /roles/{id} to delete a role", async () => {
    ;(axios.delete as any).mockResolvedValue({ result: null })

    await RolesAPI.deleteOne(1)
    expect(axios.delete).toHaveBeenCalledWith(`${API_V1}/roles/1`)
  })

  it("calls GET /roles/tree to get role hierarchy", async () => {
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await RolesAPI.getTree()
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/roles/tree`)
  })
})
