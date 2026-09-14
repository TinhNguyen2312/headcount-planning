import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useAuth from "@/hooks/useAuth"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import type { ProjectSummary } from "@/types"

const { mockProjectQueries } = vi.hoisted(() => ({
  mockProjectQueries: { useList: vi.fn(), useAllList: vi.fn() },
}))

vi.mock("@/hooks/useAuth", () => ({
  default: vi.fn(),
}))

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: mockProjectQueries,
}))

const row = (overrides: Partial<ProjectSummary>): ProjectSummary => ({
  id: 1,
  name: "Project 1",
  roleId: 1,
  roleName: "Role 1",
  projectRole: "TASK_EXECUTOR",
  ...overrides,
})

describe("useProjectSelector", () => {
  beforeEach(() => {
    mockProjectQueries.useAllList.mockReturnValue({ data: [] })
  })

  it("dedupes projects by id", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        projects: [
          row({ id: 1, name: "A", roleId: 1 }),
          row({ id: 1, name: "A", roleId: 2 }),
          row({ id: 2, name: "B", roleId: 3 }),
        ],
        currentProject: null,
      },
    } as any)

    const { result } = renderHook(() => useProjectSelector())

    expect(result.current.projects).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ])
    expect(result.current.hasAnyProject).toBe(true)
  })

  it("restricts the option list to the given eligible roles", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        projects: [
          row({ id: 1, name: "A", projectRole: "TASK_EXECUTOR" }),
          row({ id: 2, name: "B", projectRole: "PROJECT_ADMIN" }),
        ],
        currentProject: null,
      },
    } as any)

    const { result } = renderHook(() =>
      useProjectSelector(["PROJECT_ADMIN", "ZONE_ADMIN"]),
    )

    expect(result.current.projects).toEqual([{ id: 2, name: "B" }])
  })

  it("reports no eligible project when none match", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        projects: [row({ id: 1, name: "A", projectRole: "TASK_EXECUTOR" })],
        currentProject: null,
      },
    } as any)

    const { result } = renderHook(() => useProjectSelector(["PROJECT_ADMIN"]))

    expect(result.current.hasAnyProject).toBe(false)
    expect(result.current.selectedProjectId).toBeUndefined()
  })

  it("defaults to the pinned project when it is eligible", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        projects: [row({ id: 1, name: "A" }), row({ id: 2, name: "B" })],
        currentProject: row({ id: 2, name: "B" }),
      },
    } as any)

    const { result } = renderHook(() => useProjectSelector())

    expect(result.current.selectedProjectId).toBe(2)
  })

  it("falls back to the first eligible project when the pinned one isn't eligible", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        projects: [
          row({ id: 1, name: "A", projectRole: "PROJECT_ADMIN" }),
          row({ id: 2, name: "B", projectRole: "TASK_EXECUTOR" }),
        ],
        currentProject: row({
          id: 2,
          name: "B",
          projectRole: "TASK_EXECUTOR",
        }),
      },
    } as any)

    const { result } = renderHook(() => useProjectSelector(["PROJECT_ADMIN"]))

    expect(result.current.selectedProjectId).toBe(1)
  })

  it("returns all system projects with limit: 100 for SUPER_ADMIN regardless of role filter", () => {
    const allSystemProjects = [
      { id: 1, name: "Project Alpha" },
      { id: 2, name: "Project Beta" },
      { id: 3, name: "Project Gamma" },
      { id: 4, name: "Project Delta" },
      { id: 5, name: "Project Epsilon" },
      { id: 6, name: "Project Zeta" },
      { id: 7, name: "Project Eta" },
      { id: 8, name: "Project Theta" },
      { id: 9, name: "Project Iota" },
    ]

    mockProjectQueries.useAllList.mockImplementation((params, options) => {
      expect(options?.enabled).toBe(true)
      return { data: allSystemProjects }
    })

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 99,
        fullName: "Super Administrator",
        systemRole: "SUPER_ADMIN",
        projects: [
          row({ id: 1, name: "Project Alpha", projectRole: "PROJECT_ADMIN" }),
        ],
        currentProject: null,
      },
      isSuperUser: true,
    } as any)

    const { result } = renderHook(() =>
      useProjectSelector(["PROJECT_ADMIN", "ZONE_ADMIN", "TASK_INSPECTOR"]),
    )

    expect(result.current.projects).toHaveLength(9)
    expect(result.current.projects).toEqual(allSystemProjects)
    expect(result.current.hasAnyProject).toBe(true)
    expect(result.current.selectedProjectId).toBe(1)
  })
})
