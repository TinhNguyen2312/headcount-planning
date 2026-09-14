import type { Edge } from "@xyflow/react"
import dagre from "dagre"
import type {
  ProjectResponse,
  RoleResponse,
  UserTreeNodeResponse,
} from "@/types"
import type { RoleGroupFlowNodeType } from "./RoleGroupFlowNode"
import type {
  RoleGroupNodeData,
  RoleGroupUserItem,
  RoleSectionGroup,
} from "./RoleGroupNode"

export const ROLE_CODES = {
  GD_PGD: "20047380",
  TRUONG_PHONG: "20047381",
  TBP_QLXD: "20047382",
  TBP_QLCD: "20047383",
  TBP_HTKT: "20047384",
  GS_QLXD: "20047385",
  GS_QLCD: "20047386",
  GS_HTKT: "20047387",
  KTS: "20047388",
  CLTD: "20047389",
  TRAC_DAC: "20047390",
  ATLD: "20047391",
  CAY_XANH: "20047392",
  THU_KY: "20047393",
} as const

const VACANCY_LABEL = "Chưa có nhân sự"
export const ROLE_GROUP_CARD_WIDTH = 260
const MANAGER_CARD_HEIGHT = 95

export type RoleCodeKey = keyof typeof ROLE_CODES

export const identifyRoleKey = (role?: {
  code?: string | null
  name?: string | null
  shortCode?: string | null
}): RoleCodeKey | null => {
  if (!role) return null

  const code = role.code?.trim()
  if (code) {
    for (const [key, val] of Object.entries(ROLE_CODES)) {
      if (val === code) return key as RoleCodeKey
    }
  }

  const name = (role.name || "").toLowerCase()
  const shortCode = (role.shortCode || "").toLowerCase()

  if (
    name.includes("gđ/pgđ") ||
    name.includes("gd/pgd") ||
    name.includes("giám đốc phòng")
  ) {
    return "GD_PGD"
  }
  if (name.includes("trưởng phòng")) {
    return "TRUONG_PHONG"
  }
  if (
    name.includes("trưởng bộ phận") &&
    (name.includes("cơ điện") || name.includes("qlcd"))
  ) {
    return "TBP_QLCD"
  }
  if (
    name.includes("trưởng bộ phận") &&
    (name.includes("hạ tầng") || name.includes("htkt"))
  ) {
    return "TBP_HTKT"
  }
  if (
    name.includes("trưởng bộ phận") &&
    (name.includes("xây dựng") || name.includes("qlxd"))
  ) {
    return "TBP_QLXD"
  }
  if (
    name.includes("giám sát") &&
    (name.includes("cơ điện") || name.includes("qlcd"))
  ) {
    return "GS_QLCD"
  }
  if (
    name.includes("giám sát") &&
    (name.includes("hạ tầng") || name.includes("htkt"))
  ) {
    return "GS_HTKT"
  }
  if (
    name.includes("giám sát") &&
    (name.includes("xây dựng") || name.includes("qlxd"))
  ) {
    return "GS_QLXD"
  }
  if (
    name.includes("kiến trúc sư") ||
    shortCode === "kts" ||
    shortCode === "kts_ct"
  ) {
    return "KTS"
  }
  if (name.includes("chất lượng") || shortCode === "cltd") {
    return "CLTD"
  }
  if (name.includes("trắc đạc")) {
    return "TRAC_DAC"
  }
  if (
    name.includes("an toàn lao động") ||
    shortCode === "atlđ" ||
    shortCode === "atld"
  ) {
    return "ATLD"
  }
  if (name.includes("cây xanh")) {
    return "CAY_XANH"
  }
  if (name.includes("thư ký")) {
    return "THU_KY"
  }

  return null
}

