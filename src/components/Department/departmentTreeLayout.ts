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

const HORIZONTAL_NODE_SEP = 56
const VERTICAL_NODE_SEP = 72
const STACK_VERTICAL_GAP = 28
const STACK_INDENT = 60 // Độ thụt lề sang phải của node con dạng stack

export interface DepartmentLayoutResult {
  positions: Map<string, { x: number; y: number }>
  stackedChildIds: Set<string>
}

export const layoutDepartmentTree = (
  entries: DepartmentFlatEntry[],
): DepartmentLayoutResult => {
  const positions = new Map<string, { x: number; y: number }>()
  const stackedChildIds = new Set<string>()

  if (!entries || entries.length === 0) {
    return { positions, stackedChildIds }
  }

  // 1. Phân nhóm children theo parentId
  const childrenMap = new Map<string, DepartmentFlatEntry[]>()
  for (const entry of entries) {
    if (entry.parentId) {
      const list = childrenMap.get(entry.parentId) ?? []
      list.push(entry)
      childrenMap.set(entry.parentId, list)
    }
  }

  // Xác định node cha nào có > 4 children ĐANG HIỂN THỊ -> chỉ các con này mới xếp dọc
  const stackedParentMap = new Map<string, DepartmentFlatEntry[]>()
  for (const [parentId, childList] of childrenMap.entries()) {
    if (childList.length > 4) {
      stackedParentMap.set(parentId, childList)
      for (const child of childList) {
        stackedChildIds.add(child.id)
      }
    }
  }

  // 2. Dựng Dagre graph cho các node chính (không bao gồm stacked children)
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
    if (stackedChildIds.has(entry.id)) {
      continue
    }

    if (stackedParentMap.has(entry.id)) {
      const children = stackedParentMap.get(entry.id)!
      const count = children.length
      // Chiều rộng là kích thước node cha + khoảng thụt vào của node con
      const groupWidth = DEPARTMENT_NODE_WIDTH + STACK_INDENT
      // Chiều cao là node cha + khoảng cách + tất cả các node con xếp dọc bên dưới
      const groupHeight =
        DEPARTMENT_NODE_HEIGHT +
        VERTICAL_NODE_SEP +
        count * DEPARTMENT_NODE_HEIGHT +
        (count - 1) * STACK_VERTICAL_GAP

      graph.setNode(entry.id, {
        width: groupWidth,
        height: groupHeight,
      })
    } else {
      graph.setNode(entry.id, {
        width: DEPARTMENT_NODE_WIDTH,
        height: DEPARTMENT_NODE_HEIGHT,
      })
    }
  }

  // Nối các cạnh trong Dagre (giữ nguyên liên kết giữa các cấp cha con thông thường)
  for (const entry of entries) {
    if (stackedChildIds.has(entry.id)) {
      continue
    }

    if (entry.parentId && !stackedChildIds.has(entry.parentId)) {
      graph.setEdge(entry.parentId, entry.id)
    } else if (!entry.parentId && useVirtualRoot) {
      graph.setEdge(VIRTUAL_ROOT_ID, entry.id)
    }
  }

  dagre.layout(graph)

  // 3. Tính toạ độ cụ thể cho từng node
  for (const entry of entries) {
    if (stackedChildIds.has(entry.id)) {
      continue
    }

    const node = graph.node(entry.id)
    if (!node) continue

    if (stackedParentMap.has(entry.id)) {
      // Đặt node cha ở bên trái của bounding box để thẳng hàng với đường trục dọc
      const parentX = node.x - node.width / 2
      const parentY = node.y - node.height / 2
      positions.set(entry.id, { x: parentX, y: parentY })

      // Các node con xếp 1 cột dọc bên dưới node cha
      const children = stackedParentMap.get(entry.id)!
      const startY = parentY + DEPARTMENT_NODE_HEIGHT + VERTICAL_NODE_SEP
      const childX = parentX + STACK_INDENT

      children.forEach((child, index) => {
        const childY =
          startY + index * (DEPARTMENT_NODE_HEIGHT + STACK_VERTICAL_GAP)
        positions.set(child.id, { x: childX, y: childY })
      })
    } else {
      positions.set(entry.id, {
        x: node.x - DEPARTMENT_NODE_WIDTH / 2,
        y: node.y - DEPARTMENT_NODE_HEIGHT / 2,
      })
    }
  }

  return { positions, stackedChildIds }
}
