import { describe, expect, it } from "vitest"
import { buildRoleOrgChart, ROLE_CODES } from "@/components/Users/roleOrgChart"
import type {
  ProjectSummary,
  RoleResponse,
  UserTreeNodeResponse,
} from "@/types"

let nextUserId = 1

const makeUser = (
  overrides: Partial<UserTreeNodeResponse> = {},
): UserTreeNodeResponse => ({
  id: nextUserId++,
  fullName: `User ${nextUserId}`,
  phone: null,
  email: null,
  status: "ACTIVE",
  perNumber: null,
  novatorStatus: null,
  departmentCode: null,
  divisionCode: null,
  managerPerNumber: null,
  createdAt: "2026-01-01T00:00:00Z",
  roleId: undefined,
  projects: [],
  children: [],
  ...overrides,
})

const makeProjectRole = (
  roleId: number,
  overrides: Partial<ProjectSummary> = {},
): ProjectSummary => ({
  roleId,
  roleName: "Role Test",
  projectRole: "VIEWER",
  ...overrides,
})

const ROLES_FIXTURE: RoleResponse[] = Object.values(ROLE_CODES).map(
  (code, index) => ({
    id: index + 1,
    code,
    shortCode: null,
    name: code,
    level: 1,
    parentRoleId: null,
    departmentId: null,
    description: null,
    createdAt: "2026-01-01T00:00:00Z",
  }),
)

const roleId = (code: string) => ROLES_FIXTURE.find((r) => r.code === code)!.id

