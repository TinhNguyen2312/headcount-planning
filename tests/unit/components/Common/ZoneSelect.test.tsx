import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ZoneSelect from "@/components/Common/ZoneSelect"
import { projectQueries } from "@/hooks/server/projects"
import type { UserProjectRoleDetailResponse, ZoneResponse } from "@/types"

const mockZones: ZoneResponse[] = [
  { id: 101, name: "Zone 1", code: "Z1", projectId: 1, description: "" },
  { id: 102, name: "Zone 2", code: "Z2", projectId: 1, description: "" },
  { id: 103, name: "Zone 3", code: "Z3", projectId: 1, description: "" },
]

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useUsers: vi.fn(),
    useZones: () => ({ data: mockZones }),
  },
  zoneQueries: {
    useList: () => ({ data: { result: mockZones }, isFetching: false }),
    useDetail: () => ({ data: undefined, isFetching: false }),
  },
}))

describe("ZoneSelect Component", () => {
  const existingZoneAdmin: UserProjectRoleDetailResponse = {
    id: 99,
    userId: 20, // Trần Văn B
    projectId: 1,
    zoneId: 101, // Zone 1
    roleId: 3,
    projectRole: "ZONE_ADMIN",
    isPrimary: true,
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    status: "ACTIVE",
    replacementUserId: null,
    replacementFrom: null,
    replacementTo: null,
    createdBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    userFullName: "Trần Văn B",
    roleName: "Trưởng phòng QLXD",
    projectName: "Aqua City",
    zoneName: "Zone 1",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useUsers).mockReturnValue({
      data: [existingZoneAdmin] as any,
    } as any)
  })

  it("renders with placeholder", () => {
    render(<ZoneSelect projectId={1} placeholder="Chọn phân khu test..." />)
    expect(screen.getByText("Chọn phân khu test...")).toBeTruthy()
  })

  it("does not disable any zone if role is not ZONE_ADMIN", async () => {
    render(
      <ZoneSelect
        projectId={1}
        projectRole="TASK_EXECUTOR"
        placeholder="Chọn phân khu..."
      />,
    )
    const select = screen.getByText("Chọn phân khu...")
    fireEvent.mouseDown(select)

    const zone1Option = await screen.findByText("Zone 1")
    expect(zone1Option).toBeTruthy()
    expect(screen.queryByText("Đã có Trưởng phòng khác")).toBeNull()
  })

  it("disables zone and shows warning if role is ZONE_ADMIN and zone is already taken", async () => {
    render(
      <ZoneSelect
        projectId={1}
        projectRole="ZONE_ADMIN"
        placeholder="Chọn phân khu..."
      />,
    )
    const select = screen.getByText("Chọn phân khu...")
    fireEvent.mouseDown(select)

    const warningText = await screen.findByText("Đã có Trưởng phòng khác")
    expect(warningText).toBeTruthy()
  })

  it("does not disable zone if excludeUserId matches the current zone admin", async () => {
    render(
      <ZoneSelect
        projectId={1}
        projectRole="ZONE_ADMIN"
        excludeUserId={20} // Trùng với userId của existingZoneAdmin
        placeholder="Chọn phân khu..."
      />,
    )
    const select = screen.getByText("Chọn phân khu...")
    fireEvent.mouseDown(select)

    await screen.findByText("Zone 1")
    expect(screen.queryByText("Đã có Trưởng phòng khác")).toBeNull()
  })

  it("calls onChange with ZoneResponse[] when mode is multiple", async () => {
    const handleChange = vi.fn()
    render(
      <ZoneSelect
        projectId={1}
        mode="multiple"
        placeholder="Chọn phân khu..."
        onChange={handleChange}
      />,
    )
    const select = screen.getByText("Chọn phân khu...")
    fireEvent.mouseDown(select)

    const zoneOption = await screen.findByText("Zone 1")
    fireEvent.click(zoneOption)

    expect(handleChange).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 101, name: "Zone 1" })],
      [101],
    )
  })

  it("calls onChange with zoneId and ZoneResponse when in single mode", async () => {
    const handleChange = vi.fn()
    render(
      <ZoneSelect
        projectId={1}
        placeholder="Chọn phân khu..."
        onChange={handleChange}
      />,
    )
    const select = screen.getByText("Chọn phân khu...")
    fireEvent.mouseDown(select)

    const zoneOption = await screen.findByText("Zone 1")
    fireEvent.click(zoneOption)

    expect(handleChange).toHaveBeenCalledWith(
      101,
      expect.objectContaining({ id: 101, name: "Zone 1" }),
    )
  })

  it("filters zones using filterItem prop", async () => {
    render(
      <ZoneSelect
        projectId={1}
        placeholder="Chọn phân khu..."
        filterItem={(z) => z.id !== 101}
      />,
    )
    const select = screen.getByText("Chọn phân khu...")
    fireEvent.mouseDown(select)

    expect(screen.queryByText("Zone 1")).toBeNull()
    const zone2Option = await screen.findByText("Zone 2")
    expect(zone2Option).toBeTruthy()
  })
})
