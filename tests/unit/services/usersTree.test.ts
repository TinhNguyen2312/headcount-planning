import { describe, expect, it, vi } from "vitest"
import { axios } from "@/lib/axios"
import { UsersAPI } from "@/services/users"
import type { UserTreeNodeResponse } from "@/types"

vi.mock("@/lib/axios", () => ({
  axios: {
    get: vi.fn(),
  },
}))

describe("UsersAPI.getTree", () => {
  const mockTree: UserTreeNodeResponse[] = [
    {
      id: 1,
      fullName: "GĐ Dự Án",
      email: "gd@example.com",
      status: "ACTIVE",
      perNumber: "P001",
      createdAt: "2026-01-01",
      projects: [],
      children: [],
    },
  ]

  it("passes all query parameters including fromUserId directly to backend API", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      code: 200,
      message: "Success",
      result: mockTree,
      data: mockTree,
    })

    const params = { projectId: 10, zoneId: 2, status: "ACTIVE", fromUserId: 5 }
    const res = await UsersAPI.getTree(params)

    expect(axios.get).toHaveBeenCalledWith("/api/users/tree", {
      params: { projectId: 10, zoneId: 2, status: "ACTIVE", fromUserId: 5 },
    })
    expect(res.result).toEqual(mockTree)
  })
})
