import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AddProjectUser from "@/components/Projects/AddProjectUser"
import { projectQueries } from "@/hooks/server/projects"
import { mockRoles, mockUsers, mockZones } from "./setup"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useUsers: vi.fn(),
    useAddUser: vi.fn(),
    useZones: () => ({ data: mockZones }),
  },
  zoneQueries: {
    useList: () => ({ data: { result: mockZones }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: {
    useList: () => ({ data: mockRoles }),
  },
}))

vi.mock("@/hooks/server/users", () => ({
  userQueries: {
    useList: () => ({ data: { result: mockUsers }, isFetching: false }),
    useDetail: (id?: number) => ({
      data: mockUsers.find((u) => u.id === id),
      isFetching: false,
    }),
  },
}))

describe("AddProjectUser Component", () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: [] as any,
    } as any)
    vi.mocked(projectQueries.useAddUser).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it("renders Add User button", () => {
    render(<AddProjectUser projectId={1} excludeUserIds={[]} />)
    expect(screen.getByRole("button", { name: /Thêm nhân sự/i })).toBeTruthy()
  })

  it("opens modal when clicking Add User button and displays zone selection directly", async () => {
    render(<AddProjectUser projectId={1} excludeUserIds={[]} />)
    fireEvent.click(screen.getByRole("button", { name: /Thêm nhân sự/i }))
    expect(screen.getByText("Thêm nhân sự vào dự án")).toBeTruthy()
    expect(
      screen.getByText(/Khu vực phụ trách \(có thể chọn nhiều\)/i),
    ).toBeTruthy()
    expect(screen.queryByText(/Giám đốc quản lý toàn bộ dự án/i)).toBeNull()
  })

  it("does not render undefined when a zone is selected", async () => {
    render(<AddProjectUser projectId={1} excludeUserIds={[]} />)
    fireEvent.click(screen.getByRole("button", { name: /Thêm nhân sự/i }))

    const zoneSelect = screen.getByText("Chọn 1 hoặc nhiều phân khu...")
    fireEvent.mouseDown(zoneSelect)

    const zoneOption = await screen.findByText("Zone 1")
    expect(zoneOption).toBeTruthy()
    fireEvent.click(zoneOption)

    expect(screen.queryByText("undefined")).toBeNull()
  })
})
