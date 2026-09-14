import dagre from "dagre"
import type { DepartmentTreeNodeResponse } from "@/types"
import { DEPARTMENT_NODE_HEIGHT, DEPARTMENT_NODE_WIDTH } from "./DepartmentNode"

export interface DepartmentFlatEntry {
  id: string
  department: DepartmentTreeNodeResponse
  parentId: string | null
}

export const flattenDepartmentTree = (
  roots: DepartmentTreeNodeResponse[],
  collapsedIds: Set<number>,
): DepartmentFlatEntry[] => {
  const entries: DepartmentFlatEntry[] = []

  const visit = (dept: DepartmentTreeNodeResponse, parentId: string | null) => {
    if (dept.status && dept.status !== "ACTIVE") {
      return
    }
    const id = String(dept.id)
    entries.push({ id, department: dept, parentId })
    if (!collapsedIds.has(dept.id) && dept.children?.length > 0) {
      for (const child of dept.children) {
        visit(child, id)
      }
    }
  }

  for (const root of roots) {
    visit(root, null)
  }

  return entries
}

const HORIZONTAL_NODE_SEP = 48
const VERTICAL_NODE_SEP = 72

export const layoutDepartmentTree = (
  entries: DepartmentFlatEntry[],
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>()

  if (!entries || entries.length === 0) {
    return positions
  }

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: "TB",
    nodesep: HORIZONTAL_NODE_SEP,
    ranksep: VERTICAL_NODE_SEP,
    marginx: 20,
    marginy: 20,
  })

  const rootEntries = entries.filter((e) => !e.parentId)
  const useVirtualRoot = rootEntries.length > 1
  const VIRTUAL_ROOT_ID = "__virtual_dept_root__"

  if (useVirtualRoot) {
    graph.setNode(VIRTUAL_ROOT_ID, { width: 1, height: 1 })
  }

  for (const entry of entries) {
    graph.setNode(entry.id, {
      width: DEPARTMENT_NODE_WIDTH,
      height: DEPARTMENT_NODE_HEIGHT,
    })
  }

  for (const entry of entries) {
    if (entry.parentId) {
      graph.setEdge(entry.parentId, entry.id)
    } else if (useVirtualRoot) {
      graph.setEdge(VIRTUAL_ROOT_ID, entry.id)
    }
  }

  dagre.layout(graph)

  for (const entry of entries) {
    const node = graph.node(entry.id)
    if (node) {
      positions.set(entry.id, {
        x: node.x - DEPARTMENT_NODE_WIDTH / 2,
        y: node.y - DEPARTMENT_NODE_HEIGHT / 2,
      })
    }
  }

  return positions
}
