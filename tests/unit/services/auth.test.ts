import { beforeEach, describe, expect, it, vi } from "vitest"
import { axios } from "@/lib/axios"
import { API_V1 } from "@/lib/config"
import { AuthAPI } from "@/services/auth"

vi.mock("@/lib/axios", () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe("AuthAPI.me", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches the current user and unwraps the result envelope", async () => {
    const mockUserResponse = {
      result: {
        id: 12,
        fullName: "Tran Van B",
        email: "vanb@example.com",
        systemRole: "USER",
        projects: [
          {
            id: 5,
            name: "Aqua City",
            roleId: 2,
            roleName: "Kỹ sư giám sát",
            projectRole: "TASK_EXECUTOR",
          },
        ],
      },
    }

    ;(axios.get as any).mockResolvedValue(mockUserResponse)

    const user = await AuthAPI.me()

    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/auth/me`)
    expect(user.id).toBe(12)
    expect(user.projects).toEqual(mockUserResponse.result.projects)
  })

  it("returns the raw payload directly when there is no result envelope", async () => {
    const mockUser = {
      id: 12,
      fullName: "Tran Van B",
      email: "vanb@example.com",
      systemRole: "USER",
      projects: [],
    }

    ;(axios.get as any).mockResolvedValue(mockUser)

    const user = await AuthAPI.me()

    expect(user).toEqual(mockUser)
  })
})