const DEPARTMENT_BRANCHES = [
  {
    key: "qlxd",
    managerKey: "TBP_QLXD" as RoleCodeKey,
    managerCode: ROLE_CODES.TBP_QLXD,
    managerTitle: "Trưởng bộ phận Quản lý Xây dựng",
    groupTitle: "Giám sát Xây dựng",
    supervisorKey: "GS_QLXD" as RoleCodeKey,
    supervisorCode: ROLE_CODES.GS_QLXD,
    supervisorTitle: "Kỹ sư cao cấp Giám sát Xây dựng",
  },
  {
    key: "qlcd",
    managerKey: "TBP_QLCD" as RoleCodeKey,
    managerCode: ROLE_CODES.TBP_QLCD,
    managerTitle: "Trưởng bộ phận Quản lý Cơ điện",
    groupTitle: "Giám sát Cơ điện",
    supervisorKey: "GS_QLCD" as RoleCodeKey,
    supervisorCode: ROLE_CODES.GS_QLCD,
    supervisorTitle: "Kỹ sư cao cấp Giám sát Cơ điện",
  },
  {
    key: "htkt",
    managerKey: "TBP_HTKT" as RoleCodeKey,
    managerCode: ROLE_CODES.TBP_HTKT,
    managerTitle: "Trưởng bộ phận Quản lý Hạ tầng kỹ thuật",
    groupTitle: "Giám sát Hạ tầng kỹ thuật",
    supervisorKey: "GS_HTKT" as RoleCodeKey,
    supervisorCode: ROLE_CODES.GS_HTKT,
    supervisorTitle: "Kỹ sư cao cấp Giám sát Hạ tầng kỹ thuật",
  },
] as const

const SPECIALIST_ROLES = [
  {
    key: "CLTD" as RoleCodeKey,
    code: ROLE_CODES.CLTD,
    title: "Kỹ sư cao cấp Kiểm soát Chất lượng và tiến độ",
  },
  {
    key: "KTS" as RoleCodeKey,
    code: ROLE_CODES.KTS,
    title: "Kiến trúc sư cao cấp Công trường",
  },
  {
    key: "ATLD" as RoleCodeKey,
    code: ROLE_CODES.ATLD,
    title: "Kỹ sư cao cấp Kiểm soát An toàn lao động",
  },
  {
    key: "CAY_XANH" as RoleCodeKey,
    code: ROLE_CODES.CAY_XANH,
    title: "Kỹ sư cao cấp kiểm soát cây xanh",
  },
  {
    key: "TRAC_DAC" as RoleCodeKey,
    code: ROLE_CODES.TRAC_DAC,
    title: "Kỹ sư cao cấp Kiểm soát Trắc đạc",
  },
  {
    key: "THU_KY" as RoleCodeKey,
    code: ROLE_CODES.THU_KY,
    title: "Thư ký Công trường",
  },
] as const

export interface RoleOrgNodeConfig {
  id: string
  parentId: string | null
  width: number
  height: number
  data: RoleGroupNodeData
}

export interface ProjectUserGroup {
  projectId: number
  projectName: string
  users: UserTreeNodeResponse[]
}

export const collectAllUsers = (
  nodes: UserTreeNodeResponse[],
): UserTreeNodeResponse[] => {
  const list: UserTreeNodeResponse[] = []
  const visited = new Set<number>()

  const visit = (node: UserTreeNodeResponse) => {
    if (!visited.has(node.id)) {
      visited.add(node.id)
      list.push(node)
    }
    for (const child of node.children || []) {
      visit(child)
    }
  }

  for (const node of nodes) {
    visit(node)
  }
  return list
}

