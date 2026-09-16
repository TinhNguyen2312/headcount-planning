import type { Edge, Node } from "@xyflow/react"
import dagre from "dagre"
import type {
  ProjectResponse,
  RoleTreeNodeResponse,
  UserTreeNodeResponse,
} from "@/types"
import type { DepartmentGroupInfo } from "@/components/Role/roleTreeLayout"
import {
  calculateUserRoleNodeHeight,
  USER_ROLE_CARD_WIDTH,
  type AssignedUserItem,
} from "./RoleGroupNode"

export interface FlatRoleUserEntry {
  id: string
  role: RoleTreeNodeResponse
  parentId: string | null
  assignedUsers: AssignedUserItem[]
  width: number
  height: number
}

export const flattenVisibleRoleTree = (
  roots: RoleTreeNodeResponse[],
  collapsedIds: Set<number>,
  userMapByRoleId: Map<number, AssignedUserItem[]>,
): FlatRoleUserEntry[] => {
  const entries: FlatRoleUserEntry[] = []

  const visit = (role: RoleTreeNodeResponse, parentId: string | null) => {
    const id = String(role.id)
    const assignedUsers = userMapByRoleId.get(role.id) || []
    const width = USER_ROLE_CARD_WIDTH
    const height = calculateUserRoleNodeHeight(assignedUsers.length)

    entries.push({
      id,
      role,
      parentId,
      assignedUsers,
      width,
      height,
    })

    if (!collapsedIds.has(role.id)) {
      for (const child of role.children || []) {
        visit(child, id)
      }
    }
  }

  for (const root of roots) {
    visit(root, null)
  }

  return entries
}

export const mapUsersToRoles = (
  users: UserTreeNodeResponse[],
  selectedProjectId?: number,
): Map<number, AssignedUserItem[]> => {
  const roleUserMap = new Map<number, AssignedUserItem[]>()
  const visited = new Set<string>()

  const collect = (node: UserTreeNodeResponse) => {
    const allProjects = node.projects || []
    const isMultiProject = allProjects.length > 1

    if (selectedProjectId) {
      for (const p of allProjects) {
        if (p.status && p.status !== "ACTIVE") continue
        const pId = p.projectId ?? p.id
        if (pId === selectedProjectId && p.roleId) {
          const key = `${p.roleId}-${node.id}`
          if (!visited.has(key)) {
            visited.add(key)
            if (!roleUserMap.has(p.roleId)) roleUserMap.set(p.roleId, [])
            roleUserMap.get(p.roleId)!.push({
              id: node.id,
              fullName: node.fullName,
              email: node.email,
              phone: node.phone,
              status: node.status,
              isMultiProject,
            })
          }
        }
      }

      if (node.roleId) {
        const hasMatchingProject = allProjects.some(
          (p) => (p.projectId ?? p.id) === selectedProjectId,
        )
        if (hasMatchingProject || allProjects.length === 0) {
          const key = `${node.roleId}-${node.id}`
          if (!visited.has(key)) {
            visited.add(key)
            if (!roleUserMap.has(node.roleId)) roleUserMap.set(node.roleId, [])
            roleUserMap.get(node.roleId)!.push({
              id: node.id,
              fullName: node.fullName,
              email: node.email,
              phone: node.phone,
              status: node.status,
              isMultiProject,
            })
          }
        }
      }
    } else {
      if (node.roleId) {
        const key = `${node.roleId}-${node.id}`
        if (!visited.has(key)) {
          visited.add(key)
          if (!roleUserMap.has(node.roleId)) roleUserMap.set(node.roleId, [])
          roleUserMap.get(node.roleId)!.push({
            id: node.id,
            fullName: node.fullName,
            email: node.email,
            phone: node.phone,
            status: node.status,
            isMultiProject,
          })
        }
      }

      for (const p of allProjects) {
        if (p.status && p.status !== "ACTIVE") continue
        if (p.roleId) {
          const key = `${p.roleId}-${node.id}`
          if (!visited.has(key)) {
            visited.add(key)
            if (!roleUserMap.has(p.roleId)) roleUserMap.set(p.roleId, [])
            roleUserMap.get(p.roleId)!.push({
              id: node.id,
              fullName: node.fullName,
              email: node.email,
              phone: node.phone,
              status: node.status,
              isMultiProject,
            })
          }
        }
      }
    }

    for (const child of node.children || []) {
      collect(child)
    }
  }

  for (const u of users) {
    collect(u)
  }

  return roleUserMap
}

const PAD_LEFT = 16
const PAD_RIGHT = 16
const PAD_TOP = 16
const PAD_BOTTOM = 20
const HEADER_H = 36