describe("buildRoleOrgChart", () => {
  it("builds a vacancy node at every level when no user holds the role", () => {
    const { configs, xAlignPairs } = buildRoleOrgChart([], ROLES_FIXTURE)

    expect(configs).toHaveLength(9)

    const gdNode = configs.find((c) => c.parentId === null)
    expect(gdNode?.data.isVacancy).toBe(true)
    expect(gdNode?.data.managerName).toBe("Chưa có nhân sự")

    const tpNode = configs.find((c) => c.parentId === gdNode?.id)
    expect(tpNode?.data.isVacancy).toBe(true)

    const deptManagers = configs.filter(
      (c) => c.parentId === tpNode?.id && c.data.type === "manager",
    )
    expect(deptManagers).toHaveLength(3)
    for (const manager of deptManagers) {
      expect(manager.data.isVacancy).toBe(true)
    }

    const specialistGroup = configs.find((c) =>
      c.id.startsWith("role-group-specialists-"),
    )
    expect(specialistGroup?.data.sections).toHaveLength(6)
    for (const section of specialistGroup?.data.sections ?? []) {
      expect(section.users).toEqual([
        { fullName: "Chưa có nhân sự", isVacancy: true },
      ])
    }

    expect(xAlignPairs).toHaveLength(4)
  })

  it("creates one manager node per user holding the same role (fan-out)", () => {
    const tp1 = makeUser({ roleId: roleId(ROLE_CODES.TRUONG_PHONG) })
    const tp2 = makeUser({ roleId: roleId(ROLE_CODES.TRUONG_PHONG) })

    const { configs } = buildRoleOrgChart([tp1, tp2], ROLES_FIXTURE)

    const tpNodes = configs.filter(
      (c) =>
        c.data.type === "manager" && c.data.title.startsWith("Trưởng phòng"),
    )
    expect(tpNodes).toHaveLength(2)
    expect(new Set(tpNodes.map((n) => n.id)).size).toBe(2)
    expect(tpNodes.every((n) => n.data.isVacancy === false)).toBe(true)

    for (const tpNode of tpNodes) {
      const deptManagers = configs.filter(
        (c) => c.parentId === tpNode.id && c.data.type === "manager",
      )
      expect(deptManagers).toHaveLength(3)
    }
  })

  it("matches users via project-scoped roleId for kiêm nhiệm assignments", () => {
    const otherRoleId = roleId(ROLE_CODES.THU_KY)
    const supervisorRoleId = roleId(ROLE_CODES.GS_QLXD)

    const supervisor = makeUser({
      roleId: otherRoleId,
      projects: [makeProjectRole(supervisorRoleId)],
    })

    const { configs } = buildRoleOrgChart([supervisor], ROLES_FIXTURE)

    const qlxdGroup = configs.find((c) => c.id.startsWith("role-group-qlxd-"))
    expect(qlxdGroup?.data.sections?.[0].users).toEqual([
      { id: supervisor.id, fullName: supervisor.fullName, isVacancy: false },
    ])
  })

  it("scopes department-branch candidates to the manager's own subtree", () => {
    const outsideSupervisor = makeUser({ roleId: roleId(ROLE_CODES.GS_QLXD) })
    const insideSupervisor = makeUser({ roleId: roleId(ROLE_CODES.GS_QLXD) })
    const tp = makeUser({
      roleId: roleId(ROLE_CODES.TRUONG_PHONG),
      children: [insideSupervisor],
    })

    const { configs } = buildRoleOrgChart(
      [tp, outsideSupervisor, insideSupervisor],
      ROLES_FIXTURE,
    )

    const qlxdGroup = configs.find((c) => c.id.startsWith("role-group-qlxd-"))
    expect(qlxdGroup?.data.sections?.[0].users).toEqual([
      {
        id: insideSupervisor.id,
        fullName: insideSupervisor.fullName,
        isVacancy: false,
      },
    ])
  })

  it("does not duplicate a manager node across sibling Trưởng phòng that have no QLTT reports of their own", () => {
    const ngoc = makeUser({ roleId: roleId(ROLE_CODES.TBP_QLXD) })
    const dau = makeUser({
      roleId: roleId(ROLE_CODES.TRUONG_PHONG),
      children: [ngoc],
    })
    const tinh = makeUser({ roleId: roleId(ROLE_CODES.TRUONG_PHONG) })
    const khai = makeUser({ roleId: roleId(ROLE_CODES.TRUONG_PHONG) })

    const { configs } = buildRoleOrgChart(
      [dau, tinh, khai, ngoc],
      ROLES_FIXTURE,
    )

    const ngocManagerNodes = configs.filter(
      (c) => c.data.type === "manager" && c.data.managerName === ngoc.fullName,
    )
    expect(ngocManagerNodes).toHaveLength(1)

    const dauTpNode = configs.find(
      (c) => c.data.type === "manager" && c.data.managerName === dau.fullName,
    )
    expect(ngocManagerNodes[0].parentId).toBe(dauTpNode?.id)
  })

  it("finds supervisors reporting directly to the Trưởng phòng even when not nested under the Trưởng bộ phận", () => {
    const supervisor = makeUser({ roleId: roleId(ROLE_CODES.GS_QLXD) })
    const tbp = makeUser({ roleId: roleId(ROLE_CODES.TBP_QLXD) })
    const tp = makeUser({
      roleId: roleId(ROLE_CODES.TRUONG_PHONG),
      children: [tbp, supervisor],
    })

    const { configs } = buildRoleOrgChart([tp, tbp, supervisor], ROLES_FIXTURE)

    const qlxdGroup = configs.find((c) => c.id.startsWith("role-group-qlxd-"))
    expect(qlxdGroup?.data.sections?.[0].users).toEqual([
      { id: supervisor.id, fullName: supervisor.fullName, isVacancy: false },
    ])
  })

  it("does not include locked users when filtered before chart building", () => {
    const lockedUser = makeUser({
      status: "LOCKED",
      roleId: roleId(ROLE_CODES.TRUONG_PHONG),
      fullName: "Locked TP",
    })
    const activeUser = makeUser({
      status: "ACTIVE",
      roleId: roleId(ROLE_CODES.GD_PGD),
      fullName: "Active GD",
    })

    const filteredUsers = [activeUser, lockedUser].filter(
      (u) => u.status !== "LOCKED",
    )
    const { configs } = buildRoleOrgChart(filteredUsers, ROLES_FIXTURE)

    const tpNode = configs.find(
      (c) =>
        c.data.type === "manager" && c.data.title.startsWith("Trưởng phòng"),
    )
    expect(tpNode?.data.isVacancy).toBe(true)
    expect(tpNode?.data.managerName).toBe("Chưa có nhân sự")
  })
})