export const groupUsersByProject = (
  allUsers: UserTreeNodeResponse[],
  projects?: ProjectResponse[],
  selectedProjectId?: number,
): ProjectUserGroup[] => {
  if (selectedProjectId) {
    const proj = projects?.find((p) => p.id === selectedProjectId)
    const projName = proj?.name || `Dự án #${selectedProjectId}`
    return [
      {
        projectId: selectedProjectId,
        projectName: projName,
        users: allUsers,
      },
    ]
  }

  const validProjectIds = new Set<number>()
  const projectNameMap = new Map<number, string>()
  if (projects && projects.length > 0) {
    for (const p of projects) {
      validProjectIds.add(p.id)
      projectNameMap.set(p.id, p.name)
    }
  }

  const projectMap = new Map<
    number,
    { projectName: string; users: Set<UserTreeNodeResponse> }
  >()

  for (const user of allUsers) {
    if (user.projects && user.projects.length > 0) {
      for (const p of user.projects) {
        if (p.status && p.status !== "ACTIVE") continue
        const pId = p.projectId ?? p.id
        if (pId == null) continue
        if (validProjectIds.size > 0 && !validProjectIds.has(pId)) continue

        if (!projectMap.has(pId)) {
          const fallbackName = p.projectName || p.name || `Dự án #${pId}`
          const name = projectNameMap.get(pId) || fallbackName
          projectMap.set(pId, {
            projectName: name,
            users: new Set(),
          })
        }
        projectMap.get(pId)!.users.add(user)
      }
    }
  }

  if (projectMap.size === 0) {
    return [
      {
        projectId: 0,
        projectName: "Dự án chung",
        users: allUsers,
      },
    ]
  }

  return Array.from(projectMap.entries())
    .map(([projectId, info]) => ({
      projectId,
      projectName: info.projectName,
      users: Array.from(info.users),
    }))
    .filter((g) => g.users.length > 0)
}

const getSubordinatesOfManager = (
  manager: UserTreeNodeResponse,
): UserTreeNodeResponse[] => {
  if (!manager.children || manager.children.length === 0) return []
  return collectAllUsers(manager.children)
}

const getRoleIdByCode = (
  roles: RoleResponse[],
  code: string,
): number | undefined => {
  const role = roles.find((r) => r.code === code)
  if (role) return role.id
  for (const [key, val] of Object.entries(ROLE_CODES)) {
    if (val === code) {
      const matched = roles.find((r) => identifyRoleKey(r) === key)
      if (matched) return matched.id
    }
  }
  return undefined
}

export const checkUserMatchesRoleKey = (
  user: UserTreeNodeResponse,
  targetKey: RoleCodeKey,
  roles: RoleResponse[],
  projectId?: number,
): boolean => {
  if (user.roleId) {
    const role = roles.find((r) => r.id === user.roleId)
    if (role && identifyRoleKey(role) === targetKey) return true
  }
  if (user.roleName && identifyRoleKey({ name: user.roleName }) === targetKey) {
    return true
  }

  if (user.projects && user.projects.length > 0) {
    for (const p of user.projects) {
      if (p.status && p.status !== "ACTIVE") continue
      const pId = p.projectId ?? p.id
      if (projectId && pId !== projectId) continue

      if (p.roleId) {
        const role = roles.find((r) => r.id === p.roleId)
        if (role && identifyRoleKey(role) === targetKey) return true
      }
      if (p.roleName && identifyRoleKey({ name: p.roleName }) === targetKey) {
        return true
      }
    }
  }

  return false
}

const filterUsersByRoleCode = (
  scopeUsers: UserTreeNodeResponse[],
  roles: RoleResponse[],
  roleCode: string,
  projectId?: number,
): UserTreeNodeResponse[] => {
  const roleId = getRoleIdByCode(roles, roleCode)
  if (roleId !== undefined) {
    return scopeUsers.filter((u) => {
      if (u.roleId === roleId) return true
      return (
        u.projects?.some((p) => {
          const pId = p.projectId ?? p.id
          return p.roleId === roleId && (!projectId || pId === projectId)
        }) ?? false
      )
    })
  }
  const key = identifyRoleKey({ code: roleCode, name: roleCode })
  if (key) {
    return filterUsersByRoleKey(scopeUsers, roles, key, projectId)
  }
  return []
}

const filterUsersByRoleKey = (
  scopeUsers: UserTreeNodeResponse[],
  roles: RoleResponse[],
  targetKey: RoleCodeKey,
  projectId?: number,
): UserTreeNodeResponse[] => {
  return scopeUsers.filter((u) =>
    checkUserMatchesRoleKey(u, targetKey, roles, projectId),
  )
}

const formatToUserItems = (
  users: UserTreeNodeResponse[],
): RoleGroupUserItem[] => {
  if (users.length === 0) {
    return [{ fullName: VACANCY_LABEL, isVacancy: true }]
  }
  return users.map((u) => {
    const isMultiProject = (u.projects?.length ?? 0) > 1
    return {
      id: u.id,
      fullName: u.fullName,
      note: isMultiProject ? "(Kiêm nhiệm)" : undefined,
      isVacancy: false,
    }
  })
}