export const buildRoleFlowElements = (
  users: UserTreeNodeResponse[],
  roles: RoleTreeNodeResponse[],
  projects?: ProjectResponse[],
  selectedProjectId?: number,
  collapsedIds: Set<number> = new Set(),
  toggleCollapsed?: (id: number) => void,
) => {
  if (!roles || roles.length === 0) {
    return { nodes: [] as Node[], edges: [] as Edge[] }
  }

  const roleUserMap = mapUsersToRoles(users, selectedProjectId)
  const entries = flattenVisibleRoleTree(roles, collapsedIds, roleUserMap)

  if (entries.length === 0) {
    return { nodes: [] as Node[], edges: [] as Edge[] }
  }

  const sortedEntries = [...entries].sort((a, b) => {
    const la = a.role.level ?? 99
    const lb = b.role.level ?? 99
    if (la !== lb) return la - lb
    const da = a.role.departmentId ?? 0
    const db = b.role.departmentId ?? 0
    if (da !== db) return da - db
    return Number(a.id) - Number(b.id)
  })

  const deptMap = new Map<
    number,
    {
      deptId: number
      name: string
      code?: string | null
      type?: string | null
      level?: number | null
      parentId?: number | null
      metadata?: unknown
      entries: FlatRoleUserEntry[]
    }
  >()

  for (const entry of sortedEntries) {
    const deptId = entry.role.departmentId
    if (deptId) {
      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, {
          deptId,
          name: entry.role.departmentName || `Phòng ban #${deptId}`,
          code: entry.role.departmentCode,
          type: entry.role.departmentType,
          level: entry.role.departmentLevel,
          parentId: entry.role.departmentParentId,
          metadata: entry.role.departmentMetadata,
          entries: [],
        })
      }
      deptMap.get(deptId)!.entries.push(entry)
    }
  }

  const g = new dagre.graphlib.Graph({ compound: true })
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: "TB",
    nodesep: 80,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  })

  for (const [deptId, dept] of deptMap.entries()) {
    g.setNode(`dept_${deptId}`, { label: dept.name })
  }

  for (const entry of sortedEntries) {
    g.setNode(entry.id, { width: entry.width, height: entry.height })
    if (entry.role.departmentId && deptMap.has(entry.role.departmentId)) {
      g.setParent(entry.id, `dept_${entry.role.departmentId}`)
    }
  }

  const visibleIds = new Set(sortedEntries.map((e) => e.id))
  const siblingGroups = new Map<string, FlatRoleUserEntry[]>()

  for (const entry of sortedEntries) {
    if (entry.parentId && entry.role.departmentId) {
      const key = `${entry.parentId}_dept_${entry.role.departmentId}`
      if (!siblingGroups.has(key)) siblingGroups.set(key, [])
      siblingGroups.get(key)!.push(entry)
    }
  }

  const verticalChainedIds = new Set<string>()
  const effectiveEdges: {
    source: string
    target: string
    targetHandle?: "top" | "left"
  }[] = []

  for (const siblings of siblingGroups.values()) {
    const isExecutiveGroup = siblings.some(
      (s) =>
        (s.role.level != null && s.role.level <= 2) ||
        s.role.departmentCode === "BTGD" ||
        s.role.departmentCode === "HDQT" ||
        s.role.departmentType === "Ban",
    )

    if (!isExecutiveGroup && siblings.length > 5) {
      const sorted = [...siblings].sort((a, b) => {
        const la = a.role.level ?? 99
        const lb = b.role.level ?? 99
        if (la !== lb) return la - lb
        return Number(a.id) - Number(b.id)
      })

      g.setEdge(sorted[0].parentId!, sorted[0].id)
      for (let i = 0; i < sorted.length - 1; i++) {
        g.setEdge(sorted[i].id, sorted[i + 1].id)
      }

      for (const sib of sorted) {
        verticalChainedIds.add(sib.id)
        effectiveEdges.push({
          source: sib.parentId!,
          target: sib.id,
          targetHandle: "left",
        })
      }
    }
  }

  for (const entry of sortedEntries) {
    if (entry.parentId && visibleIds.has(entry.parentId)) {
      if (!verticalChainedIds.has(entry.id)) {
        g.setEdge(entry.parentId, entry.id)
        effectiveEdges.push({
          source: entry.parentId,
          target: entry.id,
          targetHandle: "top",
        })
      }
    }
  }

  dagre.layout(g)

  const positions = new Map<string, { x: number; y: number }>()
  for (const entry of sortedEntries) {
    const node = g.node(entry.id)
    if (node) {
      positions.set(entry.id, {
        x: node.x - entry.width / 2,
        y: node.y - entry.height / 2,
      })
    }
  }

  const groups: DepartmentGroupInfo[] = []
  for (const [deptId, dept] of deptMap.entries()) {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (const r of dept.entries) {
      const pos = positions.get(r.id)
      if (pos) {
        if (pos.x < minX) minX = pos.x
        if (pos.x + r.width > maxX) maxX = pos.x + r.width
        if (pos.y < minY) minY = pos.y
        if (pos.y + r.height > maxY) maxY = pos.y + r.height
      }
    }

    if (minX !== Infinity) {
      const isSubDept =
        Boolean(dept.parentId) ||
        dept.type === "BỘ_PHẬN" ||
        dept.type === "NHÓM" ||
        Boolean(dept.level && dept.level >= 3)

      const cardSpanWidth = maxX - minX + PAD_LEFT + PAD_RIGHT
      const titleLen = dept.name ? dept.name.length : 0
      const codeLen = dept.code ? dept.code.length : 0
      const minTitleWidth =
        titleLen * 8.5 + (codeLen > 0 ? codeLen * 8.5 + 28 : 0) + 48
      const groupWidth = Math.max(cardSpanWidth, minTitleWidth)

      let customColor: string | null = null
      if (dept.metadata && typeof dept.metadata === "object") {
        const meta = dept.metadata as Record<string, unknown>
        if (typeof meta.color === "string") customColor = meta.color
        else if (typeof meta.themeColor === "string")
          customColor = meta.themeColor
      } else if (typeof dept.metadata === "string") {
        try {
          const parsed = JSON.parse(dept.metadata)
          if (typeof parsed.color === "string") customColor = parsed.color
          else if (typeof parsed.themeColor === "string")
            customColor = parsed.themeColor
        } catch {}
      }

      if (!customColor) {
        const palette = [
          "#4f46e5",
          "#2563eb",
          "#059669",
          "#0891b2",
          "#d97706",
          "#7c3aed",
          "#e11d48",
          "#0d9488",
          "#ea580c",
          "#9333ea",
          "#db2777",
          "#65a30d",
        ]
        customColor = palette[Math.abs(deptId) % palette.length]
      }

      groups.push({
        id: `dept_${deptId}`,
        title: dept.name,
        code: dept.code,
        type: dept.type,
        roleCount: dept.entries.length,
        x: minX - PAD_LEFT,
        y: minY - PAD_TOP - HEADER_H,
        width: groupWidth,
        height: maxY - minY + PAD_TOP + PAD_BOTTOM + HEADER_H,
        theme: isSubDept ? "subdepartment" : "department",
        color: customColor,
      })
    }
  }

  const groupNodes: Node[] = groups.map((g) => ({
    id: g.id,
    type: "departmentGroupNode",
    position: { x: g.x, y: g.y },
    data: g,
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { pointerEvents: "none" as const },
  }))

  const roleNodes: Node[] = sortedEntries.map((entry) => ({
    id: entry.id,
    type: "roleGroupNode",
    position: positions.get(entry.id) ?? { x: 0, y: 0 },
    data: {
      role: entry.role,
      users: entry.assignedUsers,
      childCount: entry.role.children ? entry.role.children.length : 0,
      expanded: !collapsedIds.has(entry.role.id),
      onToggleExpand: toggleCollapsed
        ? () => toggleCollapsed(entry.role.id)
        : undefined,
    },
    className: "nodrag nopan",
    draggable: false,
    selectable: false,
    zIndex: 10,
    style: { pointerEvents: "all" as const },
  }))

  let projectNodes: Node[] = []
  if (selectedProjectId && projects && projects.length > 0) {
    const selectedProject = projects.find((p) => p.id === selectedProjectId)
    if (selectedProject && (groupNodes.length > 0 || roleNodes.length > 0)) {
      let overallMinX = Infinity
      let overallMaxX = -Infinity
      let overallMinY = Infinity
      let overallMaxY = -Infinity

      for (const g of groups) {
        if (g.x < overallMinX) overallMinX = g.x
        if (g.x + g.width > overallMaxX) overallMaxX = g.x + g.width
        if (g.y < overallMinY) overallMinY = g.y
        if (g.y + g.height > overallMaxY) overallMaxY = g.y + g.height
      }

      for (const r of roleNodes) {
        const x = r.position.x
        const y = r.position.y
        const w = USER_ROLE_CARD_WIDTH
        const h = 100
        if (x < overallMinX) overallMinX = x
        if (x + w > overallMaxX) overallMaxX = x + w
        if (y < overallMinY) overallMinY = y
        if (y + h > overallMaxY) overallMaxY = y + h
      }

      if (overallMinX !== Infinity) {
        let totalAssignedUsers = 0
        const countedUserIds = new Set<number>()
        for (const entry of sortedEntries) {
          for (const u of entry.assignedUsers) {
            if (!countedUserIds.has(u.id)) {
              countedUserIds.add(u.id)
              totalAssignedUsers++
            }
          }
        }

        const projectPadding = 32
        const pX = overallMinX - projectPadding
        const pY = overallMinY - projectPadding - 24
        const pW = overallMaxX - overallMinX + projectPadding * 2
        const pH = overallMaxY - overallMinY + projectPadding * 2 + 24

        projectNodes = [
          {
            id: `project_${selectedProjectId}`,
            type: "projectGroupNode",
            position: { x: pX, y: pY },
            data: {
              projectName: selectedProject.name,
              userCount: totalAssignedUsers,
              width: pW,
              height: pH,
            },
            draggable: false,
            selectable: false,
            zIndex: -2,
            style: { pointerEvents: "none" as const },
          },
        ]
      }
    }
  }

  const flowEdges: Edge[] = effectiveEdges.map((e) => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    sourceHandle: "bottom",
    target: e.target,
    targetHandle: e.targetHandle ?? "top",
    type: "roleBus",
    style: { stroke: "#475569", strokeWidth: 1.8, opacity: 0.9 },
  }))

  return {
    nodes: [...projectNodes, ...groupNodes, ...roleNodes],
    edges: flowEdges,
  }
}
