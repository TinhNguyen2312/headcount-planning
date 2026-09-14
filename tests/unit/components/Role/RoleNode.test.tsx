import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import RoleNode from "@/components/Role/RoleNode"
import type { RoleResponse } from "@/types"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

const mockRole: RoleResponse = {
  id: 1,
  code: "20047380",
  name: "GĐ/PGĐ Phòng Quản lý Xây dựng, An toàn Lao động",
  shortCode: "GD_PGD",
  level: 1,
  parentRoleId: null,
  departmentId: 1,
  description: "Ban giám đốc",
  createdAt: "2026-01-01T00:00:00Z",
}

describe("RoleNode (SCRUM-118)", () => {
  it("renders role name, full tooltip and child count", () => {
    render(<RoleNode role={mockRole} childCount={3} expanded />)

    expect(
      screen.getByText("GĐ/PGĐ Phòng Quản lý Xây dựng, An toàn Lao động"),
    ).toBeTruthy()
    expect(screen.getByText("3 chức vụ con")).toBeTruthy()
  })
})