const calculateManagerHeight = (count: number): number => {
  if (count <= 1) return MANAGER_CARD_HEIGHT
  return 60 + count * 22
}

const calculateGroupHeight = (sections: RoleSectionGroup[]): number => {
  const PADDING = 28
  const TITLE_HEIGHT = 18
  const ROW_HEIGHT = 15
  const GAP = 14

  return (
    PADDING +
    sections.reduce((total, section, idx) => {
      const rows = Math.max(section.users.length, 1)
      const separator = idx > 0 ? GAP : 0
      return total + separator + TITLE_HEIGHT + rows * ROW_HEIGHT
    }, 0)
  )
}

function appendBranchesForManager(
  prefix: string,
  parentManagerNodeId: string,
  managerScopeUsers: UserTreeNodeResponse[],
  roles: RoleResponse[],
  configs: RoleOrgNodeConfig[],
  projectId?: number,
) {
  for (const branch of DEPARTMENT_BRANCHES) {
    const branchManagers = filterUsersByRoleKey(
      managerScopeUsers,
      roles,
      branch.managerKey,
      projectId,
    )
    const branchManagerNodeId = `${prefix}role-${branch.key}-mgr-${parentManagerNodeId}`

    configs.push({
      id: branchManagerNodeId,
      parentId: parentManagerNodeId,
      width: ROLE_GROUP_CARD_WIDTH,
      height: calculateManagerHeight(branchManagers.length),
      data: {
        type: "manager",
        title: branch.managerTitle,
        managerUsers:
          branchManagers.length > 0
            ? branchManagers.map((u) => ({ id: u.id, fullName: u.fullName }))
            : undefined,
        managerName:
          branchManagers.length === 1 ? branchManagers[0].fullName : undefined,
        isVacancy: branchManagers.length === 0,
      },
    })

    const supervisors = filterUsersByRoleKey(
      managerScopeUsers,
      roles,
      branch.supervisorKey,
      projectId,
    )
    const supervisorSections: RoleSectionGroup[] = [
      {
        roleId: getRoleIdByCode(roles, branch.supervisorCode) ?? -1,
        roleName: branch.supervisorTitle,
        users: formatToUserItems(supervisors),
      },
    ]

    configs.push({
      id: `${prefix}role-group-${branch.key}-${parentManagerNodeId}`,
      parentId: branchManagerNodeId,
      width: ROLE_GROUP_CARD_WIDTH,
      height: calculateGroupHeight(supervisorSections),
      data: {
        type: "group",
        title: branch.groupTitle,
        sections: supervisorSections,
      },
    })
  }

  const specialistSections: RoleSectionGroup[] = SPECIALIST_ROLES.map(
    (role) => ({
      roleId: getRoleIdByCode(roles, role.code) ?? -1,
      roleName: role.title,
      users: formatToUserItems(
        filterUsersByRoleKey(managerScopeUsers, roles, role.key, projectId),
      ),
    }),
  )

  configs.push({
    id: `${prefix}role-group-specialists-${parentManagerNodeId}`,
    parentId: parentManagerNodeId,
    width: ROLE_GROUP_CARD_WIDTH,
    height: calculateGroupHeight(specialistSections),
    data: {
      type: "group",
      title: "Chuyên trách Trực thuộc Phòng",
      sections: specialistSections,
    },
  })
}

export function buildRoleOrgChart(
  users: UserTreeNodeResponse[],
  roles: RoleResponse[],
) {
  const configs = buildProjectRoleOrgChart(
    { projectId: 0, projectName: "Dự án chung", users },
    roles,
  )
  const xAlignPairs: Array<[string, string]> = []
  const gdNode = configs.find((c) => c.parentId === null)
  const tpNodes = configs.filter(
    (c) => c.data.type === "manager" && c.data.title.startsWith("Trưởng phòng"),
  )
  if (gdNode && tpNodes[0]) {
    xAlignPairs.push([gdNode.id, tpNodes[0].id])
  }
  if (tpNodes[0]) {
    const branchMgrs = configs.filter(
      (c) => c.parentId === tpNodes[0].id && c.data.type === "manager",
    )
    for (const b of branchMgrs) {
      xAlignPairs.push([tpNodes[0].id, b.id])
    }
  }
  return { configs, xAlignPairs }
}

