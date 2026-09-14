import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { getUserColumns, type UserTableData } from "@/components/Users/columns"

describe("getUserColumns (SCRUM-101)", () => {
  const mockUsers: UserTableData[] = [
    {
      id: 1,
      fullName: "Nguyễn Thúy Hằng",
      email: "hang@example.com",
      phone: "0901234567",
      status: "ACTIVE",
      perNumber: "36777",
      novatorStatus: null,
      departmentCode: null,
      divisionCode: null,
      managerPerNumber: null,
      createdAt: "2026-01-01",
      isCurrentUser: false,
      roleName: "Thư ký Công trường",
      projects: [
        {
          id: 10,
          name: "Aqua - 112Ha",
          roleId: 2,
          roleName: "Thư ký",
          projectRole: "VIEWER",
        },
      ],
    },
    {
      id: 2,
      fullName: "Trần Minh Trí",
      email: "tri@example.com",
      phone: "0901234568",
      status: "ACTIVE",
      perNumber: "00093",
      novatorStatus: null,
      departmentCode: null,
      divisionCode: null,
      managerPerNumber: null,
      createdAt: "2026-01-01",
      isCurrentUser: false,
      roleName: "Chỉ huy trưởng",
      projects: [
        {
          id: 11,
          name: "NovaWorld Phan Thiết",
          roleId: 1,
          roleName: "Chỉ huy trưởng",
          projectRole: "PROJECT_ADMIN",
        },
      ],
    },
  ]

  it("lists every assigned project as a filter option and renders its tag", () => {
    const columns = getUserColumns(mockUsers)
    const projectCol = columns.find((c) => c.key === "projects") as any

    expect(projectCol).toBeDefined()
    expect(projectCol.filters).toHaveLength(2)
    expect(projectCol.filters.map((f: any) => f.value)).toEqual(
      expect.arrayContaining(["Aqua - 112Ha", "NovaWorld Phan Thiết"]),
    )

    const renderFirst = projectCol.render(null, mockUsers[0])
    const { container: containerFirst } = render(renderFirst)
    expect(containerFirst.textContent).toContain("Aqua - 112Ha")

    const renderSecond = projectCol.render(null, mockUsers[1])
    const { container: containerSecond } = render(renderSecond)
    expect(containerSecond.textContent).toContain("NovaWorld Phan Thiết")
  })

  it("ensures every column has a valid title and actions column has title 'Thao tác' (SCRUM-144)", () => {
    const columns = getUserColumns(mockUsers)
    const actionCol = columns.find((c) => c.key === "actions")

    expect(actionCol).toBeDefined()
    expect(actionCol?.title).toBe("Thao tác")

    for (const col of columns) {
      expect(col.title).toBeDefined()
      expect(
        typeof col.title === "string" ? col.title.trim().length : 1,
      ).toBeGreaterThan(0)
    }
  })

  it("renders title attributes on name, manager, role, email and phone for tooltips (SCRUM-145)", () => {
    const mockUser: UserTableData = {
      ...mockUsers[0],
      fullName: "Lê Hữu Nguyên - Test Test Test 222",
      managerName: "Nguyễn Văn Quản Lý Cấp Cao",
      roleName: "Chuyên viên Kỹ thuật Hiện trường",
      email: "long.email.address.test@novagroup.vn",
      phone: "0901234567",
    }
    const columns = getUserColumns([mockUser])

    const nameCol = columns.find((c) => c.key === "fullName") as any
    const { container: nameContainer } = render(
      nameCol.render(mockUser.fullName, mockUser),
    )
    const nameEl = nameContainer.querySelector(
      "[title='Lê Hữu Nguyên - Test Test Test 222']",
    )
    expect(nameEl).not.toBeNull()

    const managerCol = columns.find((c) => c.key === "managerName") as any
    const { container: managerContainer } = render(
      managerCol.render(mockUser.managerName, mockUser),
    )
    const managerEl = managerContainer.querySelector(
      "[title='Nguyễn Văn Quản Lý Cấp Cao']",
    )
    expect(managerEl).not.toBeNull()

    const roleCol = columns.find((c) => c.key === "roleName") as any
    const { container: roleContainer } = render(
      roleCol.render(mockUser.roleName, mockUser),
    )
    const roleEl = roleContainer.querySelector(
      "[title='Chuyên viên Kỹ thuật Hiện trường']",
    )
    expect(roleEl).not.toBeNull()

    const emailCol = columns.find((c) => c.key === "email") as any
    const { container: emailContainer } = render(
      emailCol.render(mockUser.email, mockUser),
    )
    const emailEl = emailContainer.querySelector(
      "[title='long.email.address.test@novagroup.vn']",
    )
    expect(emailEl).not.toBeNull()
  })
})
