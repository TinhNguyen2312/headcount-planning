import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RoleModal from "@/components/Role/RoleModal"
import { departmentQueries } from "@/hooks/server/departments"
import { roleQueries } from "@/hooks/server/roles"
import type { RoleResponse } from "@/types"

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: {
    useList: vi.fn(),
    useCreate: vi.fn(),
    useUpdate: vi.fn(),
  },
}))

vi.mock("@/hooks/server/departments", () => ({
  departmentQueries: { useList: vi.fn() },
}))

const mockRole: RoleResponse = {
  id: 1,
  code: "20047380",
  shortCode: "GD_PGD",
  name: "Giám đốc Dự án",
  level: 1,
  parentRoleId: null,
  departmentId: null,
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
}

describe("RoleModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(departmentQueries.useList).mockReturnValue({ data: [] } as any)
    vi.mocked(roleQueries.useCreate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(roleQueries.useUpdate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
  })

  it("renders correctly when roles is an array", () => {
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: [mockRole],
    } as any)

    render(<RoleModal role={mockRole} open={true} onCancel={vi.fn()} />)

    expect(
      screen.getByText('Cập nhật thông tin của "Giám đốc Dự án".'),
    ).toBeTruthy()
  })

  it("renders correctly when roles is an envelope object with data property", () => {
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: { data: [mockRole], meta: { total: 1 } },
    } as any)

    render(<RoleModal role={mockRole} open={true} onCancel={vi.fn()} />)

    expect(
      screen.getByText('Cập nhật thông tin của "Giám đốc Dự án".'),
    ).toBeTruthy()
  })

  it("renders correctly when roles is undefined/null", () => {
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: undefined,
    } as any)

    render(<RoleModal role={mockRole} open={true} onCancel={vi.fn()} />)

    expect(
      screen.getByText('Cập nhật thông tin của "Giám đốc Dự án".'),
    ).toBeTruthy()
  })

  it("renders Add Role mode correctly when role is not provided", () => {
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: [mockRole],
    } as any)

    render(<RoleModal open={true} onCancel={vi.fn()} />)

    expect(
      screen.getByText(
        "Tạo mới chức vụ và thiết lập vị trí trong cơ cấu tổ chức.",
      ),
    ).toBeTruthy()
    expect(screen.getByText("Thêm chức vụ")).toBeTruthy()
  })
})