export function buildProjectRoleOrgChart(
  projectGroup: ProjectUserGroup,
  roles: RoleResponse[],
): RoleOrgNodeConfig[] {
  const configs: RoleOrgNodeConfig[] = []
  const { projectId, projectName, users } = projectGroup
  const prefix = projectId > 0 ? `p${projectId}-` : ""

  const gdUsers = filterUsersByRoleCode(
    users,
    roles,
    ROLE_CODES.GD_PGD,
    projectId,
  )
  const gdNodeId = `${prefix}role-gd-root`

  configs.push({
    id: gdNodeId,
    parentId: null,
    width: ROLE_GROUP_CARD_WIDTH,
    height: calculateManagerHeight(gdUsers.length),
    data: {
      type: "manager",
      title: "GĐ/PGĐ Phòng Quản lý Xây dựng, An toàn và Môi trường",
      departmentName: projectName,
      managerUsers:
        gdUsers.length > 0
          ? gdUsers.map((u) => ({ id: u.id, fullName: u.fullName }))
          : undefined,
      managerName:
        gdUsers.length === 1
          ? gdUsers[0].fullName
          : gdUsers.length === 0
            ? VACANCY_LABEL
            : undefined,
      isVacancy: gdUsers.length === 0,
    },
  })

  const tpUsers = filterUsersByRoleCode(
    users,
    roles,
    ROLE_CODES.TRUONG_PHONG,
    projectId,
  )

  if (tpUsers.length === 0) {
    const vacantTpNodeId = `${prefix}role-tp-vacant`
    configs.push({
      id: vacantTpNodeId,
      parentId: gdNodeId,
      width: ROLE_GROUP_CARD_WIDTH,
      height: MANAGER_CARD_HEIGHT,
      data: {
        type: "manager",
        title: "Trưởng phòng Quản lý Xây dựng, An toàn và Môi trường",
        departmentName: projectName,
        managerName: VACANCY_LABEL,
        isVacancy: true,
      },
    })

    appendBranchesForManager(
      prefix,
      vacantTpNodeId,
      users,
      roles,
      configs,
      projectId,
    )
  } else {
    const hasAnyTpSubordinates = tpUsers.some(
      (u) => getSubordinatesOfManager(u).length > 0,
    )

    for (const tp of tpUsers) {
      const tpNodeId = `${prefix}role-tp-${tp.id}`

      configs.push({
        id: tpNodeId,
        parentId: gdNodeId,
        width: ROLE_GROUP_CARD_WIDTH,
        height: MANAGER_CARD_HEIGHT,
        data: {
          type: "manager",
          title: "Trưởng phòng Quản lý Xây dựng, An toàn và Môi trường",
          departmentName: projectName,
          managerName: tp.fullName,
          isVacancy: false,
        },
      })

      const tpSubordinates = getSubordinatesOfManager(tp)
      const managerScope =
        tpSubordinates.length > 0
          ? tpSubordinates
          : hasAnyTpSubordinates
            ? []
            : tpUsers.length === 1
              ? users
              : []

      appendBranchesForManager(
        prefix,
        tpNodeId,
        managerScope,
        roles,
        configs,
        projectId,
      )
    }
  }

  return configs
}

