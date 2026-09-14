import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useActiveProjectId } from "@/hooks/useActiveProjectId"
import { authStore } from "@/stores/authStore"

const { mockUseParams } = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
}))

vi.mock("@tanstack/react-router", () => ({
  useParams: mockUseParams,
}))

describe("useActiveProjectId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStore.setState({ currentProject: null, role: null })
  })

  it("prioritizes explicitProjectId over route param and authStore", () => {
    mockUseParams.mockReturnValue({ projectId: "42" })
    authStore.setState({
      currentProject: {
        id: 99,
        roleId: 1,
        roleName: "Admin",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    })

    const { result } = renderHook(() => useActiveProjectId(10))
    expect(result.current).toBe(10)
  })

  it("uses route param when explicitProjectId is undefined", () => {
    mockUseParams.mockReturnValue({ projectId: "42" })
    authStore.setState({
      currentProject: {
        id: 99,
        roleId: 1,
        roleName: "Admin",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    })

    const { result } = renderHook(() => useActiveProjectId())
    expect(result.current).toBe(42)
  })

  it("ignores invalid explicitProjectId and falls back to route param", () => {
    mockUseParams.mockReturnValue({ projectId: "42" })
    const { result } = renderHook(() => useActiveProjectId(Number.NaN))
    expect(result.current).toBe(42)
  })

  it("falls back to authStore currentProject.projectId when route param is absent", () => {
    mockUseParams.mockReturnValue({})
    authStore.setState({
      currentProject: {
        projectId: 77,
        roleId: 1,
        roleName: "Admin",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    })

    const { result } = renderHook(() => useActiveProjectId())
    expect(result.current).toBe(77)
  })

  it("falls back to authStore currentProject.id when projectId field is absent", () => {
    mockUseParams.mockReturnValue({})
    authStore.setState({
      currentProject: {
        id: 88,
        roleId: 1,
        roleName: "Admin",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    })

    const { result } = renderHook(() => useActiveProjectId())
    expect(result.current).toBe(88)
  })

  it("returns undefined when no project ID is available from any source", () => {
    mockUseParams.mockReturnValue({})
    const { result } = renderHook(() => useActiveProjectId())
    expect(result.current).toBeUndefined()
  })

  it("ignores non-numeric route params and falls back to authStore", () => {
    mockUseParams.mockReturnValue({ projectId: "invalid-id" })
    authStore.setState({
      currentProject: {
        id: 55,
        roleId: 1,
        roleName: "Admin",
        projectRole: "PROJECT_ADMIN",
      },
      role: "PROJECT_ADMIN",
    })

    const { result } = renderHook(() => useActiveProjectId())
    expect(result.current).toBe(55)
  })
})
