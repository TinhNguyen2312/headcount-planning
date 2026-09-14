import dagre from "dagre"
import type { RoleTreeNodeResponse } from "@/types"
import { ROLE_NODE_HEIGHT, ROLE_NODE_WIDTH } from "./RoleNode"

export interface FlatEntry {
  id: string
  role: RoleTreeNodeResponse
  parentId: string | null
}

export interface DepartmentGroupInfo extends Record<string, unknown> {
  id: string
  title: string
  code?: string | null
  type?: string | null
  roleCount: number
  x: number
  y: number
  width: number
  height: number
  theme: "department" | "subdepartment"
  color?: string | null
}

export interface EffectiveEdgeInfo {
  source: string
  target: string
  targetHandle?: "top" | "left"
}

export interface GroupedLayoutResult {
  positions: Map<string, { x: number; y: number }>
  groups: DepartmentGroupInfo[]
  edges: EffectiveEdgeInfo[]
}

export const flattenVisible = (
  roots: RoleTreeNodeResponse[],
  collapsedIds: Set<number>,
): FlatEntry[] => {
  const entries: FlatEntry[] = []

  const visit = (role: RoleTreeNodeResponse, parentId: string | null) => {
    const id = String(role.id)
    entries.push({ id, role, parentId })
    if (!collapsedIds.has(role.id)) {
      for (const child of role.children) {
        visit(child, id)
      }
    }
  }

  for (const root of roots) {
    visit(root, null)
  }

  return entries
}

const PAD_LEFT = 16
const PAD_RIGHT = 16
const PAD_TOP = 16
const PAD_BOTTOM = 20
const HEADER_H = 36

export const layoutDepartmentGroupedTree = (
  entries: FlatEntry[],
): GroupedLayoutResult => {
  const positions = new Map<string, { x: number; y: number }>()
  const groups: DepartmentGroupInfo[] = []

  if (!entries || entries.length === 0) {
    return { positions, groups, edges: [] }
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

  const W = ROLE_NODE_WIDTH
  const H = ROLE_NODE_HEIGHT

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
      entries: FlatEntry[]
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
    g.setNode(entry.id, { width: W, height: H })
    if (entry.role.departmentId && deptMap.has(entry.role.departmentId)) {
      g.setParent(entry.id, `dept_${entry.role.departmentId}`)
    }
  }

  const visibleIds = new Set(sortedEntries.map((e) => e.id))
  const siblingGroups = new Map<string, FlatEntry[]>()

  for (const entry of sortedEntries) {
    if (entry.parentId && entry.role.departmentId) {
      const key = `${entry.parentId}_dept_${entry.role.departmentId}`
      if (!siblingGroups.has(key)) siblingGroups.set(key, [])
      siblingGroups.get(key)!.push(entry)
    }
  }

  const verticalChainedIds = new Set<string>()
  const effectiveEdges: EffectiveEdgeInfo[] = []

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

  for (const entry of sortedEntries) {
    const node = g.node(entry.id)
    if (node) {
      positions.set(entry.id, {
        x: node.x - W / 2,
        y: node.y - H / 2,
      })
    }
  }

  for (const [deptId, dept] of deptMap.entries()) {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (const r of dept.entries) {
      const pos = positions.get(r.id)
      if (pos) {
        if (pos.x < minX) minX = pos.x
        if (pos.x + W > maxX) maxX = pos.x + W
        if (pos.y < minY) minY = pos.y
        if (pos.y + H > maxY) maxY = pos.y + H
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

  return { positions, groups, edges: effectiveEdges }
}

export const layoutWithDagre = (
  entries: FlatEntry[],
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>()
  if (!entries || entries.length === 0) return positions

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: "TB",
    nodesep: 56,
    ranksep: 80,
    marginx: 32,
    marginy: 32,
  })

  for (const entry of entries) {
    graph.setNode(entry.id, {
      width: ROLE_NODE_WIDTH,
      height: ROLE_NODE_HEIGHT,
    })
  }

  const visibleIds = new Set(entries.map((e) => e.id))
  for (const entry of entries) {
    if (entry.parentId && visibleIds.has(entry.parentId)) {
      graph.setEdge(entry.parentId, entry.id)
    }
  }

  dagre.layout(graph)

  for (const entry of entries) {
    const node = graph.node(entry.id)
    if (node) {
      positions.set(entry.id, {
        x: node.x - ROLE_NODE_WIDTH / 2,
        y: node.y - ROLE_NODE_HEIGHT / 2,
      })
    }
  }

  return positions
}