export const buildRoleFlowElements = (
  activeTree: UserTreeNodeResponse[],
  roles: RoleResponse[],
  projects?: ProjectResponse[],
  selectedProjectId?: number,
) => {
  if (!activeTree || activeTree.length === 0 || !roles || roles.length === 0) {
    return { nodes: [] as RoleGroupFlowNodeType[], edges: [] as Edge[] }
  }

  const allUsers = collectAllUsers(activeTree)
  const projectGroups = groupUsersByProject(
    allUsers,
    projects,
    selectedProjectId,
  )

  const allNodes: RoleGroupFlowNodeType[] = []
  const allEdges: Edge[] = []

  let currentXOffset = 0

  for (const projectGroup of projectGroups) {
    const configs = buildProjectRoleOrgChart(projectGroup, roles)

    const graph = new dagre.graphlib.Graph()
    graph.setDefaultEdgeLabel(() => ({}))
    graph.setGraph({
      rankdir: "TB",
      nodesep: 32,
      ranksep: 72,
    })

    for (const c of configs) {
      graph.setNode(c.id, { width: c.width, height: c.height })
    }
    for (const c of configs) {
      if (c.parentId) {
        graph.setEdge(c.parentId, c.id)
      }
    }

    dagre.layout(graph)

    const parentMap = new Map<string, string | null>()
    for (const c of configs) {
      parentMap.set(c.id, c.parentId)
    }

    const depthMap = new Map<string, number>()
    const getDepth = (id: string): number => {
      if (depthMap.has(id)) return depthMap.get(id)!
      const pId = parentMap.get(id)
      if (!pId) {
        depthMap.set(id, 0)
        return 0
      }
      const d = getDepth(pId) + 1
      depthMap.set(id, d)
      return d
    }

    for (const c of configs) {
      getDepth(c.id)
    }

    const maxDepth = Math.max(0, ...Array.from(depthMap.values()))
    const RANK_GAP = 72
    const tierTopY = new Map<number, number>()
    let currentTierY = 0
    const gdHeight =
      configs.find((c) => c.parentId === null)?.height ?? MANAGER_CARD_HEIGHT

    for (let d = 0; d <= maxDepth; d++) {
      tierTopY.set(d, currentTierY)
      const rowHeight = d === 0 ? gdHeight : MANAGER_CARD_HEIGHT
      currentTierY += rowHeight + RANK_GAP
    }

    let minX = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const c of configs) {
      const node = graph.node(c.id)
      minX = Math.min(minX, node.x - c.width / 2)
      maxX = Math.max(maxX, node.x + c.width / 2)
      const d = depthMap.get(c.id) ?? 0
      const nodeTopY = tierTopY.get(d) ?? 0
      maxY = Math.max(maxY, nodeTopY + c.height)
    }

    const treeWidth = maxX - minX
    const treeHeight = maxY

    const FRAME_PADDING_X = 40
    const FRAME_PADDING_Y = 40
    const frameX = currentXOffset - FRAME_PADDING_X
    const frameY = -FRAME_PADDING_Y
    const frameWidth = treeWidth + 2 * FRAME_PADDING_X
    const frameHeight = treeHeight + 2 * FRAME_PADDING_Y

    allNodes.push({
      id: `${projectGroup.projectId > 0 ? `p${projectGroup.projectId}-` : ""}frame`,
      type: "projectGroupNode",
      position: { x: frameX, y: frameY },
      data: {
        projectName: projectGroup.projectName,
        userCount: projectGroup.users.length,
        width: frameWidth,
        height: frameHeight,
      },
      className: "nodrag nopan",
      draggable: false,
      selectable: false,
      style: { pointerEvents: "none" as const, zIndex: -1 },
    } as unknown as RoleGroupFlowNodeType)

    for (const c of configs) {
      const node = graph.node(c.id)
      const posX = currentXOffset + (node.x - c.width / 2 - minX)
      const d = depthMap.get(c.id) ?? 0
      const posY = tierTopY.get(d) ?? 0

      allNodes.push({
        id: c.id,
        type: "roleGroupNode",
        position: { x: posX, y: posY },
        data: {
          ...c.data,
          isHighlighted: false,
        },
        className: "nodrag nopan",
        draggable: false,
        selectable: false,
        style: { pointerEvents: "all" as const },
      })
    }

    for (const c of configs) {
      if (c.parentId) {
        allEdges.push({
          id: `${c.parentId}-${c.id}`,
          source: c.parentId,
          target: c.id,
          type: "step",
          style: { stroke: "var(--muted-foreground)", strokeWidth: 2 },
        })
      }
    }

    currentXOffset += treeWidth + 2 * FRAME_PADDING_X + 64
  }

  return { nodes: allNodes, edges: allEdges }
}
