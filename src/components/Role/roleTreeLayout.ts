import dagre from "dagre"
import type { RoleTreeNodeResponse } from "@/types"
import { ROLE_NODE_HEIGHT, ROLE_NODE_WIDTH } from "./RoleNode"

export const ROLE_CODES = {
  GD_PGD: "20047380",
  TRUONG_PHONG: "20047381",
  TBP_QLCD: "20047383",
  TBP_HTKT: "20047384",
  TBP_QLXD: "20047382",
  GS_QLCD: "20047386",
  GS_HTKT: "20047387",
  GS_QLXD: "20047385",
  KTS: "20047388",
  CLTD: "20047389",
  TRAC_DAC: "20047390",
  ATLD: "20047391",
  CAY_XANH: "20047392",
  THU_KY: "20047393",
} as const

export const SPECIALIST_STACK_CODES = new Set<string>([
  ROLE_CODES.KTS,
  ROLE_CODES.CLTD,
  ROLE_CODES.TRAC_DAC,
  ROLE_CODES.ATLD,
  ROLE_CODES.CAY_XANH,
  ROLE_CODES.THU_KY,
])

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

export const getRoleCode = (role?: {
  code?: string | null
  name?: string | null
  shortCode?: string | null
}): string | null => {
  if (!role) return null
  const key = identifyRoleKey(role)
  if (key) return ROLE_CODES[key]
  return role.code?.trim() || null
}

export const isSpecialistRole = (role?: {
  code?: string | null
  name?: string | null
  shortCode?: string | null
}): boolean => {
  if (!role) return false
  const code = role.code?.trim()
  if (code && SPECIALIST_STACK_CODES.has(code)) return true
  const key = identifyRoleKey(role)
  if (!key) return false
  return (
    key === "KTS" ||
    key === "CLTD" ||
    key === "TRAC_DAC" ||
    key === "ATLD" ||
    key === "CAY_XANH" ||
    key === "THU_KY"
  )
}

export interface FlatEntry {
  id: string
  role: RoleTreeNodeResponse
  parentId: string | null
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

export const layoutPcdRoleTree = (
  entries: FlatEntry[],
): Map<string, { x: number; y: number }> | null => {
  const codeToEntry = new Map<string, FlatEntry>()
  for (const entry of entries) {
    const code = getRoleCode(entry.role)
    if (code) {
      codeToEntry.set(code, entry)
    }
  }

  const hasPcdStructure =
    codeToEntry.has(ROLE_CODES.TRUONG_PHONG) &&
    (codeToEntry.has(ROLE_CODES.KTS) ||
      codeToEntry.has(ROLE_CODES.CLTD) ||
      codeToEntry.has(ROLE_CODES.TRAC_DAC) ||
      codeToEntry.has(ROLE_CODES.ATLD) ||
      codeToEntry.has(ROLE_CODES.CAY_XANH) ||
      codeToEntry.has(ROLE_CODES.THU_KY) ||
      entries.some((e) => isSpecialistRole(e.role)))

  if (!hasPcdStructure) {
    return null
  }

  const positions = new Map<string, { x: number; y: number }>()

  const COL_GAP = 72
  const LEVEL_GAP = 72
  const STACK_GAP = 24
  const COL_WIDTH = ROLE_NODE_WIDTH + COL_GAP

  const columns: {
    mainCode: string
    stackCodes?: string[]
    childCode?: string
  }[] = [
    { mainCode: ROLE_CODES.TBP_QLCD, childCode: ROLE_CODES.GS_QLCD },
    { mainCode: ROLE_CODES.TBP_HTKT, childCode: ROLE_CODES.GS_HTKT },
    { mainCode: ROLE_CODES.TBP_QLXD, childCode: ROLE_CODES.GS_QLXD },
    {
      mainCode: ROLE_CODES.KTS,
      stackCodes: [
        ROLE_CODES.KTS,
        ROLE_CODES.CLTD,
        ROLE_CODES.TRAC_DAC,
        ROLE_CODES.ATLD,
        ROLE_CODES.CAY_XANH,
        ROLE_CODES.THU_KY,
      ],
    },
  ]

  const activeColumns = columns.filter((col) =>
    col.stackCodes
      ? col.stackCodes.some((code) => codeToEntry.has(code)) ||
        entries.some((e) => isSpecialistRole(e.role))
      : codeToEntry.has(col.mainCode),
  )

  const numCols = activeColumns.length
  const totalWidth = numCols > 0 ? (numCols - 1) * COL_WIDTH : 0
  const centerX = totalWidth / 2

  const yLevel1 = 0
  const yLevel2 = yLevel1 + ROLE_NODE_HEIGHT + LEVEL_GAP
  const yLevel3 = yLevel2 + ROLE_NODE_HEIGHT + LEVEL_GAP

  const gdEntry = codeToEntry.get(ROLE_CODES.GD_PGD)
  if (gdEntry) {
    positions.set(gdEntry.id, { x: centerX, y: yLevel1 })
  }

  const tpEntry = codeToEntry.get(ROLE_CODES.TRUONG_PHONG)
  if (tpEntry) {
    positions.set(tpEntry.id, { x: centerX, y: yLevel2 })
  }

  activeColumns.forEach((col, colIdx) => {
    const colX = colIdx * COL_WIDTH

    if (col.stackCodes) {
      let currentY = yLevel3
      for (const code of col.stackCodes) {
        const entry = codeToEntry.get(code)
        if (entry && !positions.has(entry.id)) {
          positions.set(entry.id, { x: colX, y: currentY })
          currentY += ROLE_NODE_HEIGHT + STACK_GAP
        }
      }
      for (const entry of entries) {
        if (isSpecialistRole(entry.role) && !positions.has(entry.id)) {
          positions.set(entry.id, { x: colX, y: currentY })
          currentY += ROLE_NODE_HEIGHT + STACK_GAP
        }
      }
    } else {
      const entry = codeToEntry.get(col.mainCode)
      if (entry && !positions.has(entry.id)) {
        positions.set(entry.id, { x: colX, y: yLevel3 })
      }
      if (col.childCode) {
        const childEntry = codeToEntry.get(col.childCode)
        if (childEntry && !positions.has(childEntry.id)) {
          positions.set(childEntry.id, {
            x: colX,
            y: yLevel3 + ROLE_NODE_HEIGHT + LEVEL_GAP,
          })
        }
      }
    }
  })

  let nextColIdx = activeColumns.length
  for (const entry of entries) {
    if (!positions.has(entry.id)) {
      positions.set(entry.id, { x: nextColIdx * COL_WIDTH, y: yLevel3 })
      nextColIdx++
    }
  }

  return positions
}

export const layoutWithDagre = (
  entries: FlatEntry[],
): Map<string, { x: number; y: number }> => {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: "TB",
    nodesep: 32,
    ranksep: 64,
  })

  for (const entry of entries) {
    graph.setNode(entry.id, {
      width: ROLE_NODE_WIDTH,
      height: ROLE_NODE_HEIGHT,
    })
  }

  const childrenByParent = new Map<string, FlatEntry[]>()
  for (const entry of entries) {
    if (entry.parentId) {
      const list = childrenByParent.get(entry.parentId) ?? []
      list.push(entry)
      childrenByParent.set(entry.parentId, list)
    }
  }

  for (const [parentId, children] of childrenByParent.entries()) {
    const specialists = children.filter((c) => isSpecialistRole(c.role))
    const nonSpecialists = children.filter((c) => !isSpecialistRole(c.role))

    for (const child of nonSpecialists) {
      graph.setEdge(parentId, child.id)
    }

    if (specialists.length > 0) {
      graph.setEdge(parentId, specialists[0].id)
      for (let i = 0; i < specialists.length - 1; i++) {
        graph.setEdge(specialists[i].id, specialists[i + 1].id)
      }
    }
  }

  dagre.layout(graph)

  const positions = new Map<string, { x: number; y: number }>()
  for (const entry of entries) {
    const node = graph.node(entry.id)
    if (node) {
      positions.set(entry.id, {
        x: node.x - ROLE_NODE_WIDTH / 2,
        y: node.y - ROLE_NODE_HEIGHT / 2,
      })
    }
  }

  for (const [, children] of childrenByParent.entries()) {
    const specialists = children.filter((c) => isSpecialistRole(c.role))
    if (specialists.length > 0) {
      const firstPos = positions.get(specialists[0].id)
      if (firstPos) {
        let currentY = firstPos.y
        for (const spec of specialists) {
          positions.set(spec.id, { x: firstPos.x, y: currentY })
          currentY += ROLE_NODE_HEIGHT + 24
        }
      }
    }
  }

  return positions
}
